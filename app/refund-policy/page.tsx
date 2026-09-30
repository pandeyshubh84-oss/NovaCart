import PolicyLayout, { Section } from "../components/PolicyLayout";
import { STORE } from "../lib/storeInfo";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Return, Refund and Cancellation Policy">
      <Section heading="Cancellation">
        <p>
          You can cancel your order before it is dispatched by contacting us
          at {STORE.email}. Once an order is dispatched, it cannot be
          cancelled, but you may request a return as described below.
        </p>
      </Section>

      <Section heading="Returns">
        <p>
          You can request a return within {STORE.returnDays} days of delivery
          if the item is damaged, defective or different from what you
          ordered. Please email us with your order ID and clear photos or a
          video of the item and its packaging.
        </p>
        <p>
          Items must be unused and in original condition. Used, washed or
          altered items cannot be returned.
        </p>
      </Section>

      <Section heading="Refunds">
        <p>
          After your return is approved and the item is received (or the issue
          is verified), your refund will be processed to the original payment
          method within 5 to 7 business days. For Cash on Delivery orders,
          the refund is sent by bank transfer or UPI.
        </p>
      </Section>

      <Section heading="Wrong or damaged item">
        <p>
          If you receive a wrong or damaged item, contact us within 48 hours
          of delivery. We will arrange a replacement or refund.
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