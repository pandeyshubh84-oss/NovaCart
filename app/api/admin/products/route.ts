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
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ADMIN PRODUCTS LOAD ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load products.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: data || [],
    });
  } catch (error) {
    console.error("ADMIN PRODUCTS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
      name,
      description,
      category,
      price,
      stock,
      image,
      featured,
    } = body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !image?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all product fields.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product stock.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([
        {
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          price: numericPrice,
          stock: numericStock,
          image: image.trim(),
          featured: Boolean(featured),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("ADMIN PRODUCT CREATE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product added successfully.",
      product: data,
    });
  } catch (error: any) {
    console.error("ADMIN PRODUCTS POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to create product.",
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
      name,
      description,
      category,
      price,
      stock,
      image,
      featured,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (
      !name?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !image?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all product fields.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product price.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product stock.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: numericPrice,
        stock: numericStock,
        image: image.trim(),
        featured: Boolean(featured),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("ADMIN PRODUCT UPDATE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: data,
    });
  } catch (error: any) {
    console.error("ADMIN PRODUCTS PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to update product.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("ADMIN PRODUCT DELETE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("ADMIN PRODUCTS DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to delete product.",
      },
      { status: 500 }
    );
  }
}