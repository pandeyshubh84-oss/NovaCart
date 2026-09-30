import PolicyLayout, { Section } from "../components/PolicyLayout";
import { STORE } from "../lib/storeInfo";

export default function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy">
      <Section heading="Where we deliver">
        <p>{STORE.name} delivers to most pin codes across India.</p>
      </Section>

      <Section heading="Order processing">
        <p>
          Orders are processed after payment is confirmed (or after order
          confirmation for Cash on Delivery). You will see your order status
          in the My Orders section.
        </p>
      </Section>

      <Section heading="Delivery time">
        <p>
          Estimated delivery time is {STORE.deliveryDays} business days after
          the order is dispatched. During festivals and sale periods, delivery
          may take a little longer.
        </p>
      </Section>

      <Section heading="Shipping charges">
        <p>
          Any shipping charge is shown at checkout before you pay. There are
          no hidden charges.
        </p>
      </Section>

      <Section heading="Delays">
        <p>
          Delays can happen due to weather, courier issues or high demand. If
          your order is delayed, contact us and we will help you track it.
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