import RequestConfirmation from "@/components/posts/service-engagement";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your instant book</p>
      </div>
      <div>
        <RequestConfirmation />
      </div>
    </div>
  );
}
