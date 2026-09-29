"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type ProductInfo = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

type OrderProduct = {
  id?: string;
  product_id?: string;
  name?: string;
  product_name?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

type Order = {
  id: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  payment_method?: string;
  payment_status?: string;
  status?: string;
  total?: number;
  amount?: number;
  products?: OrderProduct[];
  created_at?: string;
  razorpay_order_id?: string;
};

const STATUS_STEPS = [
  {
    key: "Pending",
    label: "Order Placed",
    icon: "📦",
  },
  {
    key: "Processing",
    label: "Processing",
    icon: "⚙️",
  },
  {
    key: "Shipped",
    label: "Shipped",
    icon: "🚚",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: "✅",
  },
];

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(value: unknown) {
  const price = Number(value || 0);

  return `₹${price.toLocaleString("en-IN")}`;
}

function getProductId(item: OrderProduct) {
  return item.id || item.product_id || "";
}

function getStatusIndex(status?: string) {
  const normalized = String(status || "Pending").trim();

  const index = STATUS_STEPS.findIndex(
    (step) =>
      step.key.toLowerCase() === normalized.toLowerCase()
  );

  return index === -1 ? 0 : index;
}

function getStatusBadge(status?: string) {
  const normalized = String(status || "Pending");

  if (normalized === "Delivered") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (normalized === "Shipped") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (normalized === "Processing") {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  if (normalized === "Cancelled") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

function getPaymentBadge(status?: string) {
  const normalized = String(status || "Pending");

  if (normalized === "Paid") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (normalized === "Failed") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

function OrderTracking({ status }: { status?: string }) {
  const normalizedStatus = String(status || "Pending");

  if (normalizedStatus === "Cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="text-3xl">❌</div>

          <div>
            <h3 className="font-bold text-red-700 text-lg">
              Order Cancelled
            </h3>

            <p className="text-sm text-red-600 mt-1">
              This order has been cancelled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = getStatusIndex(normalizedStatus);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-7">
      <div className="flex items-center justify-between gap-3 mb-7">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            📍 Order Tracking
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Track your order progress
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-full border font-bold text-sm ${getStatusBadge(
            normalizedStatus
          )}`}
        >
          {normalizedStatus}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-1 bg-gray-200 rounded-full" />

        <div
          className="absolute left-5 top-5 h-1 bg-blue-600 rounded-full transition-all duration-500"
          style={{
            width:
              currentIndex === 0
                ? "0%"
                : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="relative grid grid-cols-4 gap-2">
          {STATUS_STEPS.map((step, index) => {
            const completed = index <= currentIndex;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 border-white shadow-sm z-10 ${
                    completed
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {completed ? "✓" : step.icon}
                </div>

                <p
                  className={`text-xs md:text-sm font-semibold mt-3 ${
                    completed
                      ? "text-blue-700"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<
    Record<string, ProductInfo>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || null;
  }

  async function loadOrders() {
    setError("");

    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/my-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Unable to load orders."
        );
      }

      const fetchedOrders: Order[] = Array.isArray(
        data.orders
      )
        ? data.orders
        : [];

      setOrders(fetchedOrders);

      const allProductIds = fetchedOrders.flatMap(
        (order) => {
          const orderProducts = Array.isArray(
            order.products
          )
            ? order.products
            : [];

          return orderProducts
            .map((item) => getProductId(item))
            .filter(Boolean);
        }
      );

      const uniqueProductIds = [
        ...new Set(allProductIds),
      ];

      if (uniqueProductIds.length > 0) {
        const {
          data: products,
          error: productsError,
        } = await supabase
          .from("products")
          .select("id, name, price, image")
          .in("id", uniqueProductIds);

        if (productsError) {
          console.error(
            "PRODUCT LOOKUP ERROR:",
            productsError
          );
        } else {
          const mappedProducts: Record<
            string,
            ProductInfo
          > = {};

          (products || []).forEach((product) => {
            mappedProducts[String(product.id)] =
              product;
          });

          setProductMap(mappedProducts);
        }
      }
    } catch (err: any) {
      console.error("MY ORDERS ERROR:", err);

      setError(
        err?.message || "Unable to load your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshOrders() {
    setRefreshing(true);
    await loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-5">📦</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Loading Your Orders
          </h1>

          <p className="text-gray-600 mt-2">
            Please wait while we fetch your orders.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <Link
              href="/"
              className="text-blue-600 hover:underline font-semibold"
            >
              ← Continue Shopping
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-5">
              My Orders
            </h1>

            <p className="text-gray-600 mt-2">
              View and track all your NovaCart orders.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
            <p className="font-bold text-green-700">
              🔐 Secure Account
            </p>

            <p className="text-sm text-green-600 mt-1">
              Your orders are private.
            </p>
          </div>
        </div>

        {/* ORDER COUNT */}
        <div className="inline-flex items-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3 shadow-sm mb-7">
          <span className="text-2xl">📦</span>

          <span className="font-bold text-gray-900">
            {orders.length}{" "}
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </span>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-6">
            <p className="font-bold">
              Something went wrong
            </p>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 md:p-16 text-center">
            <div className="text-7xl mb-6">📦</div>

            <h2 className="text-3xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="text-gray-600 mt-3 max-w-lg mx-auto">
              You haven't placed any orders yet.
              Start shopping and your orders will
              appear here.
            </p>

            <Link
              href="/"
              className="inline-block mt-7 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl font-bold transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">

            {orders.map((order) => {
              const orderProducts = Array.isArray(
                order.products
              )
                ? order.products
                : [];

              const orderTotal =
                order.total ??
                order.amount ??
                0;

              const orderStatus =
                order.status || "Pending";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >

                  {/* ORDER HEADER */}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                      <div>
                        <p className="text-sm text-gray-500 font-semibold uppercase">
                          Order ID
                        </p>

                        <h2 className="text-lg md:text-xl font-bold text-gray-900 break-all mt-2">
                          #{order.id}
                        </h2>

                        <p className="text-gray-500 mt-3">
                          🗓️{" "}
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getStatusBadge(
                            orderStatus
                          )}`}
                        >
                          📦 {orderStatus}
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold ${getPaymentBadge(
                            order.payment_status
                          )}`}
                        >
                          💳{" "}
                          {order.payment_status ||
                            "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TRACKING */}
                  <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
                    <OrderTracking
                      status={orderStatus}
                    />
                  </div>

                  {/* PRODUCTS */}
                  <div className="border-t border-gray-200 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-5">
                      Ordered Products
                    </h3>

                    <div className="space-y-4">
                      {orderProducts.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-5 text-gray-600">
                          Product details unavailable.
                        </div>
                      ) : (
                        orderProducts.map(
                          (item, index) => {
                            const productId =
                              getProductId(item);

                            const product =
                              productMap[
                                productId
                              ];

                            const productName =
                              item.name ||
                              item.product_name ||
                              product?.name ||
                              "Product";

                            const quantity =
                              Number(
                                item.quantity || 1
                              );

                            const price =
                              Number(
                                item.price ??
                                  product?.price ??
                                  0
                              );

                            const image =
                              item.image ||
                              product?.image ||
                              "";

                            return (
                              <div
                                key={`${productId}-${index}`}
                                className="flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-2xl p-4 md:p-5"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={productName}
                                    className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-xl bg-white"
                                  />
                                ) : (
                                  <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl bg-white flex items-center justify-center text-4xl">
                                    🛍️
                                  </div>
                                )}

                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-900">
                                    {productName}
                                  </h4>

                                  <p className="text-gray-500 mt-2">
                                    Quantity:{" "}
                                    {quantity}
                                  </p>

                                  <p className="text-blue-600 font-bold mt-2">
                                    {formatPrice(
                                      price
                                    )}{" "}
                                    × {quantity}
                                  </p>

                                  <p className="text-gray-900 font-bold mt-1">
                                    Item Total:{" "}
                                    {formatPrice(
                                      price *
                                        quantity
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )
                      )}
                    </div>

                    <div className="mt-7 pt-5 border-t border-gray-200 flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold text-gray-600">
                        Order Total
                      </span>

                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(
                          orderTotal
                        )}
                      </span>
                    </div>
                  </div>

                  {/* DELIVERY + PAYMENT */}
                  <div className="grid md:grid-cols-2 gap-5 p-6 md:p-8 bg-gray-50 border-t border-gray-200">

                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        📍 Delivery Details
                      </h3>

                      <div className="space-y-2 text-gray-600">
                        <p>
                          <strong>Name:</strong>{" "}
                          {order.customer_name ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>Phone:</strong>{" "}
                          {order.phone ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {order.email ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>Address:</strong>{" "}
                          {order.address ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>City:</strong>{" "}
                          {order.city ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>Pincode:</strong>{" "}
                          {order.pincode ||
                            "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        💳 Payment Details
                      </h3>

                      <div className="space-y-3 text-gray-600">
                        <p>
                          <strong>Method:</strong>{" "}
                          {order.payment_method ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>
                            Payment Status:
                          </strong>{" "}
                          {order.payment_status ||
                            "Pending"}
                        </p>

                        <p>
                          <strong>
                            Order Status:
                          </strong>{" "}
                          {order.status ||
                            "Pending"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

          <Link
            href="/"
            className="text-center bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl font-bold transition"
          >
            🛍️ Continue Shopping
          </Link>

          <button
            type="button"
            onClick={refreshOrders}
            disabled={refreshing}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-7 py-4 rounded-xl font-bold transition disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "🔄 Refresh Orders"}
          </button>

        </div>

      </div>
    </main>
  );
}