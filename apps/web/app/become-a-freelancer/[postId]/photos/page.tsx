import { AddServicePhoto } from "@/components/posts/addServicePhoto";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-8 px-4 sm:py-16 sm:px-0 lg:py-28 lg:px-96">
      <AddServicePhoto
        allowedFileTypes={['image/jpeg', 'image/png', 'image/jpg']}
      />
    </div>
  );
}
