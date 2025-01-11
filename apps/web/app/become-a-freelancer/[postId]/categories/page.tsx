import Categories from "@/components/posts/categories";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-start space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Choose Your Category
            </h1>
            <p className="text-sm text-gray-600">
              Select a category that best describes your service
            </p>
          </div>
          <Categories />
        </div>
      </div>
    </div>
  );
}
