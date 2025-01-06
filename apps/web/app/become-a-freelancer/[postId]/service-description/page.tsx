import { ServiceDescription } from "@/components/posts/service-description";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your service description</p>
      </div>
      <div>
        <ServiceDescription />
      </div>
    </div>
  );
}
