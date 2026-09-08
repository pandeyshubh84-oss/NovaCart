import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

/* =====================================================
   TYPES
===================================================== */

type CartItem = {
  id: string;
  quantity: number;
};

/* =====================================================
   POST /api/razorpay/order
===================================================== */

export async function POST(req: Request) {
  try {
    /* =================================================
       RAZORPAY CONFIGURATION
    ================================================= */

    if (!razorpay) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay server credentials are missing. Check .env.local.",
        },
        { status: 500 }
      );
    }

    /* =================================================
       READ REQUEST
    ================================================= */

    const body = await req.json();

    const items: CartItem[] =
      Array.isArray(body?.items)
        ? body.items
        : [];

    /* =================================================
       CART VALIDATION
    ================================================= */

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       VALIDATE EACH ITEM
    ================================================= */

    for (const item of items) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !item.id.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product in cart.",
          },
          { status: 400 }
        );
      }

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }
    }

    /* =================================================
       PREVENT DUPLICATE PRODUCTS
    ================================================= */

    const productIds = items.map((item) =>
      item.id.trim()
    );

    const uniqueProductIds = [
      ...new Set(productIds),
    ];

    if (
      uniqueProductIds.length !==
      productIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duplicate products are not allowed.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       FETCH REAL PRODUCT DATA
    ================================================= */

    const {
      data: products,
      error,
    } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, price, stock"
      )
      .in(
        "id",
        uniqueProductIds
      );

    if (error) {
      console.error(
        "PRODUCT PRICE LOOKUP ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify products.",
        },
        { status: 500 }
      );
    }

    /* =================================================
       CHECK PRODUCT AVAILABILITY
    ================================================= */

    if (
      !products ||
      products.length !==
        uniqueProductIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products are no longer available.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       SERVER-SIDE TOTAL
    ================================================= */

    let total = 0;

    const verifiedItems = [];

    for (const item of items) {
      const product =
        products.find(
          (product) =>
            String(product.id) ===
            String(item.id)
        );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product not found.",
          },
          { status: 400 }
        );
      }

      const quantity =
        Number(item.quantity);

      const price =
        Number(product.price);

      const stock =
        Number(product.stock);

      /* ===============================================
         PRICE VALIDATION
      =============================================== */

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Invalid price for "${product.name}".`,
          },
          { status: 400 }
        );
      }

      /* ===============================================
         STOCK VALIDATION
      =============================================== */

      if (
        !Number.isFinite(stock) ||
        stock <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `"${product.name}" is out of stock.`,
          },
          { status: 400 }
        );
      }

      /* ===============================================
         QUANTITY vs STOCK
      =============================================== */

      if (quantity > stock) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Only ${stock} unit${
                stock === 1
                  ? ""
                  : "s"
              } of "${product.name}" available.`,
          },
          { status: 400 }
        );
      }

      /* ===============================================
         ITEM TOTAL
      =============================================== */

      const itemTotal =
        price * quantity;

      if (
        !Number.isFinite(itemTotal) ||
        itemTotal <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid order amount.",
          },
          { status: 400 }
        );
      }

      total += itemTotal;

      /* ===============================================
         VERIFIED ITEM
      =============================================== */

      verifiedItems.push({
        id: product.id,
        name: product.name,
        price,
        quantity,
      });
    }

    /* =================================================
       FINAL TOTAL VALIDATION
    ================================================= */

    if (
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order total.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       CONVERT INR → PAISE
    ================================================= */

    const amountInPaise =
      Math.round(total * 100);

    if (
      !Number.isSafeInteger(
        amountInPaise
      ) ||
      amountInPaise <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    /* =================================================
       CREATE RAZORPAY ORDER
    ================================================= */

    const order =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: "INR",

        receipt:
          `novacart_${Date.now()}`,

        notes: {
          source: "NovaCart",
          items: String(
            verifiedItems.length
          ),
          total_items: String(
            verifiedItems.reduce(
              (sum, item) =>
                sum + item.quantity,
              0
            )
          ),
        },
      });

    /* =================================================
       SERVER LOG
    ================================================= */

    console.log(
      "RAZORPAY ORDER CREATED:",
      order.id
    );

    console.log(
      "SERVER VERIFIED ITEMS:",
      verifiedItems
    );

    console.log(
      "SERVER VERIFIED TOTAL:",
      total
    );

    /* =================================================
       RESPONSE
    ================================================= */

    return NextResponse.json({
      success: true,

      order,

      verifiedTotal: total,

      verifiedItems,
    });
  } catch (error: any) {
    console.error(
      "RAZORPAY ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}