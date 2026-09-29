"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

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

type Country = {
  code: string;
  name: string;
  dialCode: string;
};

const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "NZ", name: "New Zealand", dialCode: "+64" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "SE", name: "Sweden", dialCode: "+46" },
  { code: "NO", name: "Norway", dialCode: "+47" },
  { code: "DK", name: "Denmark", dialCode: "+45" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "PL", name: "Poland", dialCode: "+48" },
  { code: "TR", name: "Turkey", dialCode: "+90" },
  { code: "TH", name: "Thailand", dialCode: "+66" },
  { code: "ID", name: "Indonesia", dialCode: "+62" },
  { code: "PH", name: "Philippines", dialCode: "+63" },
];

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("IN");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [payment, setPayment] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const items = cart as CheckoutItem[];

  const selectedCountry =
    COUNTRIES.find((item) => item.code === country) ||
    COUNTRIES[0];

  const isIndia = country === "IN";

  /*
   * =====================================================
   * COUNTRY CHANGE
   * =====================================================
   *
   * COD is kept available only for India.
   * International customers use the existing Razorpay
   * flow for now.
   *
   * Currency/payment-provider expansion will be handled
   * separately in the backend.
   */

  useEffect(() => {
    if (!isIndia && payment === "COD") {
      setPayment("Razorpay");
    }
  }, [country, isIndia, payment]);

  /*
   * =====================================================
   * CHECK LOGIN
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        alert(
          "Please login before proceeding to checkout."
        );

        router.replace("/login");
        return;
      }

      const loggedInEmail =
        session.user.email || "";

      setUserEmail(loggedInEmail);

      if (!email && loggedInEmail) {
        setEmail(loggedInEmail);
      }

      setCheckingAuth(false);
    }

    checkLogin();

    return () => {
      mounted = false;
    };
  }, [router, email]);

  /*
   * =====================================================
   * VALIDATE CUSTOMER DETAILS
   * =====================================================
   */

  function validateCustomerDetails() {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !country.trim() ||
      !address.trim() ||
      !city.trim() ||
      !stateProvince.trim() ||
      !postalCode.trim()
    ) {
      alert(
        "Please fill all customer and delivery details."
      );

      return false;
    }

    const cleanPhone =
      phone.replace(/\D/g, "");

    /*
     * International phone numbers can have different
     * lengths. We require a reasonable range instead
     * of forcing a 10-digit Indian number.
     */

    if (
      cleanPhone.length < 6 ||
      cleanPhone.length > 15
    ) {
      alert(
        "Please enter a valid phone number."
      );

      return false;
    }

    const cleanPostalCode =
      postalCode.trim();

    if (
      cleanPostalCode.length < 3 ||
      cleanPostalCode.length > 12
    ) {
      alert(
        "Please enter a valid postal / ZIP code."
      );

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email.trim()
      )
    ) {
      alert(
        "Please enter a valid email address."
      );

      return false;
    }

    return true;
  }

  /*
   * =====================================================
   * GET CURRENT SESSION TOKEN
   * =====================================================
   */

  async function getSessionAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error(
        "SESSION ERROR:",
        error
      );

      return null;
    }

    if (!session?.access_token) {
      return null;
    }

    return session.access_token;
  }

  /*
   * =====================================================
   * BUILD SERVER-SAFE ADDRESS
   * =====================================================
   *
   * Existing orders API currently works with:
   * address, city and pincode.
   *
   * Until the database/order schema gets an explicit
   * country/state structure, we preserve that API and
   * include the international delivery information in
   * the address string.
   */

  function buildOrderAddress() {
    return [
      address.trim(),
      stateProvince.trim(),
      city.trim(),
      selectedCountry.name,
    ]
      .filter(Boolean)
      .join(", ");
  }

  /*
   * =====================================================
   * PLACE ORDER
   * =====================================================
   */

  async function placeOrder() {
    if (loading) {
      return;
    }

    if (checkingAuth) {
      alert(
        "Please wait while we verify your login."
      );

      return;
    }

    if (!validateCustomerDetails()) {
      return;
    }

    if (
      !items ||
      items.length === 0
    ) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      /*
       * =================================================
       * GET AUTH TOKEN
       * =================================================
       */

      const accessToken =
        await getSessionAccessToken();

      if (!accessToken) {
        alert(
          "Your login session has expired. Please login again."
        );

        router.replace("/login");

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * CART ITEMS
       * =================================================
       */

      const orderItems =
        items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        }));

      /*
       * =================================================
       * SERVER-SAFE DELIVERY DATA
       * =================================================
       */

      const orderAddress =
        buildOrderAddress();

      /*
       * =================================================
       * COD ORDER
       * =================================================
       */

      if (payment === "COD") {
        /*
         * COD is currently supported only for India.
         */

        if (!isIndia) {
          alert(
            "Cash on Delivery is currently available only in India. Please select an online payment method."
          );

          setPayment("Razorpay");
          setLoading(false);

          return;
        }

        const orderRes =
          await fetch(
            "/api/orders",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                customer_name:
                  name.trim(),

                phone:
                  `${selectedCountry.dialCode}${phone
                    .replace(/\D/g, "")}`,

                email:
                  email.trim(),

                address:
                  orderAddress,

                city:
                  city.trim(),

                pincode:
                  postalCode.trim(),

                payment_method:
                  "COD",

                products:
                  orderItems,
              }),
            }
          );

        const orderData =
          await orderRes.json();

        if (
          !orderRes.ok ||
          !orderData.success
        ) {
          console.error(
            "COD ORDER ERROR:",
            orderData
          );

          if (
            orderRes.status === 401
          ) {
            alert(
              "Your login session has expired. Please login again."
            );

            router.replace("/login");

            setLoading(false);

            return;
          }

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

      /*
       * =================================================
       * RAZORPAY SCRIPT CHECK
       * =================================================
       */

      if (!window.Razorpay) {
        alert(
          "Razorpay Checkout is not loaded. Please refresh the page and try again."
        );

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * RAZORPAY PUBLIC KEY
       * =================================================
       */

      const razorpayKey =
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        alert(
          "Razorpay Key ID is missing. Check your environment variables."
        );

        setLoading(false);

        return;
      }

      /*
       * =================================================
       * CREATE SECURE RAZORPAY ORDER
       * =================================================
       *
       * IMPORTANT:
       * We continue using the existing backend endpoint.
       * The server remains the authority for:
       *
       * - product price
       * - stock
       * - final amount
       * - Razorpay order creation
       *
       * We do NOT calculate or trust payment amount
       * from the browser.
       */

      const razorpayOrderRes =
        await fetch(
          "/api/razorpay/order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
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

        if (
          razorpayOrderRes.status ===
          401
        ) {
          alert(
            "Your login session has expired. Please login again."
          );

          router.replace("/login");

          setLoading(false);

          return;
        }

        alert(
          razorpayOrderData?.message ||
            "Unable to create Razorpay order."
        );

        setLoading(false);

        return;
      }

      const razorpayOrder =
        razorpayOrderData.order;

      /*
       * =================================================
       * INTERNATIONAL PHONE FORMAT
       * =================================================
       */

      const cleanPhone =
        phone.replace(/\D/g, "");

      const formattedPhone =
        `${selectedCountry.dialCode}${cleanPhone}`;

      /*
       * =================================================
       * RAZORPAY OPTIONS
       * =================================================
       */

      const options = {
        key: razorpayKey,

        amount:
          razorpayOrder.amount,

        /*
         * IMPORTANT:
         *
         * Currency comes from the server-created
         * Razorpay order.
         *
         * We do NOT force USD/EUR in the browser.
         *
         * Current backend creates INR orders.
         * International currency support will be added
         * in the payment backend phase.
         */

        currency:
          razorpayOrder.currency ||
          "INR",

        name: "NovaCart",

        description:
          `NovaCart Order • ${totalItems} ${
            totalItems === 1
              ? "item"
              : "items"
          }`,

        order_id:
          razorpayOrder.id,

        prefill: {
          name:
            name.trim(),

          email:
            email.trim(),

          contact:
            formattedPhone,
        },

        notes: {
          customer_name:
            name.trim(),

          country:
            selectedCountry.name,

          city:
            city.trim(),

          state:
            stateProvince.trim(),

          postal_code:
            postalCode.trim(),
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          backdropclose: false,

          ondismiss:
            function () {
              console.log(
                "RAZORPAY CHECKOUT DISMISSED"
              );

              setLoading(false);
            },
        },

        /*
         * ===============================================
         * PAYMENT SUCCESS
         * ===============================================
         */

        handler:
          async function (
            response: any
          ) {
            try {
              setLoading(true);

              console.log(
                "RAZORPAY PAYMENT SUCCESS:",
                response
              );

              /*
               * =========================================
               * GET FRESH SESSION TOKEN
               * =========================================
               */

              const paymentAccessToken =
                await getSessionAccessToken();

              if (!paymentAccessToken) {
                alert(
                  "Your login session expired after payment. Please contact support with your Razorpay payment ID."
                );

                setLoading(false);

                return;
              }

              /*
               * =========================================
               * VERIFY PAYMENT FIRST
               * =========================================
               */

              const verifyPaymentRes =
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

              const verifyPaymentData =
                await verifyPaymentRes.json();

              console.log(
                "RAZORPAY VERIFY RESPONSE:",
                verifyPaymentData
              );

              if (
                !verifyPaymentRes.ok ||
                !verifyPaymentData.success
              ) {
                console.error(
                  "RAZORPAY PAYMENT VERIFICATION FAILED:",
                  verifyPaymentData
                );

                alert(
                  verifyPaymentData?.message ||
                    "Payment verification failed. Order was not saved."
                );

                setLoading(false);

                return;
              }

              /*
               * =========================================
               * SAVE ORDER
               * =========================================
               */

              const saveOrderRes =
                await fetch(
                  "/api/orders",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        `Bearer ${paymentAccessToken}`,
                    },

                    body: JSON.stringify({
                      customer_name:
                        name.trim(),

                      phone:
                        formattedPhone,

                      email:
                        email.trim(),

                      address:
                        orderAddress,

                      city:
                        city.trim(),

                      pincode:
                        postalCode.trim(),

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

      /*
       * =================================================
       * OPEN RAZORPAY
       * =================================================
       */

      const razorpay =
        new window.Razorpay(
          options
        );

      /*
       * =================================================
       * PAYMENT FAILED
       * =================================================
       */

      razorpay.on(
        "payment.failed",
        function (
          response: any
        ) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );

          alert(
            response?.error
              ?.description ||
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

  /*
   * =====================================================
   * EMPTY CART
   * =====================================================
   */

  if (
    !items ||
    items.length === 0
  ) {
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
            Add some products before
            proceeding to checkout.
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

  /*
   * =====================================================
   * AUTH CHECK LOADING
   * =====================================================
   */

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-5">
            🔐
          </div>

          <h1 className="text-2xl font-bold">
            Verifying Login...
          </h1>

          <p className="text-gray-600 mt-2">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * CHECKOUT PAGE
   * =====================================================
   */

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
            Secure Checkout
          </h1>

          <p className="text-gray-600 mt-2">
            Complete your delivery details
            and place your order securely.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            🔐 Logged in securely
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg">

            <h2 className="text-2xl font-bold mb-6">
              Delivery Details
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
                    setName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              {/* COUNTRY */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Country *
                </label>

                <select
                  className="border w-full p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={country}
                  onChange={(e) =>
                    setCountry(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="country"
                >
                  {COUNTRIES.map(
                    (item) => (
                      <option
                        key={item.code}
                        value={item.code}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>

                {!isIndia && (
                  <p className="text-xs text-blue-600 mt-2">
                    🌍 International delivery selected.
                  </p>
                )}
              </div>

              {/* PHONE */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number *
                </label>

                <div className="flex gap-2">

                  <div className="w-24">
                    <input
                      type="text"
                      value={
                        selectedCountry.dialCode
                      }
                      readOnly
                      className="border w-full p-3 rounded-xl bg-gray-50 text-center font-semibold"
                    />
                  </div>

                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Phone number"
                    className="border flex-1 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(
                          /[^\d\s-]/g,
                          ""
                        )
                      )
                    }
                    disabled={loading}
                    autoComplete="tel-national"
                  />

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Enter your local phone number without the country code.
                </p>
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
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="email"
                />

                {userEmail && (
                  <p className="text-xs text-gray-500 mt-2">
                    Account: {userEmail}
                  </p>
                )}
              </div>

              {/* ADDRESS */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Street Address *
                </label>

                <textarea
                  placeholder="House number, street, apartment, suite, etc."
                  rows={4}
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="street-address"
                />
              </div>

              {/* CITY + STATE */}

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
                      setCity(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    autoComplete="address-level2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State / Province *
                  </label>

                  <input
                    type="text"
                    placeholder="State / Province / Region"
                    className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={stateProvince}
                    onChange={(e) =>
                      setStateProvince(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    autoComplete="address-level1"
                  />
                </div>

              </div>

              {/* POSTAL CODE */}

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Postal / ZIP Code *
                </label>

                <input
                  type="text"
                  placeholder={
                    isIndia
                      ? "e.g. 110001"
                      : "Postal / ZIP code"
                  }
                  className="border w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={postalCode}
                  onChange={(e) =>
                    setPostalCode(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="postal-code"
                />
              </div>

            </div>

            {/* INTERNATIONAL NOTICE */}

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">

              <p className="font-semibold text-blue-900">
                🌍 International Store
              </p>

              <p className="text-sm text-blue-700 mt-1">
                NovaCart supports delivery information
                for customers in multiple countries.
                Shipping availability may vary by destination.
              </p>

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

              {items.map(
                (item) => {
                  const itemPrice =
                    Number(
                      item.price || 0
                    );

                  const itemTotal =
                    itemPrice *
                    item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b pb-4"
                    >

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                      />

                      <div className="flex-1">

                        <p className="font-bold text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          ₹
                          {itemPrice.toLocaleString(
                            "en-IN"
                          )}{" "}
                          ×{" "}
                          {item.quantity}
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
                }
              )}

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
                {Number(
                  totalPrice
                ).toLocaleString(
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
                {Number(
                  totalPrice
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* CURRENCY NOTICE */}

            <div className="mt-4 bg-gray-50 border rounded-xl p-3">

              <p className="text-xs text-gray-600">
                Current checkout currency:
                <strong className="ml-1">
                  INR (₹)
                </strong>
              </p>

              <p className="text-xs text-gray-500 mt-1">
                International currency support will
                be connected to the payment backend
                before international launch.
              </p>

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
                  setPayment(
                    e.target.value
                  )
                }
                disabled={loading}
              >

                {isIndia && (
                  <option value="COD">
                    📦 Cash On Delivery
                  </option>
                )}

                <option value="Razorpay">
                  💳 Razorpay - Card / UPI / Netbanking
                </option>

              </select>

              {!isIndia && (
                <p className="text-xs text-gray-500 mt-2">
                  Online payment is required for
                  international checkout at this stage.
                </p>
              )}

            </div>

            {/* SECURITY */}

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">

              <p className="text-sm font-semibold text-blue-900">
                🔒 Secure Checkout
              </p>

              <p className="text-xs text-blue-700 mt-1">
                Your account, product price,
                stock and payment amount are
                verified securely on our server.
              </p>

            </div>

            {/* PLACE ORDER */}

            <button
              type="button"
              onClick={placeOrder}
              disabled={
                loading ||
                checkingAuth
              }
              className={`w-full mt-6 py-4 rounded-xl text-lg font-bold text-white transition ${
                loading ||
                checkingAuth
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >

              {loading
                ? "Processing..."
                : checkingAuth
                ? "Verifying Login..."
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

        <div className="grid md:grid-cols-4 gap-4 mt-8">

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
              🌍
            </div>

            <p className="font-semibold">
              Global Delivery
            </p>

            <p className="text-sm text-gray-500 mt-1">
              International-ready address
            </p>

          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">

            <div className="text-2xl mb-2">
              📦
            </div>

            <p className="font-semibold">
              Order Protection
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Server-side order validation
            </p>

          </div>

          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">

            <div className="text-2xl mb-2">
              💳
            </div>

            <p className="font-semibold">
              Secure Payments
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Online payment support
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}