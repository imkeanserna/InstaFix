import ServiceNavigation from "@/components/posts/service-navigation";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your location</p>
      </div>
      <div>
        <ServiceNavigation />
      </div>
    </div>
  );
}
