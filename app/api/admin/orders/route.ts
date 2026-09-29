import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAdminUser } from "../../../lib/adminAuth";

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ADMIN ORDERS LOAD ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    console.error("ADMIN ORDERS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      id,
      payment_status,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};

    if (payment_status !== undefined) {
      const allowedPaymentStatuses = [
        "Pending",
        "Paid",
        "Failed",
      ];

      if (
        !allowedPaymentStatuses.includes(
          payment_status
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          { status: 400 }
        );
      }

      updateData.payment_status =
        payment_status;
    }

    if (status !== undefined) {
      const allowedOrderStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedOrderStatuses.includes(status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nothing to update.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
      console.error(
        "ADMIN ORDER UPDATE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to update order.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: data,
    });
  } catch (error) {
    console.error(
      "ADMIN ORDERS PATCH ERROR:",
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