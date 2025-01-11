import { AddServicePhoto } from "@/components/posts/addServicePhoto";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full py-28">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          Add some examples of your work
        </h2>
        <p className="text-gray-600 text-sm">
          You'll need atleast 1 photo to get started. You can add more or make changes later
        </p>
      </div>
      <AddServicePhoto
        allowedFileTypes={['image/jpeg', 'image/png', 'image/jpg']}
      />
    </div>
  );
}
