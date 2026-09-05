"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

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
  payment_status: string;
  status: string;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  created_at?: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

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

    setEmail(session.user.email || "");

    await loadOrders();

    setLoading(false);
  }

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ADMIN ORDERS ERROR:", error);

      alert(
        "Unable to load orders: " + error.message
      );

      return;
    }

    setOrders((data || []) as Order[]);
  }

  async function updatePaymentStatus(
    id: number | string,
    status: string
  ) {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "PAYMENT STATUS UPDATE ERROR:",
        error
      );

      alert(
        "Unable to update payment status: " +
          error.message
      );

      return;
    }

    await loadOrders();

    alert("Payment status updated successfully.");
  }

  async function updateOrderStatus(
    id: number | string,
    status: string
  ) {
    const { error } = await supabase
      .from("orders")
      .update({
        status: status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "ORDER STATUS UPDATE ERROR:",
        error
      );

      alert(
        "Unable to update order status: " +
          error.message
      );

      return;
    }

    await loadOrders();

    alert("Order status updated successfully.");
  }

  async function logout() {
    await supabase.auth.signOut();

    router.push("/login");
  }

  function formatDate(date?: string) {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold">
          Loading Orders...
        </h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold">
                NovaCart Orders
              </h1>

              <p className="text-gray-600 mt-2">
                Admin: {email}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                ← Admin Dashboard
              </Link>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                Logout
              </button>

            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">

          {/* TOTAL ORDERS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Orders
            </p>

            <p className="text-3xl font-bold mt-2">
              {orders.length}
            </p>
          </div>

          {/* PAID ORDERS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Paid Orders
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                orders.filter(
                  (order) =>
                    order.payment_status === "Paid"
                ).length
              }
            </p>
          </div>

          {/* PENDING PAYMENTS */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Pending Payments
            </p>

            <p className="text-3xl font-bold text-orange-500 mt-2">
              {
                orders.filter(
                  (order) =>
                    order.payment_status !== "Paid"
                ).length
              }
            </p>
          </div>

          {/* REVENUE */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500">
              Total Revenue
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              ₹
              {orders
                .filter(
                  (order) =>
                    order.payment_status === "Paid"
                )
                .reduce(
                  (sum, order) =>
                    sum + Number(order.total || 0),
                  0
                )
                .toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* ORDERS */}
        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-10 text-center">

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
                className="bg-white rounded-2xl shadow p-6"
              >

                {/* ORDER HEADER */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 border-b pb-5">

                  {/* ORDER ID */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-bold text-lg break-all">
                      #{order.id}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* PAYMENT METHOD */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Method
                    </p>

                    <p className="font-semibold">
                      {order.payment_method}
                    </p>
                  </div>

                  {/* TOTAL */}
                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="font-bold text-xl text-blue-600">
                      ₹
                      {Number(
                        order.total || 0
                      ).toLocaleString("en-IN")}
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
                      onChange={(e) =>
                        updatePaymentStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className="border rounded-xl px-3 py-2 font-semibold"
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
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className="border rounded-xl px-3 py-2 font-semibold"
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
                      <strong>Payment ID:</strong>{" "}
                      {order.razorpay_payment_id ||
                        "Not available"}
                    </p>

                    <p className="text-sm break-all mt-1">
                      <strong>Razorpay Order ID:</strong>{" "}
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
                            key={index}
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
                                  {product.quantity}
                                </p>
                              )}
                            </div>

                            <span className="font-semibold whitespace-nowrap">
                              ₹
                              {Number(
                                product.price || 0
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

      </div>
    </main>
  );
}