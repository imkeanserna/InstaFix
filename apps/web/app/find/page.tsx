import { DiaglogCamera } from "@/components/camera/diaglogCamera";
import { CategorySelector } from "@/components/categories/categorySelector";
import { PostsPage } from "@/components/posts/find/postsPage";
import { Filters } from "@/components/ui/filters";
import { ImageUpload } from "@/components/ui/imageUpload";

const Page = () => {
  return (
    <div className="dark:bg-background">
      {/* <ImageUpload /> */}
      {/* <DiaglogCamera /> */}
      {/* <CategorySelector /> */}
      {/* <Filters /> */}
      <PostsPage />
    </div>
  )
}

export default Page;
