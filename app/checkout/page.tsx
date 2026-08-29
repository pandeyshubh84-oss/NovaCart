"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  async function placeOrder() {
    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !pincode
    ) {
      alert("Please fill all details.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // CASH ON DELIVERY
      // =========================

      if (payment === "COD") {
        const { error } = await supabase
          .from("orders")
          .insert([
            {
              customer_name: name,
              phone,
              email,
              address,
              city,
              pincode,
              payment_method: "COD",
              total: totalPrice,
              products: cart,
              payment_status: "Pending",
            },
          ]);

        if (error) {
          throw error;
        }

        clearCart();

        alert("🎉 COD Order Placed Successfully!");

        window.location.href = "/success";

        return;
      }

      // =========================
      // CREATE RAZORPAY ORDER
      // =========================

      const orderRes = await fetch(
        "/api/razorpay/order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
          }),
        }
      );

      const result = await orderRes.json();

      if (!result.success) {
        alert(result.message);
        setLoading(false);
        return;
      }

      const order = result.order;

      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "NovaCart",

        description:
          "Order Payment",

        order_id: order.id,

        handler: async function (
          response: any
        ) {
          const verifyRes =
            await fetch(
              "/api/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

          const verifyData =
            await verifyRes.json();

          if (!verifyData.success) {
            alert(
              "Payment Verification Failed"
            );

            setLoading(false);

            return;
          }

          const { error } =
            await supabase
              .from("orders")
              .insert([
                {
                  customer_name:
                    name,

                  phone,

                  email,

                  address,

                  city,

                  pincode,

                  payment_method:
                    payment,

                  total:
                    totalPrice,

                  products: cart,

                  payment_status:
                    "Paid",

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_order_id:
                    response.razorpay_order_id,
                },
              ]);

          if (error) {
            alert("Database Error");

            setLoading(false);

            return;
          }

          clearCart();

          alert(
            "🎉 Payment Successful!"
          );

          window.location.href =
            "/success";
        },
                prefill: {
          name,
          email,
          contact: phone,
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Billing Details */}

          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-5">
              Billing Details
            </h2>

            <input
              placeholder="Full Name"
              className="border w-full p-3 rounded-xl mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Phone Number"
              className="border w-full p-3 rounded-xl mb-4"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              placeholder="Email"
              className="border w-full p-3 rounded-xl mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              placeholder="Full Address"
              rows={4}
              className="border w-full p-3 rounded-xl mb-4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <input
              placeholder="City"
              className="border w-full p-3 rounded-xl mb-4"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <input
              placeholder="Pincode"
              className="border w-full p-3 rounded-xl"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />

          </div>

          {/* Order Summary */}

          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-5">
              Order Summary
            </h2>

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-3"
              >
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </div>
            ))}

            <div className="flex justify-between text-2xl font-bold mt-6">
              <span>Total</span>
              <span className="text-blue-600">
                ₹{totalPrice}
              </span>
            </div>

            <select
              className="border w-full p-3 rounded-xl mt-6"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="COD">
                Cash On Delivery
              </option>

              <option value="UPI">
                Razorpay (UPI / Card / NetBanking)
              </option>
            </select>

            <button
              onClick={placeOrder}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl text-xl font-bold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>

            <Link
              href="/"
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}