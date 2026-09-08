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
    // File type check
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // 5MB maximum
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploading(true);

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeFileName = `product-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExtension}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(safeFileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        alert(`Image upload failed: ${error.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(safeFileName);

      if (!publicUrl) {
        alert("Image uploaded, but public URL could not be created.");
        return;
      }

      setImage(publicUrl);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Something went wrong while uploading the image.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!trimmedName) {
      alert("Please enter a product name.");
      return;
    }

    if (!trimmedCategory) {
      alert("Please enter a product category.");
      return;
    }

    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price greater than ₹0.");
      return;
    }

    if (
      stock === "" ||
      Number.isNaN(numericStock) ||
      numericStock < 0 ||
      !Number.isInteger(numericStock)
    ) {
      alert("Stock must be a whole number and cannot be negative.");
      return;
    }

    if (!trimmedDescription) {
      alert("Please enter a product description.");
      return;
    }

    if (!image) {
      alert("Please upload a product image.");
      return;
    }

    if (uploading) {
      alert("Please wait until the image upload is complete.");
      return;
    }

    onSubmit();
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label className="block font-semibold mb-2">
            Product Name
          </label>

          <input
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Smart Watch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold mb-2">
            Category
          </label>

          <select
            className="w-full border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Beauty">Beauty</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-2">
            Price (₹)
          </label>

          <input
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 1999"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block font-semibold mb-2">
            Stock Quantity
          </label>

          <input
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 25"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        {/* Product Image */}
        <div className="md:col-span-2">
          <label className="font-semibold block mb-2">
            Product Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            className="block w-full border rounded-xl p-3 bg-gray-50"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                uploadImage(file);
              }
            }}
          />

          <p className="text-sm text-gray-500 mt-2">
            JPG, PNG, WEBP or GIF • Maximum 5MB
          </p>

          {uploading && (
            <div className="mt-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
              ⏳ Uploading image...
            </div>
          )}

          {image && !uploading && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Image Preview
              </p>

              <img
                src={image}
                alt="Product preview"
                className="w-40 h-40 object-cover rounded-xl border shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">
            Description
          </label>

          <textarea
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your product..."
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <p className="text-xs text-gray-500 mt-1">
            {description.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Featured Product */}
      <label className="flex items-center gap-3 mt-6 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="w-5 h-5"
        />

        <span className="font-semibold">
          ⭐ Featured Product
        </span>
      </label>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className={`flex-1 text-white py-3 rounded-xl font-bold text-lg transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading
            ? "Uploading Image..."
            : isEditing
            ? buttonText
            : "Add Product"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-lg transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Security / Admin Note */}
      <div className="mt-5 p-4 rounded-xl bg-gray-50 border text-sm text-gray-600">
        🔒 Product changes are restricted to authorized admin access.
      </div>
    </div>
  );
}