'use client';

import { Label } from "@repo/ui/components/ui/label";

export function ImageUpload() {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const response = await fetch(`${process.env.NEXT_BASE_URL}/api/object-detection`, {
        method: 'POST',
        body: file
      });

      const result = await response.json();
      console.log(result);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div className="inline-block max-w-sm items-center gap-1.5">
      <Label htmlFor="picture" className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Select Image
      </Label>
      <input
        id="picture"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
