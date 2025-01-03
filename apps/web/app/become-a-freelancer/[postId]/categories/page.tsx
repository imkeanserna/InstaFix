import Categories from "@/components/posts/categories";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="">
      <div>
        <p>Welcome to about your categories</p>
      </div>
      <Categories />
    </div>
  );
}
