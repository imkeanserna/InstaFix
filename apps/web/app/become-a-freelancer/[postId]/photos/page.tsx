import { AddServicePhoto } from "@/components/posts/addServicePhoto";

export default function Page() {
  return (
    <div className="h-full py-24 px-4 sm:py-16 sm:px-0 lg:py-20 lg:px-96">
      <AddServicePhoto
        allowedFileTypes={['image/jpeg', 'image/png', 'image/jpg']}
      />
    </div>
  );
}
