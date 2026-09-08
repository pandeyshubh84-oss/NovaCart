"use client";

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

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center border border-gray-100">
        <div className="text-5xl mb-4">
          📦
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          No Products Found
        </h2>

        <p className="text-gray-500 mt-3">
          Add your first product using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

      {/* Header */}
      <div className="p-5 md:p-6 border-b bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All Products
            </h2>

            <p className="text-gray-500 mt-1">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              in your store
            </p>
          </div>

          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold">
            📦 {products.length} Total
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 font-bold">
                Image
              </th>

              <th className="text-left p-4 font-bold">
                Product
              </th>

              <th className="text-left p-4 font-bold">
                Category
              </th>

              <th className="text-left p-4 font-bold">
                Price
              </th>

              <th className="text-left p-4 font-bold">
                Stock
              </th>

              <th className="text-left p-4 font-bold">
                Featured
              </th>

              <th className="text-left p-4 font-bold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stock = Number(product.stock) || 0;

              const isOutOfStock = stock <= 0;
              const isLowStock = stock > 0 && stock <= 5;

              return (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* Image */}
                  <td className="p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>

                  {/* Product */}
                  <td className="p-4 max-w-xs">
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <span className="font-bold text-blue-600 whitespace-nowrap">
                      ₹
                      {Number(product.price || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="p-4">
                    {isOutOfStock ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        Low: {stock}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        {stock} In Stock
                      </span>
                    )}
                  </td>

                  {/* Featured */}
                  <td className="p-4">
                    {product.featured ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        ⭐ Yes
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                        No
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Product Cards */}
      <div className="md:hidden divide-y">
        {products.map((product) => {
          const stock = Number(product.stock) || 0;

          const isOutOfStock = stock <= 0;
          const isLowStock = stock > 0 && stock <= 5;

          return (
            <div
              key={product.id}
              className="p-5"
            >
              <div className="flex gap-4">

                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Basic Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {product.category}
                  </p>

                  <p className="text-blue-600 font-bold mt-2">
                    ₹
                    {Number(product.price || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mt-4 line-clamp-2">
                {product.description}
              </p>

              {/* Status */}
              <div className="flex flex-wrap gap-2 mt-4">

                {isOutOfStock ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ⚠️ Only {stock} left
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ {stock} In Stock
                  </span>
                )}

                {product.featured && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ Featured
                  </span>
                )}

              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  🗑️ Delete
                </button>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}