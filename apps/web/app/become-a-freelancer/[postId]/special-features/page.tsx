import ServiceOffer from "@/components/posts/service-offer";

export const runtime = 'edge'

export default function Page() {
  return (
    <div className="h-full w-full py-24 sm:py-16 md:py-28">
      <div className="text-start sm:text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          {`What's Special About Your Service?`}
        </h1>
        <p className="text-sm text-gray-600">
          Select the special features you offer to stand out
        </p>
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="w-full md:w-2/6">
          <ServiceOffer />
        </div>
      </div>
    </div>
  );
}
