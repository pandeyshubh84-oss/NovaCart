import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    : null;

export async function POST(req: Request) {
  try {
    console.log("=================================");
    console.log("RAZORPAY ORDER API CALLED");
    console.log("=================================");

    if (!razorpay) {
      console.error(
        "Razorpay credentials are missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay server credentials are missing. Check .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await req.json();

    const amount = Number(body?.amount);

    console.log("Amount received:", amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        {
          status: 400,
        }
      );
    }

    const amountInPaise =
      Math.round(amount * 100);

    const order =
      await razorpay.orders.create({
        amount: amountInPaise,

        currency: "INR",

        receipt: `novacart_${Date.now()}`,

        notes: {
          source: "NovaCart",
        },
      });

    console.log(
      "RAZORPAY ORDER CREATED:",
      order.id
    );

    return NextResponse.json({
      success: true,
      order,
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
      {
        status: 500,
      }
    );
  }
}