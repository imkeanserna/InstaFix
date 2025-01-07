import { ServiceEngagement } from "@/components/posts/service-engagement";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your privacy-type</p>
      </div>
      <div>
        <ServiceEngagement
          title="Select Service Engagement Type"
          subtitle="Choose how you want to engage with your clients"
        />
      </div>
    </div>
  );
}
