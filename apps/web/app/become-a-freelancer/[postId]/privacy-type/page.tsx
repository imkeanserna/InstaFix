import { ServiceEngagement } from "@/components/posts/service-engagement";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full w-full py-20 sm:py-16 md:py-48">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-start space-y-1 md:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Select Service Engagement Type
            </h1>
            <p className="text-sm text-gray-600">
              Choose how you want to engage with your clients
            </p>
          </div>
          <ServiceEngagement />
        </div>
      </div>
    </div>
  );
}
