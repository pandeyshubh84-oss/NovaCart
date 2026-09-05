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
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    await loadProducts();

    setLoading(false);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
      alert(error.message);
      return;
    }

    console.log("PRODUCTS LOADED:", data);

    setProducts(data || []);
  }

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

  async function addProduct() {
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !category.trim() ||
      !image.trim() ||
      !stock
    ) {
      alert("Please fill all fields.");
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      image: image.trim(),
      stock: Number(stock),
      featured,
    };

    const currentEditingId = editingId;

    // ==========================================
    // UPDATE EXISTING PRODUCT
    // ==========================================
    if (currentEditingId) {
      console.log("=================================");
      console.log("UPDATING PRODUCT");
      console.log("PRODUCT ID:", currentEditingId);
      console.log("NEW PRODUCT DATA:", productData);
      console.log("=================================");

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", currentEditingId);

      console.log("UPDATE ERROR:", error);

      if (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        alert(error.message);
        return;
      }

      console.log("UPDATE REQUEST COMPLETED SUCCESSFULLY");

      // Reload products directly from Supabase
      await loadProducts();

      resetForm();

      alert("✅ Product Updated Successfully");

      return;
    }

    // ==========================================
    // ADD NEW PRODUCT
    // ==========================================
    console.log("=================================");
    console.log("ADDING NEW PRODUCT");
    console.log("PRODUCT DATA:", productData);
    console.log("=================================");

    const { error } = await supabase
      .from("products")
      .insert([productData]);

    console.log("INSERT ERROR:", error);

    if (error) {
      console.error("ADD PRODUCT ERROR:", error);
      alert(error.message);
      return;
    }

    await loadProducts();

    resetForm();

    alert("✅ Product Added Successfully");
  }

  function handleEdit(product: Product) {
    console.log("=================================");
    console.log("EDIT PRODUCT");
    console.log(product);
    console.log("=================================");

    setEditingId(product.id);

    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setImage(product.image);
    setStock(String(product.stock));
    setFeatured(product.featured);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    console.log("DELETING PRODUCT:", id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    console.log("DELETE ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    await loadProducts();

    alert("🗑️ Product Deleted Successfully");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold">
          Loading Products...
        </h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Product Management
        </h1>

        <p className="text-gray-600 mb-8">
          Add, edit and manage your NovaCart products.
        </p>

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

        <div className="mt-10">

          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

        </div>

      </div>

    </main>
  );
}