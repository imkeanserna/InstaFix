import Categories from "@/components/posts/categories";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-20 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-start space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Choose Your Category
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Select a category that best describes your service
            </p>
          </div>
          <Categories />
        </div>
      </div>
    </div>
  );
}
