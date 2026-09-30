import PolicyLayout, { Section } from "../components/PolicyLayout";
import { STORE } from "../lib/storeInfo";

export default function ContactUs() {
  return (
    <PolicyLayout title="Contact Us">
      <Section heading="We are here to help">
        <p>
          Have a question about your order, delivery or a product? Reach out
          and we will get back to you as soon as possible.
        </p>
      </Section>

      <Section heading="Email">
        <p>{STORE.email}</p>
      </Section>

      <Section heading="Phone">
        <p>{STORE.phone}</p>
      </Section>

      <Section heading="Business address">
        <p>{STORE.address}</p>
      </Section>

      <Section heading="Tip">
        <p>
          Please keep your order ID ready when you contact us so we can help
          you faster.
        </p>
      </Section>
    </PolicyLayout>
  );
}