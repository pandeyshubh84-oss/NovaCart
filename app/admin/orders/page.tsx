"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "pandeyshubh84@gmail.com";

type ProductInfo = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

type OrderProduct = {
  id?: string;
  name?: string;
  price?: number;
  image?: string;
  quantity?: number;
};

type Order = {
  id: number | string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  payment_method: string;
  total: number;
  products: OrderProduct[];
  payment_status?: string | null;
  status?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  created_at?: string;
};

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
];

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<
    Record<string, ProductInfo>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updating, setUpdating] = useState<
    string | number | null
  >(null);

  const [email, setEmail] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] =
    useState("All");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const userEmail =
        session.user.email?.toLowerCase().trim() || "";

      if (
        userEmail !== ADMIN_EMAIL.toLowerCase()
      ) {
        alert("⛔ Access denied. Admin only.");

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setEmail(session.user.email || "");

      await loadOrders();

      setLoading(false);
    } catch (error) {
      console.error(
        "ADMIN AUTH ERROR:",
        error
      );

      alert(
        "Unable to verify admin access."
      );

      router.replace("/login");
    }
  }

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

  async function loadOrders(
    showRefreshLoader = false
  ) {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      }

      const token = await getAccessToken();

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load orders."
        );
      }

      const loadedOrders =
        (result.orders || []) as Order[];

      setOrders(loadedOrders);

      await loadProductDetails(
        loadedOrders
      );
    } catch (error: any) {
      console.error(
        "ADMIN ORDERS LOAD ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load orders."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function loadProductDetails(
    loadedOrders: Order[]
  ) {
    try {
      const productIds =
        new Set<string>();

      for (const order of loadedOrders) {
        if (
          !Array.isArray(order.products)
        ) {
          continue;
        }

        for (const product of order.products) {
          if (product?.id) {
            productIds.add(
              String(product.id)
            );
          }
        }
      }

      if (productIds.size === 0) {
        setProductMap({});
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          "id, name, price, image"
        )
        .in(
          "id",
          Array.from(productIds)
        );

      if (error) {
        console.error(
          "PRODUCT DETAILS ERROR:",
          error
        );

        return;
      }

      const map: Record<
        string,
        ProductInfo
      > = {};

      for (const product of data || []) {
        map[String(product.id)] = {
          id: String(product.id),
          name:
            product.name ||
            "Product",
          price:
            Number(product.price) || 0,
          image:
            product.image || null,
        };
      }

      setProductMap(map);
    } catch (error) {
      console.error(
        "PRODUCT LOOKUP ERROR:",
        error
      );
    }
  }

  async function updateOrder(
    id: number | string,
    changes: {
      payment_status?: string;
      status?: string;
    }
  ) {
    try {
      setUpdating(id);

      const token =
        await getAccessToken();

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            id,
            ...changes,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to update order."
        );
      }

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (order) =>
              String(order.id) ===
              String(id)
                ? {
                    ...order,
                    ...changes,
                  }
                : order
          )
      );

      alert(
        "✅ Order updated successfully."
      );
    } catch (error: any) {
      console.error(
        "ORDER UPDATE ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to update order."
      );

      await loadOrders();
    } finally {
      setUpdating(null);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    alert(
      "Logged out successfully."
    );

    router.replace("/login");
  }

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getProductDetails(
    product: OrderProduct
  ) {
    const databaseProduct =
      product.id
        ? productMap[
            String(product.id)
          ]
        : undefined;

    return {
      name:
        databaseProduct?.name ||
        product.name ||
        "Product",

      price:
        databaseProduct?.price ??
        Number(product.price || 0),

      image:
        databaseProduct?.image ||
        product.image ||
        null,

      quantity:
        Number(product.quantity || 1),
    };
  }

  function getStatusClass(
    status?: string | null
  ) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";

      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";

      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getPaymentClass(
    status?: string | null
  ) {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";

      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  }

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return orders.filter(
      (order) => {
        const matchesSearch =
          !query ||
          String(order.id)
            .toLowerCase()
            .includes(query) ||
          order.customer_name
            ?.toLowerCase()
            .includes(query) ||
          order.phone
            ?.toLowerCase()
            .includes(query) ||
          order.email
            ?.toLowerCase()
            .includes(query) ||
          order.city
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          order.status === statusFilter;

        const matchesPayment =
          paymentFilter === "All" ||
          order.payment_status ===
            paymentFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment
        );
      }
    );
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  /*
   * Revenue:
   *
   * Only orders with Payment Status = Paid
   * AND Order Status != Cancelled
   * are counted as revenue.
   */
  const paidOrders =
    orders.filter(
      (order) =>
        order.payment_status ===
          "Paid" &&
        order.status !==
          "Cancelled"
    );

  const pendingPayments =
    orders.filter(
      (order) =>
        order.payment_status !==
        "Paid"
    );

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Cancelled"
    );

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Delivered"
    );

  const totalRevenue =
    paidOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );

  const filteredRevenue =
    filteredOrders
      .filter(
        (order) =>
          order.payment_status ===
            "Paid" &&
          order.status !==
            "Cancelled"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

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
            Loading secure orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-2xl">
                  🛒
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    NovaCart Orders
                  </h1>

                  <p className="text-green-600 font-semibold mt-1">
                    ✓ Admin Access Verified
                  </p>
                </div>

              </div>

              <p className="text-gray-600 mt-4">
                Logged in as{" "}
                <strong className="text-gray-900">
                  {email}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  loadOrders(true)
                }
                disabled={refreshing}
                className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                {refreshing
                  ? "Refreshing..."
                  : "🔄 Refresh"}
              </button>

              <Link
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                ← Admin Dashboard
              </Link>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                Logout
              </button>

            </div>

          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Total Orders
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Paid Orders
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {paidOrders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Pending Payments
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {pendingPayments.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Cancelled
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {cancelledOrders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Paid Revenue
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-2">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

        </div>

        {/* SEARCH + FILTERS */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Orders
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search by Order ID, customer, phone, email or city..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="lg:w-56">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
              >
                <option value="All">
                  All Statuses
                </option>

                {ORDER_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="lg:w-56">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Status
              </label>

              <select
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
              >
                <option value="All">
                  All Payments
                </option>

                {PAYMENT_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">

            <p className="text-sm text-gray-600">
              Showing{" "}
              <strong>
                {filteredOrders.length}
              </strong>{" "}
              of{" "}
              <strong>
                {orders.length}
              </strong>{" "}
              orders
            </p>

            <p className="text-sm text-gray-600">
              Filtered Paid Revenue:{" "}
              <strong className="text-blue-600">
                ₹
                {filteredRevenue.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </p>

          </div>

        </div>

        {/* ORDERS */}
        {filteredOrders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <div className="text-5xl mb-4">
              {orders.length === 0
                ? "📦"
                : "🔎"}
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {orders.length === 0
                ? "No Orders Yet"
                : "No Matching Orders"}
            </h2>

            <p className="text-gray-600 mt-2">
              {orders.length === 0
                ? "Customer orders will appear here."
                : "Try changing your search or filters."}
            </p>

            {orders.length > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPaymentFilter("All");
                }}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                Clear Filters
              </button>
            )}

          </div>

        ) : (

          <div className="space-y-6">

            {filteredOrders.map(
              (order) => {

                const isUpdating =
                  updating === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >

                    {/* ORDER HEADER */}
                    <div className="p-6 border-b bg-gray-50">

                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                        <div>
                          <p className="text-sm text-gray-500">
                            Order ID
                          </p>

                          <p className="font-bold text-lg break-all text-gray-900">
                            #{order.id}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Payment Method
                          </p>

                          <p className="font-semibold text-gray-900">
                            {order.payment_method ||
                              "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Total
                          </p>

                          <p className="font-bold text-xl text-blue-600">
                            ₹
                            {Number(
                              order.total ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        {/* PAYMENT STATUS */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Payment Status
                          </p>

                          <div className="flex flex-col gap-2">

                            <span
                              className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold border ${getPaymentClass(
                                order.payment_status
                              )}`}
                            >
                              {order.payment_status ||
                                "Pending"}
                            </span>

                            <select
                              value={
                                order.payment_status ||
                                "Pending"
                              }
                              disabled={
                                isUpdating
                              }
                              onChange={(e) =>
                                updateOrder(
                                  order.id,
                                  {
                                    payment_status:
                                      e.target
                                        .value,
                                  }
                                )
                              }
                              className="border rounded-xl px-3 py-2 font-semibold bg-white disabled:opacity-50"
                            >
                              {PAYMENT_STATUSES.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>

                          </div>
                        </div>

                        {/* ORDER STATUS */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Order Status
                          </p>

                          <div className="flex flex-col gap-2">

                            <span
                              className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status ||
                                "Pending"}
                            </span>

                            <select
                              value={
                                order.status ||
                                "Pending"
                              }
                              disabled={
                                isUpdating
                              }
                              onChange={(e) =>
                                updateOrder(
                                  order.id,
                                  {
                                    status:
                                      e.target
                                        .value,
                                  }
                                )
                              }
                              className="border rounded-xl px-3 py-2 font-semibold bg-white disabled:opacity-50"
                            >
                              {ORDER_STATUSES.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>

                          </div>
                        </div>

                      </div>

                      {isUpdating && (
                        <div className="mt-4 text-sm font-semibold text-blue-600">
                          ⏳ Updating order...
                        </div>
                      )}

                    </div>

                    {/* CUSTOMER + DELIVERY */}
                    <div className="p-6">

                      <div className="grid md:grid-cols-2 gap-6">

                        <div>
                          <h3 className="text-xl font-bold mb-3 text-gray-900">
                            👤 Customer
                          </h3>

                          <div className="space-y-2 text-gray-700">

                            <p>
                              <strong>
                                Name:
                              </strong>{" "}
                              {
                                order.customer_name
                              }
                            </p>

                            <p>
                              <strong>
                                Phone:
                              </strong>{" "}
                              {order.phone}
                            </p>

                            <p className="break-all">
                              <strong>
                                Email:
                              </strong>{" "}
                              {order.email}
                            </p>

                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-3 text-gray-900">
                            📍 Delivery Address
                          </h3>

                          <div className="text-gray-700">

                            <p>
                              {order.address}
                            </p>

                            <p className="mt-1">
                              {order.city},{" "}
                              {order.pincode}
                            </p>

                          </div>
                        </div>

                      </div>

                      {/* RAZORPAY DETAILS */}
                      {order.payment_method ===
                        "Razorpay" && (
                        <div className="mt-6 bg-gray-50 border rounded-2xl p-5">

                          <h3 className="font-bold text-lg mb-3">
                            💳 Razorpay Payment Details
                          </h3>

                          <p className="text-sm break-all">
                            <strong>
                              Payment ID:
                            </strong>{" "}
                            {order.razorpay_payment_id ||
                              "Not available"}
                          </p>

                          <p className="text-sm break-all mt-2">
                            <strong>
                              Razorpay Order ID:
                            </strong>{" "}
                            {order.razorpay_order_id ||
                              "Not available"}
                          </p>

                        </div>
                      )}

                      {/* PRODUCTS */}
                      <div className="mt-7">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">

                          <h3 className="text-xl font-bold text-gray-900">
                            🛍️ Products
                          </h3>

                          <p className="text-sm text-gray-500">
                            {Array.isArray(
                              order.products
                            )
                              ? order.products.length
                              : 0}{" "}
                            product item(s)
                          </p>

                        </div>

                        <div className="space-y-3">

                          {Array.isArray(
                            order.products
                          ) ? (

                            order.products.map(
                              (
                                product,
                                index
                              ) => {

                                const details =
                                  getProductDetails(
                                    product
                                  );

                                const itemTotal =
                                  details.price *
                                  details.quantity;

                                return (
                                  <div
                                    key={`${order.id}-${index}`}
                                    className="border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
                                  >

                                    <div className="flex gap-4 items-center">

                                      {/* PRODUCT IMAGE */}
                                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">

                                        {details.image ? (

                                          <img
                                            src={
                                              details.image
                                            }
                                            alt={
                                              details.name
                                            }
                                            className="w-full h-full object-cover"
                                          />

                                        ) : (

                                          <div className="w-full h-full flex items-center justify-center text-3xl">
                                            📦
                                          </div>

                                        )}

                                      </div>

                                      {/* PRODUCT INFO */}
                                      <div>

                                        <p className="font-bold text-lg text-gray-900">
                                          {
                                            details.name
                                          }
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1 break-all">
                                          Product ID:{" "}
                                          {product.id ||
                                            "N/A"}
                                        </p>

                                        <p className="text-sm text-gray-600 mt-1">
                                          ₹
                                          {details.price.toLocaleString(
                                            "en-IN"
                                          )}{" "}
                                          ×{" "}
                                          {
                                            details.quantity
                                          }
                                        </p>

                                      </div>

                                    </div>

                                    {/* ITEM TOTAL */}
                                    <div className="text-left sm:text-right">

                                      <p className="text-sm text-gray-500">
                                        Item Total
                                      </p>

                                      <p className="font-bold text-xl text-blue-600">
                                        ₹
                                        {itemTotal.toLocaleString(
                                          "en-IN"
                                        )}
                                      </p>

                                    </div>

                                  </div>
                                );
                              }
                            )

                          ) : (

                            <p className="text-gray-500">
                              Product details unavailable.
                            </p>

                          )}

                        </div>

                      </div>

                      {/* ORDER FOOTER */}
                      <div className="mt-6 pt-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div className="text-sm text-gray-500">
                          Order total verified on server.
                        </div>

                        <div className="text-xl font-bold text-gray-900">
                          Total: ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

        {/* SECURITY NOTICE */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">

          <div className="flex gap-3">

            <span className="text-xl">
              🔒
            </span>

            <div>

              <h3 className="font-bold text-blue-900">
                Secure Admin Orders
              </h3>

              <p className="text-sm text-blue-800 mt-1">
                Orders are loaded and updated
                through a protected server API.
                Only the authorized NovaCart
                admin account can access and
                manage customer orders.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}