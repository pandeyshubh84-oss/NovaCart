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
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill all details.");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // COD ORDER
      // ==================================================

      if (payment === "COD") {
        const { error } = await supabase
          .from("orders")
          .insert([
            {
              customer_name: name.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
              city: city.trim(),
              pincode: pincode.trim(),
              payment_method: "COD",
              total: Number(totalPrice),
              products: cart,
              payment_status: "Pending",
            },
          ]);

        if (error) {
          console.error("COD DATABASE ERROR:", error);
          throw new Error(error.message);
        }

        clearCart();

        alert("🎉 COD Order Placed Successfully!");

        window.location.href = "/success";

        return;
      }

      // ==================================================
      // CHECK RAZORPAY SCRIPT
      // ==================================================

      if (!window.Razorpay) {
        alert(
          "Razorpay Checkout is not loaded. Please refresh the page and try again."
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // RAZORPAY PUBLIC KEY
      // ==================================================

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        alert(
          "Razorpay Key ID is missing. Check your .env.local file."
        );

        setLoading(false);
        return;
      }

      // ==================================================
      // CREATE RAZORPAY ORDER
      // ==================================================

      console.log("CREATING RAZORPAY ORDER");
      console.log("TOTAL:", Number(totalPrice));

      const orderRes = await fetch(
        "/api/razorpay/order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: Number(totalPrice),
          }),
        }
      );

      const result = await orderRes.json();

      console.log(
        "RAZORPAY ORDER RESPONSE:",
        result
      );

      if (
        !orderRes.ok ||
        !result.success ||
        !result.order
      ) {
        console.error(
          "RAZORPAY ORDER ERROR:",
          result
        );

        alert(
          result?.message ||
            "Unable to create Razorpay order."
        );

        setLoading(false);
        return;
      }

      const order = result.order;

      // ==================================================
      // PHONE FORMAT
      // ==================================================

      const cleanPhone =
        phone.replace(/\D/g, "");

      const formattedPhone =
        cleanPhone.length === 10
          ? `+91${cleanPhone}`
          : phone;

      // ==================================================
      // RAZORPAY CHECKOUT OPTIONS
      // ==================================================

      const options = {
        key: razorpayKey,

        amount: order.amount,

        currency: order.currency,

        name: "NovaCart",

        description:
          "NovaCart Order Payment",

        order_id: order.id,

        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: formattedPhone,
        },

        notes: {
          customer_name: name.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
        },

        theme: {
          color: "#2563eb",
        },

        /*
         * IMPORTANT:
         *
         * Do NOT force:
         *
         * method: "upi"
         *
         * We are allowing Razorpay Checkout
         * to use the payment methods enabled
         * for this account.
         */

        modal: {
          backdropclose: false,

          ondismiss: function () {
            console.log(
              "RAZORPAY CHECKOUT DISMISSED"
            );

            setLoading(false);
          },
        },

        handler: async function (
          response: any
        ) {
          try {
            setLoading(true);

            console.log(
              "================================"
            );

            console.log(
              "RAZORPAY PAYMENT SUCCESS"
            );

            console.log(
              "PAYMENT RESPONSE:",
              response
            );

            console.log(
              "================================"
            );

            // ==================================================
            // VERIFY PAYMENT
            // ==================================================

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

            console.log(
              "RAZORPAY VERIFY RESPONSE:",
              verifyData
            );

            if (
              !verifyRes.ok ||
              !verifyData.success
            ) {
              console.error(
                "PAYMENT VERIFICATION FAILED:",
                verifyData
              );

              alert(
                verifyData?.message ||
                  "Payment Verification Failed."
              );

              setLoading(false);
              return;
            }

            // ==================================================
            // SAVE PAID ORDER IN SUPABASE
            // ==================================================

            console.log(
              "SAVING PAID ORDER TO SUPABASE..."
            );

            const { error } =
              await supabase
                .from("orders")
                .insert([
                  {
                    customer_name:
                      name.trim(),

                    phone:
                      phone.trim(),

                    email:
                      email.trim(),

                    address:
                      address.trim(),

                    city:
                      city.trim(),

                    pincode:
                      pincode.trim(),

                    payment_method:
                      "Razorpay",

                    total:
                      Number(totalPrice),

                    products:
                      cart,

                    payment_status:
                      "Paid",

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_order_id:
                      response.razorpay_order_id,
                  },
                ]);

            if (error) {
              console.error(
                "SUPABASE PAID ORDER ERROR:",
                error
              );

              alert(
                "Payment was successful, but order could not be saved. Please contact support."
              );

              setLoading(false);
              return;
            }

            // ==================================================
            // SUCCESS
            // ==================================================

            console.log(
              "ORDER SAVED SUCCESSFULLY"
            );

            clearCart();

            alert(
              "🎉 Payment Successful! Your order has been placed."
            );

            window.location.href =
              "/success";
          } catch (error) {
            console.error(
              "PAYMENT HANDLER ERROR:",
              error
            );

            alert(
              "Payment completed, but something went wrong while saving your order."
            );

            setLoading(false);
          }
        },
      };

      // ==================================================
      // OPEN RAZORPAY
      // ==================================================

      console.log(
        "OPENING RAZORPAY CHECKOUT..."
      );

      const razorpay =
        new window.Razorpay(options);

      // ==================================================
      // PAYMENT FAILED
      // ==================================================

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "================================"
          );

          console.error(
            "RAZORPAY PAYMENT FAILED"
          );

          console.error(
            "FULL ERROR:",
            response
          );

          console.error(
            "ERROR CODE:",
            response?.error?.code
          );

          console.error(
            "DESCRIPTION:",
            response?.error?.description
          );

          console.error(
            "SOURCE:",
            response?.error?.source
          );

          console.error(
            "STEP:",
            response?.error?.step
          );

          console.error(
            "REASON:",
            response?.error?.reason
          );

          console.error(
            "METADATA:",
            response?.error?.metadata
          );

          console.error(
            "================================"
          );

          alert(
            response?.error?.description ||
              "Payment failed. Please try again."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error: any) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong. Please try again."
      );

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

          {/* =====================================
              BILLING DETAILS
          ====================================== */}

          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-5">
              Billing Details
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              className="border w-full p-3 rounded-xl mb-4"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="border w-full p-3 rounded-xl mb-4"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Email"
              className="border w-full p-3 rounded-xl mb-4"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <textarea
              placeholder="Full Address"
              rows={4}
              className="border w-full p-3 rounded-xl mb-4"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="City"
              className="border w-full p-3 rounded-xl mb-4"
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Pincode"
              className="border w-full p-3 rounded-xl"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value)
              }
            />

          </div>

          {/* =====================================
              ORDER SUMMARY
          ====================================== */}

          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-5">
              Order Summary
            </h2>

            {cart.map(
              (item: any, index: number) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between border-b py-3"
                >
                  <span>
                    {item.name}
                  </span>

                  <span>
                    ₹{item.price}
                  </span>
                </div>
              )
            )}

            <div className="flex justify-between text-2xl font-bold mt-6">

              <span>
                Total
              </span>

              <span className="text-blue-600">
                ₹{totalPrice}
              </span>

            </div>

            {/* =====================================
                PAYMENT METHOD
            ====================================== */}

            <select
              className="border w-full p-3 rounded-xl mt-6"
              value={payment}
              onChange={(e) =>
                setPayment(e.target.value)
              }
              disabled={loading}
            >

              <option value="COD">
                Cash On Delivery
              </option>

              <option value="RAZORPAY">
                Razorpay - UPI / Card / Netbanking
              </option>

            </select>

            {/* =====================================
                PLACE ORDER
            ====================================== */}

            <button
              onClick={placeOrder}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl text-xl font-bold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Processing..."
                : "Place Order"}
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