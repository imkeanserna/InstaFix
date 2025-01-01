import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { ImageUpload } from "@/components/ui/imageUpload";

export const runtime = "edge";

const Page = () => {
  return (
    <div className="dark:bg-background">
      <ImageUpload />
      <DiaglogCamera />
    </div>
  )
}

export default Page;
