import PolicyLayout, { Section } from "../components/PolicyLayout";
import { STORE } from "../lib/storeInfo";

export default function Terms() {
  return (
    <PolicyLayout title="Terms and Conditions">
      <Section heading="About these terms">
        <p>
          By using {STORE.name} and placing an order, you agree to these terms.
          Please read them carefully.
        </p>
      </Section>

      <Section heading="Products and prices">
        <p>
          We try to show product details and prices accurately. Prices and
          availability may change without notice. If a product is unavailable
          or a pricing error occurs, we may cancel the order and refund any
          payment made.
        </p>
      </Section>

      <Section heading="Orders and payment">
        <p>
          An order is confirmed only after successful payment (or confirmation
          for Cash on Delivery). Payments are processed securely by Razorpay.
        </p>
      </Section>

      <Section heading="Shipping, returns and refunds">
        <p>
          Our Shipping Policy and Return, Refund and Cancellation Policy form
          part of these terms.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          You are responsible for keeping your login details safe and for all
          activity under your account. Please give accurate information when
          you order.
        </p>
      </Section>

      <Section heading="Limitation of liability">
        <p>
          To the extent allowed by law, {STORE.name} is not liable for
          indirect or incidental losses arising from the use of this website
          or our products.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>These terms are governed by the laws of India.</p>
      </Section>

      <Section heading="Contact us">
        <p>
          Email: {STORE.email} | Phone: {STORE.phone}
        </p>
      </Section>
    </PolicyLayout>
  );
}