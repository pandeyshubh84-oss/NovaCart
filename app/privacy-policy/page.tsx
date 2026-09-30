import PolicyLayout, { Section } from "../components/PolicyLayout";
import { STORE } from "../lib/storeInfo";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <Section heading="Information we collect">
        <p>
          When you create an account or place an order, we collect your name,
          email address, phone number and delivery address. We also store your
          order details so you can track your orders.
        </p>
      </Section>

      <Section heading="How we use your information">
        <p>
          We use your information to process and deliver your orders, send
          order updates, provide customer support and improve our store.
        </p>
      </Section>

      <Section heading="Payments">
        <p>
          Online payments are processed by Razorpay. We do not store your card,
          UPI or net banking details on our servers.
        </p>
      </Section>

      <Section heading="Sharing your information">
        <p>
          We do not sell your personal information. We share only what is
          needed to deliver your order (for example, your name, phone number
          and address with our shipping and fulfilment partners) and with
          service providers that help us run the store.
        </p>
      </Section>

      <Section heading="Data storage and security">
        <p>
          Your data is stored with trusted cloud service providers. We take
          reasonable steps to protect it, but no method of online storage is
          completely secure.
        </p>
      </Section>

      <Section heading="Your choices">
        <p>
          You can ask us to update or delete your personal information by
          writing to {STORE.email}.
        </p>
      </Section>

      <Section heading="Contact us">
        <p>
          Email: {STORE.email} | Phone: {STORE.phone}
        </p>
      </Section>
    </PolicyLayout>
  );
}