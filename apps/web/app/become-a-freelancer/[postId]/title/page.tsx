import { Title } from "@/components/posts/titleAndDescription";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full flex justify-center items-center py-36 md:py-52">
      <Title />
    </div>
  );
}
