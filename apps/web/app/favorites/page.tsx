import { redirect } from "next/navigation";
import { currentUser } from "@/lib";
import { Suspense } from "react";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<div>Loading....</div>}>
      <div>
        <h1>Favorites</h1>
      </div>
    </Suspense>
  );
}

export default Page;
