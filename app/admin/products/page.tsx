"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import ProductForm from "../../components/ProductForm";
import ProductTable from "../../components/ProductTable";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setProducts(data || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

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
      !name ||
      !description ||
      !price ||
      !category ||
      !image ||
      !stock
    ) {
      alert("Please fill all fields.");
      return;
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      image,
      stock: Number(stock),
      featured,
    };

    let error;

    if (editingId) {
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase
        .from("products")
        .insert([productData]));
    }

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    resetForm();

    await loadProducts();

    alert(
      editingId
        ? "✅ Product Updated Successfully"
        : "✅ Product Added Successfully"
    );
  }

  function handleEdit(product: any) {
    setEditingId(product.id);

    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setImage(product.image);
    setStock(String(product.stock));
    setFeatured(product.featured);
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadProducts();

    alert("🗑 Product Deleted Successfully");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        Product Management
      </h1>

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
        buttonText={editingId ? "Update Product" : "Add Product"}
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
    </main>
  );
}