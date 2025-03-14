import ProfileDropdown from "@/components/user/ProfileDropdown";
import { currentUser } from "@/lib";
import { getInitials } from "@/lib/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "lucide-react";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300 flex items-center justify-center px-4 py-8">
      <div className="z-50 absolute top-8 right-8">
        <ProfileDropdown user={user} />
      </div>
      <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <Badge className="text-xs">
            Verified User
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage
                src={user?.image || '/default-avatar.png'}
                alt={user?.name || 'User Avatar'}
              />
              <AvatarFallback>{getInitials(user?.name!)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {user?.name || 'Anonymous User'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {user?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
