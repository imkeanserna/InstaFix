import { FinalSetup } from "@/components/posts/final-setup";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your publish celebration</p>
      </div>
      <div>
        <FinalSetup />
      </div>
    </div>
  );
}
