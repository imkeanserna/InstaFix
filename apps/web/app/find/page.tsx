import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { CategorySelector } from "@/components/categories/categorySelector";
import { ImageUpload } from "@/components/ui/imageUpload";

export const runtime = "edge";

const Page = () => {
  return (
    <div className="dark:bg-background">
      {/* <ImageUpload /> */}
      {/* <DiaglogCamera /> */}
      <CategorySelector />
    </div>
  )
}

export default Page;
