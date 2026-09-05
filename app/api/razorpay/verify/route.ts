import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    console.log(
      "RAZORPAY VERIFY API CALLED"
    );

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
        {
          status: 400,
        }
      );
    }

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay secret is missing on server.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature =
      crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    const isValid =
      expectedSignature ===
      razorpay_signature;

    console.log(
      "RAZORPAY SIGNATURE VALID:",
      isValid
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Razorpay signature.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Payment verified successfully.",
    });
  } catch (error) {
    console.error(
      "RAZORPAY VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Payment verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}