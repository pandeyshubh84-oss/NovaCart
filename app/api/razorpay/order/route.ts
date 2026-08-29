import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    console.log("ORDER API CALLED");
    const { amount } = await req.json();
    console.log("Amount:", amount);

    // Validation
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount",
        },
        {
          status: 400,
        }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

console.log("ORDER CREATED:");
console.log(order);

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error("RAZORPAY ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.error?.description || "Unable to create order",
      },
      {
        status: 500,
      }
    );
  }
}