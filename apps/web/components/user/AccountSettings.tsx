"use client";

import { CurrencyToggle } from "@/components/posts/notification/notification";
import { useCurrency } from "@/hooks/useCurrency";
import { useMediaQuery } from "@/hooks/useMedia";
import { getInitials } from "@/lib/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Banknote, ChevronRight, CircleUserRound, Settings } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";

const SectionHeader = memo(({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-semibold pb-2">{children}</h2>
));
SectionHeader.displayName = 'SectionHeader';

const MenuRow = memo(({
  icon,
  label,
  rightElement = <ChevronRight />,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    className="flex justify-between items-center py-4 cursor-pointer active:scale-[0.99]"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
    {rightElement}
  </div>
));
MenuRow.displayName = 'MenuRow';

const Section = memo(({
  children,
  withBorder = true
}: {
  children: React.ReactNode;
  withBorder?: boolean;
}) => (
  <div className={`flex flex-col gap-2 py-4 ${withBorder ? 'border-b border-gray-300' : ''}`}>
    {children}
  </div>
));
Section.displayName = 'Section';

const UserProfile = memo(({ user }: { user: User }) => (
  <div className="flex justify-between items-center gap-2 cursor-pointer">
    <div className="flex justify-between items-center gap-6">
      <Avatar className="h-12 w-12 border-2 border-amber-500">
        <AvatarImage
          src={user?.image || '/default-avatar.png'}
          alt={user?.name || 'User Avatar'}
        />
        <AvatarFallback>{getInitials(user?.name!)}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <p className="font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>
    </div>
    <ChevronRight />
  </div>
));
UserProfile.displayName = 'UserProfile';

const FreelancerCard = memo(({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex justify-between cursor-pointer items-center border border-gray-300 rounded-2xl py-8 px-6 shadow-lg mb-4 active:scale-[0.99]"
  >
    <div className="space-y-1">
      <p className="text-lg font-medium">Be a Instafix Freelancer</p>
      <p className="text-sm text-gray-700">Turn your skills into income, start freelancing today!</p>
    </div>
    <Image
      src={"/book/become-a-freelancer.webp"}
      alt={"Be a Instafix Freelancer"}
      width={150}
      height={150}
      className="rounded-2xl h-auto w-28 object-contain scale-100 shadow-md border border-gray-300"
    />
  </div>
));
FreelancerCard.displayName = 'FreelancerCard';

const LogoutButton = memo(({ onClick }: { onClick?: () => void }) => (
  <Button
    onClick={onClick}
    className="w-full bg-red-600 py-8 text-white text-sm font-medium rounded-xl hover:bg-red-700 active:scale-[0.97]"
  >
    Log out
  </Button>
));
LogoutButton.displayName = 'LogoutButton';

function AccountSettingsComponent({ user }: { user: User }) {
  const { currency, changeCurrency } = useCurrency();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleFreelancerClick = useCallback(() => {
    router.push("/become-a-freelancer");
  }, [router]);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/find" })
  }, []);

  if (!isMobile) {
    router.back();
    return;
  }

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-semibold py-2">Profile</h1>
      <Section>
        <UserProfile user={user} />
      </Section>
      <Section>
        <MenuRow
          icon={<CircleUserRound className="text-gray-600" />}
          label="Personal info"
        />
        <MenuRow
          icon={<Settings className="text-gray-600" />}
          label="Account"
        />
      </Section>
      <Section>
        <SectionHeader>Listing</SectionHeader>
        <FreelancerCard onClick={handleFreelancerClick} />
      </Section>
      <Section>
        <SectionHeader>Settings</SectionHeader>
        <MenuRow
          icon={<Banknote className="text-gray-600" />}
          label="Currency"
          rightElement={<CurrencyToggle currency={currency} changeCurrency={changeCurrency} />}
        />
      </Section>
      <Section withBorder={false}>
        <LogoutButton onClick={handleLogout} />
      </Section>
    </div>
  );
}
export const AccountSettings = memo(AccountSettingsComponent);

export const AccountSettingsSkeleton = () => {
  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="h-10 w-32 mb-2 animate-pulse bg-gray-200 rounded-md" />

      {/* User Profile Section */}
      <div className="flex flex-col gap-2 py-6 border-b border-gray-300">
        <div className="flex justify-between items-center gap-2">
          <div className="flex justify-between items-center gap-6">
            <div className="h-12 w-12 rounded-full animate-pulse bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse bg-gray-200 rounded-md" />
              <div className="h-3 w-40 animate-pulse bg-gray-200 rounded-md" />
            </div>
          </div>
          <ChevronRight className="text-gray-200" />
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="flex flex-col gap-2 py-6 border-b border-gray-300">
        {/* First Menu Row */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 rounded-full animate-pulse bg-gray-200" />
            <div className="h-4 w-24 animate-pulse bg-gray-200 rounded-md" />
          </div>
          <ChevronRight className="text-gray-200" />
        </div>

        {/* Second Menu Row */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 rounded-full animate-pulse bg-gray-200" />
            <div className="h-4 w-24 animate-pulse bg-gray-200 rounded-md" />
          </div>
          <ChevronRight className="text-gray-200" />
        </div>
      </div>

      {/* Listing Section */}
      <div className="flex flex-col gap-2 py-6 border-b border-gray-300">
        {/* Section Header */}
        <div className="h-8 w-36 mb-2 animate-pulse bg-gray-200 rounded-md" />

        {/* Freelancer Card */}
        <div className="flex justify-between items-center border border-gray-200 rounded-2xl py-8 px-6 shadow-lg mb-4">
          <div className="space-y-1 w-2/3">
            <div className="h-6 w-full animate-pulse bg-gray-200 rounded-md" />
            <div className="h-4 w-full mt-2 animate-pulse bg-gray-200 rounded-md" />
          </div>
          <div className="h-28 w-28 rounded-2xl animate-pulse bg-gray-200" />
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col gap-2 py-6 border-b border-gray-300">
        {/* Section Header */}
        <div className="h-8 w-36 mb-2 animate-pulse bg-gray-200 rounded-md" />

        {/* Currency Menu Row */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-5 w-5 rounded-full animate-pulse bg-gray-200" />
            <div className="h-4 w-24 animate-pulse bg-gray-200 rounded-md" />
          </div>
          <div className="h-6 w-16 animate-pulse bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Logout Button Section */}
      <div className="flex flex-col gap-2 py-6">
        <div className="w-full h-14 rounded-xl animate-pulse bg-gray-200" />
      </div>
    </div>
  );
};
