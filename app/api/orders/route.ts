import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

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

function validateCustomer(data: CustomerData) {
  return Boolean(
    data.customer_name?.trim() &&
      data.phone?.trim() &&
      data.email?.trim() &&
      data.address?.trim() &&
      data.city?.trim() &&
      data.pincode?.trim()
  );
}

function getQuantity(item: CartItem) {
  const quantity = Number(item.quantity ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    throw new Error("Invalid product quantity.");
  }

  return quantity;
}

async function calculateServerTotal(items: CartItem[]) {
  const productIds = [
    ...new Set(
      items
        .map((item) => item?.id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0
        )
    ),
  ];

  if (productIds.length === 0) {
    throw new Error("Invalid cart.");
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, price, stock")
    .in("id", productIds);

  if (error) {
    console.error("PRODUCT LOOKUP ERROR:", error);
    throw new Error("Unable to verify products.");
  }

  if (!products || products.length !== productIds.length) {
    throw new Error(
      "One or more products are no longer available."
    );
  }

  let total = 0;

  // Expanded IDs are used by the stock reservation RPC.
  // Example: quantity 3 => [productId, productId, productId]
  const stockReservationIds: string[] = [];

  for (const item of items) {
    const product = products.find(
      (p) => String(p.id) === String(item.id)
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    const quantity = getQuantity(item);
    const stock = Number(product.stock);
    const price = Number(product.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `Invalid price for product "${item.name || "item"}".`
      );
    }

    if (stock < quantity) {
      throw new Error(
        `Only ${stock} unit(s) of "${item.name || "item"}" are available.`
      );
    }

    total += price * quantity;

    for (let i = 0; i < quantity; i++) {
      stockReservationIds.push(String(product.id));
    }
  }

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Invalid order total.");
  }

  return {
    total,
    productIds,
    stockReservationIds,
  };
}

async function reserveStock(productIds: string[]) {
  const { data, error } = await supabaseAdmin.rpc(
    "reserve_product_stock",
    {
      p_product_ids: productIds,
    }
  );

  if (error) {
    console.error("STOCK RESERVATION ERROR:", error);
    throw new Error("Unable to reserve product stock.");
  }

  if (data !== true) {
    throw new Error(
      "One or more products are no longer available."
    );
  }
}

async function releaseStock(productIds: string[]) {
  if (!productIds.length) return;

  const { error } = await supabaseAdmin.rpc(
    "release_product_stock",
    {
      p_product_ids: productIds,
    }
  );

  if (error) {
    console.error("STOCK RELEASE ERROR:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    const customer: CustomerData = {
      customer_name,
      phone,
      email,
      address,
      city,
      pincode,
    };

    // =====================================================
    // CUSTOMER VALIDATION
    // =====================================================

    if (!validateCustomer(customer)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all customer details.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // CART VALIDATION
    // =====================================================

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // SERVER PRICE + STOCK VERIFICATION
    // =====================================================

    const {
      total,
      productIds,
      stockReservationIds,
    } = await calculateServerTotal(cartItems);

    // =====================================================
    // COD
    // =====================================================

    if (payment_method === "COD") {
      await reserveStock(stockReservationIds);

      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert([
          {
            customer_name: customer.customer_name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            address: customer.address.trim(),
            city: customer.city.trim(),
            pincode: customer.pincode.trim(),
            payment_method: "COD",
            total,
            products: cartItems,
            payment_status: "Pending",
            status: "Pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(
          "COD ORDER DATABASE ERROR:",
          error
        );

        await releaseStock(stockReservationIds);

        return NextResponse.json(
          {
            success: false,
            message: "Unable to save COD order.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "COD order placed successfully.",
        order: data,
      });
    }

    // =====================================================
    // RAZORPAY
    // =====================================================

    if (payment_method === "Razorpay") {
      if (!razorpay || !razorpayKeySecret) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Razorpay server configuration is missing.",
          },
          { status: 500 }
        );
      }

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

      // ===================================================
      // DUPLICATE PAYMENT CHECK
      // ===================================================

      const { data: existingOrder, error: existingError } =
        await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("razorpay_order_id", razorpay_order_id)
          .maybeSingle();

      if (existingError) {
        console.error(
          "EXISTING ORDER CHECK ERROR:",
          existingError
        );

        return NextResponse.json(
          {
            success: false,
            message: "Unable to verify payment order.",
          },
          { status: 500 }
        );
      }

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          message: "Payment already processed.",
          order: existingOrder,
          duplicate: true,
        });
      }

      // ===================================================
      // VERIFY PAYMENT SIGNATURE
      // ===================================================

      const signatureBody =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(signatureBody)
        .digest("hex");

      if (
        !crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(String(razorpay_signature))
        )
      ) {
        console.error(
          "INVALID RAZORPAY SIGNATURE"
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Razorpay payment signature.",
          },
          { status: 400 }
        );
      }

      // ===================================================
      // VERIFY RAZORPAY ORDER AMOUNT
      // ===================================================

      const razorpayOrder =
        await razorpay.orders.fetch(
          razorpay_order_id
        );

      const expectedAmount =
        Math.round(total * 100);

      if (
        Number(razorpayOrder.amount) !==
        expectedAmount
      ) {
        console.error(
          "RAZORPAY AMOUNT MISMATCH",
          {
            razorpayAmount:
              razorpayOrder.amount,
            expectedAmount,
          }
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

      // ===================================================
      // VERIFY PAYMENT BELONGS TO THIS ORDER
      // ===================================================

      const razorpayPayment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      if (
        String(razorpayPayment.order_id) !==
        String(razorpay_order_id)
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

      // ===================================================
      // VERIFY PAYMENT AMOUNT
      // ===================================================

      if (
        Number(razorpayPayment.amount) !==
        expectedAmount
      ) {
        console.error(
          "RAZORPAY PAYMENT AMOUNT MISMATCH"
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment amount verification failed.",
          },
          { status: 400 }
        );
      }

      // ===================================================
      // VERIFY CAPTURED STATUS
      // ===================================================

      if (razorpayPayment.status !== "captured") {
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

      // ===================================================
      // RESERVE STOCK
      // ===================================================

      try {
        await reserveStock(stockReservationIds);
      } catch (stockError: any) {
        console.error(
          "RAZORPAY STOCK ERROR:",
          stockError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment received, but the product is no longer available. Please contact support for a refund.",
          },
          { status: 409 }
        );
      }

      // ===================================================
      // SAVE PAID ORDER
      // ===================================================

      const { data, error } = await supabaseAdmin
        .from("orders")
        .insert([
          {
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

            payment_method: "Razorpay",

            total,

            products: cartItems,

            payment_status: "Paid",

            status: "Processing",

            razorpay_payment_id,

            razorpay_order_id,
          },
        ])
        .select()
        .single();

      // ===================================================
      // ORDER SAVE FAILED
      // ===================================================

      if (error) {
        console.error(
          "PAID ORDER DATABASE ERROR:",
          error
        );

        await releaseStock(stockReservationIds);

        // Another request may have created the order
        // at almost the same time.
        if (error.code === "23505") {
          const { data: duplicateOrder } =
            await supabaseAdmin
              .from("orders")
              .select("*")
              .eq(
                "razorpay_order_id",
                razorpay_order_id
              )
              .maybeSingle();

          if (duplicateOrder) {
            return NextResponse.json({
              success: true,
              message: "Payment already processed.",
              order: duplicateOrder,
              duplicate: true,
            });
          }
        }

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment verified, but order could not be saved. Please contact support.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Payment verified and order placed successfully.",
        order: data,
      });
    }

    // =====================================================
    // INVALID PAYMENT METHOD
    // =====================================================

    return NextResponse.json(
      {
        success: false,
        message: "Invalid payment method.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(
      "ORDERS API ERROR:",
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