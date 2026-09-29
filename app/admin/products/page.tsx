"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

import ProductForm from "../../components/ProductForm";
import ProductTable from "../../components/ProductTable";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  featured: boolean;
};

export default function AdminProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  /* =========================================================
     ADMIN AUTH
  ========================================================= */

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

     await loadProducts();

      setLoading(false);
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error);

      alert("Unable to verify admin access.");

      router.replace("/login");
    }
  }

  /* =========================================================
     GET SESSION TOKEN
  ========================================================= */

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    return session.access_token;
  }

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts() {
    try {
      const token = await getAccessToken();

      const response = await fetch("/api/admin/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load products."
        );
      }

      setProducts(result.products || []);
    } catch (error: any) {
      console.error("LOAD PRODUCTS ERROR:", error);

      alert(
        error?.message || "Unable to load products."
      );
    }
  }

  /* =========================================================
     RESET FORM
  ========================================================= */

  function resetForm() {
    setEditingId(null);

    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage("");
    setStock("");
    setFeatured(false);
  }

  /* =========================================================
     VALIDATE PRODUCT
  ========================================================= */

  function validateProduct() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!trimmedName) {
      alert("Please enter a product name.");
      return false;
    }

    if (!trimmedCategory) {
      alert("Please select a product category.");
      return false;
    }

    if (
      !price ||
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("Please enter a valid price greater than ₹0.");
      return false;
    }

    if (
      stock === "" ||
      Number.isNaN(numericStock) ||
      numericStock < 0 ||
      !Number.isInteger(numericStock)
    ) {
      alert(
        "Stock must be a whole number and cannot be negative."
      );
      return false;
    }

    if (!trimmedDescription) {
      alert("Please enter a product description.");
      return false;
    }

    if (!image.trim()) {
      alert("Please upload a product image.");
      return false;
    }

    return true;
  }

  /* =========================================================
     ADD / UPDATE PRODUCT
  ========================================================= */

  async function addProduct() {
    if (saving) {
      return;
    }

    if (!validateProduct()) {
      return;
    }

    try {
      setSaving(true);

      const token = await getAccessToken();

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        image: image.trim(),
        stock: Number(stock),
        featured,
      };

      /* =====================================================
         UPDATE PRODUCT
      ===================================================== */

      if (editingId) {
        const response = await fetch(
          "/api/admin/products",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: editingId,
              ...productData,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to update product."
          );
        }

        await loadProducts();

        resetForm();

        alert("✅ Product Updated Successfully");

        return;
      }

      /* =====================================================
         ADD PRODUCT
      ===================================================== */

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to add product."
        );
      }

      await loadProducts();

      resetForm();

      alert("✅ Product Added Successfully");
    } catch (error: any) {
      console.error("PRODUCT SAVE ERROR:", error);

      alert(
        error?.message ||
          "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  function handleEdit(product: Product) {
    setEditingId(product.id);

    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(String(product.price ?? ""));
    setCategory(product.category || "");
    setImage(product.image || "");
    setStock(String(product.stock ?? 0));
    setFeatured(Boolean(product.featured));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = await getAccessToken();

      const response = await fetch(
        "/api/admin/products",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to delete product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }

      alert("🗑️ Product Deleted Successfully");
    } catch (error: any) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete product."
      );
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">
            🔐
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Verifying Admin Access...
          </h2>

          <p className="text-gray-500 mt-2">
            Loading products securely.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center text-3xl">
                  📦
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Product Management
                  </h1>

                  <p className="text-green-600 font-semibold mt-1">
                    ✓ Admin Access Verified
                  </p>
                </div>

              </div>

              <p className="text-gray-600 mt-4">
                Securely manage your NovaCart products.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                ← Admin Dashboard
              </button>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();

                  router.replace("/login");
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                Logout
              </button>

            </div>

          </div>
        </div>

        {/* ===================================================
            PRODUCT FORM
        =================================================== */}

        <ProductForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          price={price}
          setPrice={setPrice}
          category={category}
          setCategory={setCategory}
          image={image}
          setImage={setImage}
          stock={stock}
          setStock={setStock}
          featured={featured}
          setFeatured={setFeatured}
          onSubmit={addProduct}
          buttonText={
            editingId
              ? "Update Product"
              : "Add Product"
          }
          isEditing={editingId !== null}
          onCancel={resetForm}
        />

        {/* ===================================================
            PRODUCTS TABLE
        =================================================== */}

        <div className="mt-10">
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* ===================================================
            SECURITY NOTICE
        =================================================== */}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex gap-3">

            <span className="text-xl">
              🔒
            </span>

            <div>
              <h3 className="font-bold text-blue-900">
                Product Security Active
              </h3>

              <p className="text-sm text-blue-800 mt-1">
                Product management requests are
                verified server-side. Only the
                authorized NovaCart admin account
                can add, edit or delete products.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}