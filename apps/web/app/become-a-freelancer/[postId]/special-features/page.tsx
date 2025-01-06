import ServiceOffer from "@/components/posts/service-offer";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your special feature</p>
      </div>
      <div>
        <ServiceOffer />
      </div>
    </div>
  );
}
