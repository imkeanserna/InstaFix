import RequestConfirmation from "@/components/posts/service-engagement";

export const runtime = 'edge'

export default function Page() {
  return (
    <div className="h-[90vh] bg-gradient-to-b from-white to-yellow-50 flex justify-center items-center px-4">
      <div className="max-w-3xl mx-auto space-y-8 pt-12">
        <div className="text-center space-y-8 md:space-y-2">
          <h1 className="text-start text-2xl md:text-3xl font-bold text-gray-900">
            How would you like to confirm project requests?
          </h1>
          <p className="text-gray-600 text-sm">
            Choose how you want to handle incoming project bookings
          </p>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="w-full md:w-2/5 px-16 md:px-0">
            <RequestConfirmation />
          </div>
        </div>
      </div>
    </div>
  );
}
