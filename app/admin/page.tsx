"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id: string, status: string) {
    console.log(id, status);
    
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(JSON.stringify(error, null, 2));
      console.log(error);
      return;
    }

    loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-2xl font-bold">
              {order.customer_name}
            </h2>

            <p>📞 {order.phone}</p>
            <p>📧 {order.email}</p>
            <p>🏠 {order.address}</p>

            <p>
              {order.city} - {order.pincode}
            </p>

            <p className="mt-3 font-bold text-blue-600">
              Total: ₹{order.total}
            </p>

            <p className="mt-2">
              Payment: {order.payment_method}
            </p>

            <div className="mt-4">
              <label className="font-bold">
                Order Status
              </label>

              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(order.id, e.target.value)
                }
                className="border p-2 rounded ml-3"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}