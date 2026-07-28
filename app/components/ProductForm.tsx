"use client";

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

        <input
          className="border rounded-xl p-3 md:col-span-2"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

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
          className={`flex-1 text-white py-3 rounded-xl font-bold text-lg transition ${
            isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {buttonText}
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