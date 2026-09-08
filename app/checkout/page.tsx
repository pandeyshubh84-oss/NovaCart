"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  quantity: number;
};

export default function CheckoutPage() {
  const {
    cart,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [payment, setPayment] = useState("COD");
  const [loading, setLoading] = useState(false);

  const items = cart as CheckoutItem[];

  /* =====================================================
     VALIDATE CUSTOMER DETAILS
  ===================================================== */

  function validateCustomerDetails() {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill all customer details.");
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return false;
    }

    const cleanPincode = pincode.replace(/\D/g, "");

    if (cleanPincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  }

  /* =====================================================
     PLACE ORDER
  ===================================================== */

  async function placeOrder() {
    if (loading) {
      return;
    }

    if (!validateCustomerDetails()) {
      return;
    }

    if (!items || items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      /* =================================================
         CART ITEMS WITH QUANTITY
      ================================================= */

      const orderItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      /* =================================================
         COD ORDER
      ================================================= */

      if (payment === "COD") {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            payment_method: "COD",
            products: orderItems,
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.success) {
          console.error(
            "COD ORDER ERROR:",
            orderData
          );

          alert(
            orderData?.message ||
              "Unable to place COD order."
          );

          setLoading(false);
          return;
        }

        clearCart();

        alert(
          "🎉 COD Order Placed Successfully!"
        );

        window.location.href =
          "/success?method=COD";

        return;
      }

      /* =================================================
         RAZORPAY SCRIPT CHECK
      ================================================= */

      if (!window.Razorpay) {
        alert(
          "Razorpay Checkout is not loaded. Please refresh the page and try again."
        );

        setLoading(false);
        return;
      }

      /* =================================================
         RAZORPAY PUBLIC KEY
      ================================================= */

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        alert(
          "Razorpay Key ID is missing. Check your .env.local file."
        );

        setLoading(false);
        return;
      }

      /* =================================================
         CREATE SECURE RAZORPAY ORDER
      ================================================= */

      const razorpayOrderRes = await fetch(
        "/api/razorpay/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: orderItems,
          }),
        }
      );

      const razorpayOrderData =
        await razorpayOrderRes.json();

      if (
        !razorpayOrderRes.ok ||
        !razorpayOrderData.success ||
        !razorpayOrderData.order
      ) {
        console.error(
          "RAZORPAY ORDER ERROR:",
          razorpayOrderData
        );

        alert(
          razorpayOrderData?.message ||
            "Unable to create Razorpay order."
        );

        setLoading(false);
        return;
      }

      const razorpayOrder =
        razorpayOrderData.order;

      /* =================================================
         PHONE FORMAT
      ================================================= */

      const cleanPhone =
        phone.replace(/\D/g, "");

      const formattedPhone =
        cleanPhone.length === 10
          ? `+91${cleanPhone}`
          : phone.trim();

      /* =================================================
         RAZORPAY OPTIONS
      ================================================= */

      const options = {
        key: razorpayKey,

        amount: razorpayOrder.amount,

        currency:
          razorpayOrder.currency || "INR",

        name: "NovaCart",

        description:
          `NovaCart Order • ${totalItems} ${
            totalItems === 1 ? "item" : "items"
          }`,

        order_id: razorpayOrder.id,

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

        modal: {
          backdropclose: false,

          ondismiss: function () {
            console.log(
              "RAZORPAY CHECKOUT DISMISSED"
            );

            setLoading(false);
          },
        },

        /* ===============================================
           PAYMENT SUCCESS
        =============================================== */

        handler: async function (
          response: any
        ) {
          try {
            setLoading(true);

            console.log(
              "RAZORPAY PAYMENT SUCCESS:",
              response
            );

            /* ===========================================
               SAVE ORDER THROUGH SECURE SERVER API
            =========================================== */

            const saveOrderRes = await fetch(
              "/api/orders",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
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

                  products:
                    orderItems,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const saveOrderData =
              await saveOrderRes.json();

            if (
              !saveOrderRes.ok ||
              !saveOrderData.success
            ) {
              console.error(
                "ORDER SAVE ERROR:",
                saveOrderData
              );

              alert(
                saveOrderData?.message ||
                  "Payment completed, but order could not be saved. Please contact support."
              );

              setLoading(false);
              return;
            }

            console.log(
              "ORDER SAVED SUCCESSFULLY"
            );

            clearCart();

            alert(
              "🎉 Payment Successful! Your order has been placed."
            );

            window.location.href =
              "/success?method=Razorpay";
          } catch (error) {
            console.error(
              "PAYMENT HANDLER ERROR:",
              error
            );

            alert(
              "Payment completed, but something went wrong while saving your order. Please contact support."
            );

            setLoading(false);
          }
        },
      };

      /* =================================================
         OPEN RAZORPAY
      ================================================= */

      const razorpay =
        new window.Razorpay(options);

      /* =================================================
         PAYMENT FAILED
      ================================================= */

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
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

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!items || items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">

          <div className="text-6xl mb-5">
            🛒
          </div>

          <h1 className="text-3xl font-bold mb-3">
            Your Cart is Empty
          </h1>

          <p className="text-gray-600 mb-6">
            Add some products before proceeding
            to checkout.
          </p>

          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>

        </div>
      </main>
    );
  }

  /* =====================================================
     CHECKOUT PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <Link
            href="/cart"
            className="text-blue-600 hover:underline font-semibold"
          >
            ← Back to Cart
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-600 mt-2">
            Complete your details and place
            your order securely.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg">

            <h2 className="text-2xl font-bold mb-6">
              Customer Details
            </h2>

            <div className="space-y-5">

              {/* NAME */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address *
                </label>

                <input
                  type="email"
                  placeholder="your@email.com"
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* ADDRESS */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Address *
                </label>

                <textarea
                  placeholder="House / Street / Area"
                  rows={4}
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="street-address"
                />
              </div>

              {/* CITY + PINCODE */}

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    City *
                  </label>

                  <input
                    type="text"
                    placeholder="City"
                    className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    disabled={loading}
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pincode *
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6 digit pincode"
                    maxLength={6}
                    className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    disabled={loading}
                    autoComplete="postal-code"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg h-fit">

            <h2 className="text-2xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">

              {items.map((item) => {

                const itemPrice =
                  Number(item.price || 0);

                const itemTotal =
                  itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b pb-4"
                  >

                    {/* IMAGE */}

                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                    />

                    {/* INFO */}

                    <div className="flex-1">

                      <p className="font-bold text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        ₹
                        {itemPrice.toLocaleString(
                          "en-IN"
                        )}{" "}
                        × {item.quantity}
                      </p>

                      <p className="font-bold text-blue-600 mt-2">
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* TOTAL ITEMS */}

            <div className="flex justify-between mt-6 pt-5 border-t">
              <span className="text-gray-600">
                Total Items
              </span>

              <span className="font-semibold">
                {totalItems}
              </span>
            </div>

            {/* SUBTOTAL */}

            <div className="flex justify-between mt-4">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹
                {Number(totalPrice).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            {/* DELIVERY */}

            <div className="flex justify-between mt-4">
              <span className="text-gray-600">
                Delivery
              </span>

              <span className="text-green-600 font-semibold">
                Available
              </span>
            </div>

            {/* GRAND TOTAL */}

            <div className="flex justify-between items-center text-2xl font-bold mt-6 pt-5 border-t">

              <span>
                Total
              </span>

              <span className="text-blue-600">
                ₹
                {Number(totalPrice).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* PAYMENT METHOD */}

            <div className="mt-6">

              <label className="block text-sm font-semibold mb-2">
                Payment Method
              </label>

              <select
                className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={payment}
                onChange={(e) =>
                  setPayment(e.target.value)
                }
                disabled={loading}
              >
                <option value="COD">
                  Cash On Delivery
                </option>

                <option value="Razorpay">
                  Razorpay - UPI / Card / Netbanking
                </option>
              </select>

            </div>

            {/* SECURITY */}

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">

              <p className="text-sm font-semibold text-blue-900">
                🔒 Secure Checkout
              </p>

              <p className="text-xs text-blue-700 mt-1">
                Your order amount is verified
                securely on our server before
                payment is completed.
              </p>

            </div>

            {/* PLACE ORDER */}

            <button
              type="button"
              onClick={placeOrder}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl text-lg font-bold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Processing..."
                : payment === "COD"
                ? "📦 Place COD Order"
                : "💳 Pay Securely"}
            </button>

            <Link
              href="/cart"
              className="block text-center mt-4 text-blue-600 hover:underline font-semibold"
            >
              ← Back to Cart
            </Link>

          </div>

        </div>

        {/* =================================================
            TRUST SECTION
        ================================================= */}

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-2xl mb-2">
              🔒
            </div>

            <p className="font-semibold">
              Secure Checkout
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Protected order process
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-2xl mb-2">
              🚚
            </div>

            <p className="font-semibold">
              Reliable Delivery
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Delivery support available
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-2xl mb-2">
              💳
            </div>

            <p className="font-semibold">
              Multiple Payments
            </p>

            <p className="text-sm text-gray-500 mt-1">
              COD, UPI & Cards
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}