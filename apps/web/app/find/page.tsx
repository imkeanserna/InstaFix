import { ImageUpload } from "@/components/ui/imageUpload";

export const runtime = "edge";

const Page = () => {
  return (
    <div className="text-white">
      <h1>Find</h1>
      <ImageUpload />
    </div>
  )
}

export default Page;
