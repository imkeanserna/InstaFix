import RequestConfirmation from "@/components/posts/service-engagement";

export default function Page() {
  return (
    <div className="h-full bg-gradient-to-b from-white to-yellow-50 py-20 sm:py-28">
      <div className="max-w-3xl mx-auto space-y-8 pt-12">
        <div className="text-center space-y-8 md:space-y-2">
          <h1 className="text-start text-2xl md:text-3xl font-bold text-gray-900">
            How would you like to confirm project requests?
          </h1>
          <p className="text-gray-600 text-sm">
            Choose how you want to handle incoming project bookings
          </p>
        </div>
        <RequestConfirmation />
      </div>
    </div>
  );
}
