"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type ProductFormProps = {
  name: string;
  setName: (value: string) => void;

  description: string;
  setDescription: (value: string) => void;

  price: string;
  setPrice: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  image: string;
  setImage: (value: string) => void;

  stock: string;
  setStock: (value: string) => void;

  featured: boolean;
  setFeatured: (value: boolean) => void;

  onSubmit: () => void;

  buttonText?: string;

  isEditing?: boolean;

  onCancel?: () => void;
};

export default function ProductForm({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  category,
  setCategory,
  image,
  setImage,
  stock,
  setStock,
  featured,
  setFeatured,
  onSubmit,
  buttonText = "Add Product",
  isEditing = false,
  onCancel,
}: ProductFormProps) {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setImage(publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          className="border rounded-xl p-3"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded-xl p-3"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="border rounded-xl p-3"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="border rounded-xl p-3"
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <div className="md:col-span-2">

          <label className="font-semibold block mb-2">
            Product Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                uploadImage(e.target.files[0]);
              }
            }}
          />

          {uploading && (
            <p className="text-blue-600 mt-2">
              Uploading image...
            </p>
          )}

          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-xl mt-4 border"
            />
          )}

        </div>

        <textarea
          className="border rounded-xl p-3 md:col-span-2"
          placeholder="Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

      </div>

      <label className="flex items-center gap-3 mt-5">

        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />

        Featured Product

      </label>

      <div className="flex gap-4 mt-6">

        <button
          onClick={onSubmit}
          disabled={uploading}
          className={`flex-1 text-white py-3 rounded-xl font-bold text-lg transition ${
            isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : buttonText}
        </button>

        {isEditing && (
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-lg transition"
          >
            Cancel
          </button>
        )}

      </div>

    </div>
  );
}