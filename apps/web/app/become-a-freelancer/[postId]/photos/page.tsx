import { AddServicePhoto } from "@/components/posts/addServicePhoto";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your photos</p>
      </div>
      <div>
        <AddServicePhoto
          allowedFileTypes={['image/jpeg', 'image/png', 'image/jpg']}
        />
      </div>
    </div>
  );
}
