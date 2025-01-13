import { ServiceDescription } from "@/components/posts/service-description";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-28 md:py-28">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
          Tell clients what your services include
        </h2>
        <p className="text-gray-600 text-[11px] sm:text-sm">
          Help clients understand your expertise and what makes your service unique.
        </p>
      </div>
      <ServiceDescription />
    </div>
  );
}
