import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

/* =====================================================
   TYPES
===================================================== */

type CartItem = {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  description?: string;
  quantity?: number;
};

type CustomerData = {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
};

/* =====================================================
   CUSTOMER VALIDATION
===================================================== */

function validateCustomer(
  customer: CustomerData
) {
  return Boolean(
    customer.customer_name?.trim() &&
      customer.phone?.trim() &&
      customer.email?.trim() &&
      customer.address?.trim() &&
      customer.city?.trim() &&
      customer.pincode?.trim()
  );
}

/* =====================================================
   QUANTITY VALIDATION
===================================================== */

function getQuantity(
  item: CartItem
) {
  const quantity = Number(
    item.quantity ?? 1
  );

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 50
  ) {
    throw new Error(
      "Invalid product quantity."
    );
  }

  return quantity;
}

/* =====================================================
   AUTHENTICATED USER
===================================================== */

async function getAuthenticatedUser(
  req: Request
) {
  const authorization =
    req.headers.get("authorization");

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null;
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (error || !user) {
    console.error(
      "ORDER AUTH ERROR:",
      error
    );

    return null;
  }

  return user;
}

/* =====================================================
   SERVER PRICE + STOCK VERIFICATION
===================================================== */

async function calculateServerTotal(
  items: CartItem[]
) {
  const productIds = [
    ...new Set(
      items
        .map((item) => item?.id)
        .filter(
          (
            id
          ): id is string =>
            typeof id ===
              "string" &&
            id.trim().length > 0
        )
    ),
  ];

  if (productIds.length === 0) {
    throw new Error(
      "Invalid cart."
    );
  }

  const {
    data: products,
    error,
  } =
    await supabaseAdmin
      .from("products")
      .select(
        "id, name, description, category, price, stock, image"
      )
      .in(
        "id",
        productIds
      );

  if (error) {
    console.error(
      "PRODUCT LOOKUP ERROR:",
      error
    );

    throw new Error(
      "Unable to verify products."
    );
  }

  if (
    !products ||
    products.length !==
      productIds.length
  ) {
    throw new Error(
      "One or more products are no longer available."
    );
  }

  let total = 0;

  const orderProducts: any[] =
    [];

  for (const item of items) {
    const product =
      products.find(
        (p) =>
          String(p.id) ===
          String(item.id)
      );

    if (!product) {
      throw new Error(
        "Product not found."
      );
    }

    const quantity =
      getQuantity(item);

    const stock =
      Number(product.stock);

    const price =
      Number(product.price);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        `Invalid price for product "${product.name || "item"}".`
      );
    }

    if (stock < quantity) {
      throw new Error(
        `${product.name || "Product"} has only ${stock} item(s) in stock.`
      );
    }

    total +=
      price * quantity;

    orderProducts.push({
      id: product.id,
      name: product.name,
      price,
      quantity,
      image: product.image,
    });
  }

  total =
    Math.round(total * 100) /
    100;

  if (
    !Number.isFinite(total) ||
    total <= 0
  ) {
    throw new Error(
      "Invalid order total."
    );
  }

  return {
    total,
    productIds,
    orderProducts,
  };
}

/* =====================================================
   POST /api/orders
===================================================== */

export async function POST(
  req: Request
) {
  try {
    console.log(
      "CREATE ORDER API CALLED"
    );

    /* =================================================
       1. AUTHENTICATION
    ================================================= */

    const user =
      await getAuthenticatedUser(
        req
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    /* =================================================
       2. READ REQUEST
    ================================================= */

    const body =
      await req.json();

    const {
      customer_name,
      phone,
      email,
      address,
      city,
      pincode,
      payment_method,
      products: cartItems,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const customer: CustomerData =
      {
        customer_name,
        phone,
        email,
        address,
        city,
        pincode,
      };

    /* =================================================
       3. CUSTOMER VALIDATION
    ================================================= */

    if (
      !validateCustomer(
        customer
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please fill all customer details.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       4. CART VALIDATION
    ================================================= */

    if (
      !Array.isArray(
        cartItems
      ) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    if (
      cartItems.length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many different products in cart.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       5. NORMALIZE CART
    ================================================= */

    const cleanCartItems: CartItem[] =
      cartItems.map(
        (item: any) => ({
          id: String(
            item?.id ?? ""
          ).trim(),

          name:
            typeof item?.name ===
            "string"
              ? item.name
              : undefined,

          price:
            item?.price !==
            undefined
              ? Number(
                  item.price
                )
              : undefined,

          image:
            typeof item?.image ===
            "string"
              ? item.image
              : undefined,

          description:
            typeof item?.description ===
            "string"
              ? item.description
              : undefined,

          quantity:
            Number(
              item?.quantity ??
                1
            ),
        })
      );

    for (const item of
      cleanCartItems) {
      if (!item.id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product in cart.",
          },
          { status: 400 }
        );
      }

      try {
        getQuantity(item);
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            message:
              error?.message ||
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }
    }

    /* =================================================
       6. SERVER PRICE + STOCK VERIFICATION
    ================================================= */

    const {
      total,
      productIds,
      orderProducts,
    } =
      await calculateServerTotal(
        cleanCartItems
      );

    console.log(
      "SERVER VERIFIED TOTAL:",
      total
    );

    /* =================================================
       7. PAYMENT METHOD
    ================================================= */

    const finalPaymentMethod =
      String(
        payment_method || ""
      ).trim();

    if (
      finalPaymentMethod !==
        "COD" &&
      finalPaymentMethod !==
        "Razorpay"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       8. COD
    ================================================= */

    if (
      finalPaymentMethod ===
      "COD"
    ) {
      console.log(
        "PROCESSING COD ORDER"
      );

      const {
        data: order,
        error: orderError,
      } =
        await supabaseAdmin
          .from("orders")
          .insert({
            user_id: user.id,

            customer_name:
              customer.customer_name.trim(),

            phone:
              customer.phone.trim(),

            email:
              customer.email.trim(),

            address:
              customer.address.trim(),

            city:
              customer.city.trim(),

            pincode:
              customer.pincode.trim(),

            payment_method:
              "COD",

            total,

            products:
              orderProducts,

            status:
              "Processing",

            payment_status:
              "Pending",
          })
          .select()
          .single();

      if (orderError) {
        console.error(
          "COD ORDER DATABASE ERROR:",
          orderError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to create COD order.",
          },
          { status: 500 }
        );
      }

      /* -----------------------------------------------
         REDUCE STOCK
      ----------------------------------------------- */

      for (const item of
        cleanCartItems) {
        const product =
          productIds.find(
            (id) =>
              String(id) ===
              String(item.id)
          );

        if (!product) {
          continue;
        }

        const originalProduct =
          (
            await supabaseAdmin
              .from("products")
              .select(
                "id, stock"
              )
              .eq(
                "id",
                item.id
              )
              .single()
          ).data;

        if (!originalProduct) {
          continue;
        }

        const newStock =
          Number(
            originalProduct.stock
          ) -
          getQuantity(item);

        const {
          error: stockError,
        } =
          await supabaseAdmin
            .from("products")
            .update({
              stock:
                newStock,
            })
            .eq(
              "id",
              item.id
            );

        if (stockError) {
          console.error(
            "COD STOCK UPDATE ERROR:",
            stockError
          );
        }
      }

      console.log(
        "COD ORDER CREATED:",
        order.id
      );

      return NextResponse.json({
        success: true,
        message:
          "COD order placed successfully.",
        order,
      });
    }

    /* =================================================
       9. RAZORPAY CONFIGURATION
    ================================================= */

    if (
      !razorpay ||
      !razorpayKeySecret
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay server configuration is missing.",
        },
        { status: 500 }
      );
    }

    /* =================================================
       10. RAZORPAY PAYMENT DETAILS
    ================================================= */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Razorpay payment details.",
        },
        { status: 400 }
      );
    }

    console.log(
      "VERIFYING RAZORPAY PAYMENT:",
      razorpay_payment_id
    );

    /* =================================================
       11. DUPLICATE PAYMENT CHECK
    ================================================= */

    const {
      data: existingOrder,
      error: existingError,
    } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq(
          "razorpay_order_id",
          razorpay_order_id
        )
        .maybeSingle();

    if (existingError) {
      console.error(
        "EXISTING ORDER CHECK ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify payment order.",
        },
        { status: 500 }
      );
    }

    if (existingOrder) {
      if (
        String(
          existingOrder.user_id
        ) !==
        String(user.id)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not authorized to access this order.",
          },
          { status: 403 }
        );
      }

      console.log(
        "DUPLICATE RAZORPAY ORDER:",
        razorpay_order_id
      );

      return NextResponse.json({
        success: true,
        message:
          "Payment already processed.",
        order:
          existingOrder,
        duplicate: true,
      });
    }

    /* =================================================
       12. VERIFY RAZORPAY SIGNATURE
    ================================================= */

    const signatureBody =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpayKeySecret
        )
        .update(
          signatureBody
        )
        .digest("hex");

    const providedSignature =
      String(
        razorpay_signature
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const providedBuffer =
      Buffer.from(
        providedSignature,
        "utf8"
      );

    const signatureValid =
      expectedBuffer.length ===
        providedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        providedBuffer
      );

    console.log(
      "RAZORPAY SIGNATURE VALID:",
      signatureValid
    );

    if (!signatureValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Razorpay payment signature.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       13. FETCH RAZORPAY ORDER
    ================================================= */

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    const expectedAmount =
      Math.round(
        total * 100
      );

    console.log(
      "RAZORPAY AMOUNT:",
      razorpayOrder.amount
    );

    console.log(
      "EXPECTED AMOUNT:",
      expectedAmount
    );

    if (
      Number(
        razorpayOrder.amount
      ) !== expectedAmount
    ) {
      console.error(
        "RAZORPAY AMOUNT MISMATCH"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       14. FETCH RAZORPAY PAYMENT
    ================================================= */

    const razorpayPayment =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    if (
      String(
        razorpayPayment.order_id
      ) !==
      String(
        razorpay_order_id
      )
    ) {
      console.error(
        "RAZORPAY ORDER ID MISMATCH"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment does not belong to this order.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       15. PAYMENT STATUS
    ================================================= */

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      console.error(
        "RAZORPAY PAYMENT NOT CAPTURED:",
        razorpayPayment.status
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment has not been captured yet.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       16. SAVE PAID ORDER
    ================================================= */

    const {
      data: order,
      error: orderError,
    } =
      await supabaseAdmin
        .from("orders")
        .insert({
          user_id: user.id,

          customer_name:
            customer.customer_name.trim(),

          phone:
            customer.phone.trim(),

          email:
            customer.email.trim(),

          address:
            customer.address.trim(),

          city:
            customer.city.trim(),

          pincode:
            customer.pincode.trim(),

          payment_method:
            "Razorpay",

          total,

          products:
            orderProducts,

          status:
            "Processing",

          payment_status:
            "Paid",

          razorpay_order_id,

          razorpay_payment_id,

          razorpay_signature,
        })
        .select()
        .single();

    if (orderError) {
      console.error(
        "PAID ORDER DATABASE ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verified, but order could not be saved. Please contact support.",
        },
        { status: 500 }
      );
    }

    /* =================================================
       17. REDUCE STOCK
    ================================================= */

    for (const item of
      cleanCartItems) {
      const quantity =
        getQuantity(item);

      const {
        data: currentProduct,
        error: fetchStockError,
      } =
        await supabaseAdmin
          .from("products")
          .select(
            "id, stock"
          )
          .eq(
            "id",
            item.id
          )
          .single();

      if (
        fetchStockError ||
        !currentProduct
      ) {
        console.error(
          "STOCK FETCH ERROR:",
          fetchStockError
        );

        continue;
      }

      const newStock =
        Number(
          currentProduct.stock
        ) - quantity;

      const {
        error:
          stockUpdateError,
      } =
        await supabaseAdmin
          .from("products")
          .update({
            stock:
              newStock,
          })
          .eq(
            "id",
            item.id
          );

      if (stockUpdateError) {
        console.error(
          "STOCK UPDATE ERROR:",
          stockUpdateError
        );
      }
    }

    /* =================================================
       18. SUCCESS
    ================================================= */

    console.log(
      "ORDER CREATED SUCCESSFULLY:",
      order.id
    );

    return NextResponse.json({
      success: true,
      message:
        "Payment verified and order placed successfully.",
      order,
    });
  } catch (error: any) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while processing the order.",
      },
      { status: 500 }
    );
  }
}