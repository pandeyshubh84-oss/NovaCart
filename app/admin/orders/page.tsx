"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "j.ptravels2297@gmail.com";

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
  products: any;
  payment_status?: string | null;
  status?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  created_at?: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | number | null>(null);
  const [email, setEmail] = useState("");

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

      const userEmail = session.user.email?.toLowerCase() || "";

      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        alert("⛔ Access denied. Admin only.");

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setEmail(session.user.email || "");

      await loadOrders();

      setLoading(false);
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error);

      alert("Unable to verify admin access.");

      router.replace("/login");
    }
  }

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your session has expired. Please login again.");
    }

    return session.access_token;
  }

  async function loadOrders() {
    try {
      const token = await getAccessToken();

      const response = await fetch("/api/admin/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load orders."
        );
      }

      setOrders((result.orders || []) as Order[]);
    } catch (error: any) {
      console.error("ADMIN ORDERS LOAD ERROR:", error);

      alert(
        error?.message ||
          "Unable to load orders."
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

      const token = await getAccessToken();

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          ...changes,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update order."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          String(order.id) === String(id)
            ? {
                ...order,
                ...changes,
              }
            : order
        )
      );

      alert("✅ Order updated successfully.");
    } catch (error: any) {
      console.error("ORDER UPDATE ERROR:", error);

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

    alert("Logged out successfully.");

    router.replace("/login");
  }

  function formatDate(date?: string) {
    if (!date) return "N/A";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  const paidOrders = orders.filter(
    (order) =>
      order.payment_status === "Paid"
  );

  const pendingPayments = orders.filter(
    (order) =>
      order.payment_status !== "Paid"
  );

  const totalRevenue = paidOrders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

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

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Orders
            </p>

            <p className="text-3xl font-bold mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Paid Orders
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {paidOrders.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Pending Payments
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {pendingPayments.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Revenue
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

        </div>

        {/* ORDERS */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <div className="text-5xl mb-4">
              📦
            </div>

            <h2 className="text-2xl font-bold">
              No Orders Yet
            </h2>

            <p className="text-gray-600 mt-2">
              Customer orders will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {orders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >

                {/* ORDER HEADER */}

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 border-b pb-5">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-bold text-lg break-all">
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

                    <p className="font-semibold">
                      {order.payment_method}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="font-bold text-xl text-blue-600">
                      ₹
                      {Number(
                        order.total || 0
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

                    <select
                      value={
                        order.payment_status ||
                        "Pending"
                      }
                      disabled={
                        updating === order.id
                      }
                      onChange={(e) =>
                        updateOrder(
                          order.id,
                          {
                            payment_status:
                              e.target.value,
                          }
                        )
                      }
                      className="border rounded-xl px-3 py-2 font-semibold bg-white disabled:opacity-50"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Paid">
                        Paid
                      </option>

                      <option value="Failed">
                        Failed
                      </option>
                    </select>
                  </div>

                  {/* ORDER STATUS */}

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Order Status
                    </p>

                    <select
                      value={
                        order.status ||
                        "Pending"
                      }
                      disabled={
                        updating === order.id
                      }
                      onChange={(e) =>
                        updateOrder(
                          order.id,
                          {
                            status:
                              e.target.value,
                          }
                        )
                      }
                      className="border rounded-xl px-3 py-2 font-semibold bg-white disabled:opacity-50"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Processing">
                        Processing
                      </option>

                      <option value="Shipped">
                        Shipped
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                </div>

                {/* CUSTOMER */}

                <div className="grid md:grid-cols-2 gap-6 mt-6">

                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Customer
                    </h3>

                    <p>
                      <strong>Name:</strong>{" "}
                      {order.customer_name}
                    </p>

                    <p className="mt-1">
                      <strong>Phone:</strong>{" "}
                      {order.phone}
                    </p>

                    <p className="mt-1 break-all">
                      <strong>Email:</strong>{" "}
                      {order.email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      Delivery Address
                    </h3>

                    <p>
                      {order.address}
                    </p>

                    <p className="mt-1">
                      {order.city},{" "}
                      {order.pincode}
                    </p>
                  </div>

                </div>

                {/* RAZORPAY DETAILS */}

                {order.payment_method ===
                  "Razorpay" && (

                  <div className="mt-6 bg-gray-50 rounded-xl p-4">

                    <h3 className="font-bold mb-2">
                      Razorpay Payment Details
                    </h3>

                    <p className="text-sm break-all">
                      <strong>
                        Payment ID:
                      </strong>{" "}
                      {order.razorpay_payment_id ||
                        "Not available"}
                    </p>

                    <p className="text-sm break-all mt-1">
                      <strong>
                        Razorpay Order ID:
                      </strong>{" "}
                      {order.razorpay_order_id ||
                        "Not available"}
                    </p>

                  </div>
                )}

                {/* PRODUCTS */}

                <div className="mt-6">

                  <h3 className="text-xl font-bold mb-3">
                    Products
                  </h3>

                  <div className="space-y-2">

                    {Array.isArray(
                      order.products
                    ) ? (

                      order.products.map(
                        (
                          product: any,
                          index: number
                        ) => (

                          <div
                            key={`${order.id}-${index}`}
                            className="flex justify-between gap-4 border-b py-3"
                          >

                            <div>
                              <p className="font-medium">
                                {product.name ||
                                  "Product"}
                              </p>

                              {product.quantity && (
                                <p className="text-sm text-gray-500">
                                  Quantity:{" "}
                                  {
                                    product.quantity
                                  }
                                </p>
                              )}
                            </div>

                            <span className="font-semibold whitespace-nowrap">
                              ₹
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </div>

                        )
                      )

                    ) : (

                      <p className="text-gray-500">
                        Product details unavailable.
                      </p>

                    )}

                  </div>

                </div>

              </div>

            ))}

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
                Orders are loaded and updated through
                a protected server API. Only the
                authorized NovaCart admin account can
                access and manage customer orders.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}