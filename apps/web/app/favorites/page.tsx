import { redirect } from "next/navigation";
import { currentUser } from "@/lib";
import { Suspense } from "react";
import { Favorite } from "@/components/favorite/favorite";
import { FavoriteSkeleton } from "@/components/favorite/skeleton";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<FavoriteSkeleton />}>
      <Favorite />
    </Suspense>
  );
}

export default Page;
