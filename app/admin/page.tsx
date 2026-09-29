"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "pandeyshubh84@gmail.com";

type Order = {
  id: string;
  customer_name: string;
  total: number;
  payment_status: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
  });

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

      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        alert("⛔ Access denied. Admin only.");

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setEmail(session.user.email || "");

      await loadDashboardData();

      setLoading(false);
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error);

      alert("Unable to verify admin access.");

      router.replace("/login");
    }
  }

  async function loadDashboardData() {
    // =========================
    // LOAD ORDERS
    // =========================

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select(
          "id, customer_name, total, payment_status, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

    if (orderError) {
      console.error("ORDERS LOAD ERROR:", orderError);
      throw orderError;
    }

    const allOrders = (orderData || []) as Order[];

    setOrders(allOrders);

    // =========================
    // CALCULATE ORDER STATS
    // =========================

    const totalOrders = allOrders.length;

    const pendingOrders = allOrders.filter(
      (order) =>
        order.status?.toLowerCase() === "pending"
    ).length;

    const shippedOrders = allOrders.filter(
      (order) =>
        order.status?.toLowerCase() === "shipped"
    ).length;

    const deliveredOrders = allOrders.filter(
      (order) =>
        order.status?.toLowerCase() === "delivered"
    ).length;

    const cancelledOrders = allOrders.filter(
      (order) =>
        order.status?.toLowerCase() === "cancelled"
    ).length;

    // Revenue = only PAID orders
    const revenue = allOrders
      .filter(
        (order) =>
          order.payment_status?.toLowerCase() === "paid"
      )
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

    setStats({
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
    });

    // =========================
    // LOAD PRODUCTS COUNT
    // =========================

    const { count, error: productError } =
      await supabase
        .from("products")
        .select("*", {
          count: "exact",
          head: true,
        });

    if (productError) {
      console.error(
        "PRODUCT COUNT ERROR:",
        productError
      );
    }

    setProductCount(count || 0);
  }

  async function logout() {
    await supabase.auth.signOut();

    alert("Logged out successfully.");

    router.replace("/login");
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getStatusStyle(status: string) {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";

      case "shipped":
        return "bg-blue-100 text-blue-700";

      case "processing":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

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
            Loading NovaCart Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                  👑
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    NovaCart Admin
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

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>

          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Total Orders */}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-gray-500 font-medium">
                  Total Orders
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalOrders}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                🛒
              </div>

            </div>
          </div>

          {/* Products */}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-gray-500 font-medium">
                  Products
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  {productCount}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                📦
              </div>

            </div>
          </div>

          {/* Delivered */}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-gray-500 font-medium">
                  Delivered
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {stats.deliveredOrders}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                ✅
              </div>

            </div>
          </div>

          {/* Revenue */}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-gray-500 font-medium">
                  Paid Revenue
                </p>

                <h2 className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(stats.revenue)}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                💰
              </div>

            </div>
          </div>

        </div>

        {/* ================= ORDER STATUS ================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl p-5 shadow">
            <p className="text-gray-500">
              Pending
            </p>

            <p className="text-2xl font-bold mt-1">
              {stats.pendingOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <p className="text-gray-500">
              Shipped
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.shippedOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <p className="text-gray-500">
              Delivered
            </p>

            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.deliveredOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <p className="text-gray-500">
              Cancelled
            </p>

            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats.cancelledOrders}
            </p>
          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <Link
            href="/admin/products"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition"
          >

            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-3xl mb-5">
              📦
            </div>

            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
              Products
            </h2>

            <p className="text-gray-600 mt-2">
              Add, edit and manage NovaCart products.
            </p>

            <div className="mt-5 text-blue-600 font-semibold">
              Manage Products →
            </div>

          </Link>

          <Link
            href="/admin/orders"
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition"
          >

            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-3xl mb-5">
              🛒
            </div>

            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition">
              Orders
            </h2>

            <p className="text-gray-600 mt-2">
              View and manage customer orders and payments.
            </p>

            <div className="mt-5 text-green-600 font-semibold">
              Manage Orders →
            </div>

          </Link>

        </div>

        {/* ================= RECENT ORDERS ================= */}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="text-gray-500 mt-1">
                Latest customer orders
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-blue-600 font-semibold hover:underline"
            >
              View All Orders →
            </Link>

          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b text-left">
                    <th className="py-4 pr-4">
                      Order
                    </th>

                    <th className="py-4 pr-4">
                      Customer
                    </th>

                    <th className="py-4 pr-4">
                      Total
                    </th>

                    <th className="py-4 pr-4">
                      Payment
                    </th>

                    <th className="py-4 pr-4">
                      Status
                    </th>

                    <th className="py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {orders
                    .slice(0, 5)
                    .map((order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-b-0"
                      >

                        <td className="py-4 pr-4">
                          <span className="font-semibold text-gray-900">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          {order.customer_name}
                        </td>

                        <td className="py-4 pr-4 font-semibold">
                          {formatCurrency(
                            Number(order.total || 0)
                          )}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.payment_status?.toLowerCase() ===
                              "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="py-4 text-gray-500">
                          {formatDate(order.created_at)}
                        </td>

                      </tr>
                    ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ================= SECURITY ================= */}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

          <div className="flex gap-3">

            <span className="text-xl">
              🔒
            </span>

            <div>

              <h3 className="font-bold text-blue-900">
                Admin Security Active
              </h3>

              <p className="text-sm text-blue-800 mt-1">
                Only the authorized NovaCart admin account can
                access this dashboard. Database-level protection
                is also enabled through Supabase Row Level Security.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}