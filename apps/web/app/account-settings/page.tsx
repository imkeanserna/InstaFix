import { redirect } from "next/navigation";
import { currentUser } from "@/lib";
import { AccountSettings, AccountSettingsSkeleton } from "@/components/user/AccountSettings";
import { Suspense } from "react";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<AccountSettingsSkeleton />}>
      <AccountSettings user={user} />
    </Suspense>
  );
}

export default Page;
