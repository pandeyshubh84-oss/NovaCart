import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

function getToken(req: Request) {
  const authorization =
    req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization
    .slice("Bearer ".length)
    .trim();
}

export async function GET(req: Request) {
  try {
    const token = getToken(req);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error(
        "MY ORDERS AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired login session.",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        customer_name,
        phone,
        email,
        address,
        city,
        pincode,
        payment_method,
        total,
        products,
        status,
        payment_status,
        created_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(50);

    if (error) {
      console.error(
        "MY ORDERS DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load your orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    console.error(
      "MY ORDERS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}