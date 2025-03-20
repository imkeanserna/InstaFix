import { AddServicePhoto } from "@/components/posts/addServicePhoto";

export default function Page() {
  return (
    <div className="h-full py-24 px-0 md:py-20 md:px-96">
      <AddServicePhoto
        allowedFileTypes={['image/jpeg', 'image/png', 'image/jpg']}
      />
    </div>
  );
}
