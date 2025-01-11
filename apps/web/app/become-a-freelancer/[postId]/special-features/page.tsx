import ServiceOffer from "@/components/posts/service-offer";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-40">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          {`What's Special About Your Service?`}
        </h2>
        <p className="text-gray-600 text-sm">
          Select the special features you offer to stand out
        </p>
      </div>
      <ServiceOffer />
    </div>
  );
}
