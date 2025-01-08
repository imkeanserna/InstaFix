import { PricingSetup } from "@/components/posts/pricing-setup";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your price</p>
      </div>
      <div>
        <PricingSetup />
      </div>
    </div>
  );
}
