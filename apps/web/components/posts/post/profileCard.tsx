"use client";

import { formatTimeAgo, getAudienceConfig, getEngagementConfig, getServiceConfig } from "@/lib/profile";
import { ServiceEngagement, ServiceLocationType, TargetAudience } from "@prisma/client/edge";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { differenceInDays } from "date-fns";
import { Calendar, Clock, MapPin, MessageSquareCode, Star, Users } from "lucide-react";

interface FreelancerProfileProps {
  name: string;
  avatarUrl: string;
  reviews: number;
  rating: number;
  monthsHosting: Date;
  serviceLocation: ServiceLocationType;
  audience: TargetAudience;
  engagementType: ServiceEngagement;
  createdAt: Date;
}

const FreelancerProfileCard: React.FC<FreelancerProfileProps> = ({
  name,
  avatarUrl,
  reviews,
  rating,
  monthsHosting,
  serviceLocation,
  audience,
  engagementType,
  createdAt
}) => {
  const isNewProfile = differenceInDays(new Date(), createdAt) <= 21;
  const showRatingsAndReviews = reviews > 0 && rating && rating > 0;

  return (
    <div className="w-full flex flex-col relative bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(251,191,36,0.05)_1px,transparent_0)] [background-size:24px_24px]"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-200/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4 relative justify-center items-center bg-gradient-to-br from-amber-50 via-white to-yellow-50 border-amber-200/50 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,0.03)_25%,rgba(251,191,36,0.03)_50%,transparent_50%,transparent_75%,rgba(251,191,36,0.03)_75%)] [background-size:4px_4px] rounded-2xl"></div>

        <CardHeader className="flex flex-row items-start gap-8 space-y-0 p-0">
          <div className="text-center space-y-3 flex flex-col justify-center items-center">
            <Avatar className="h-32 w-32 border-4 border-blue-50">
              <AvatarImage src={avatarUrl} alt={`${name}'s avatar`} className="object-cover" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center capitalize">
              <p className="text-xl font-bold text-gray-800">{name}</p>
              <p className="text-xs text-gray-500 font-medium">Freelance Creator</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatItem
              icon={<MessageSquareCode className="h-4 w-4 text-gray-500" />}
              value={isNewProfile && !showRatingsAndReviews ? "New" : `${reviews}`}
              label="Reviews"
            />
            <StatItem
              icon={<Star className="h-4 w-4 text-gray-500" />}
              value={rating.toFixed(1)}
              label="Rating"
            />
            <StatItem
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
              value={formatTimeAgo(monthsHosting)}
              label={`${formatTimeAgo(monthsHosting, true)} Hosting`}
            />
          </div>
        </CardHeader>

        <div className="h-px w-80 my-2 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>

        <CardContent className="p-0">
          <div className="flex gap-4 text-gray-600">
            <DetailItem
              icon={<MapPin className="h-4 w-4 text-yellow-500" />}
              text={getServiceConfig(serviceLocation).label}
            />
            <DetailItem
              icon={<Users className="h-4 w-4 text-yellow-500" />}
              text={getAudienceConfig(audience).label}
            />
            <DetailItem
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              text={getEngagementConfig(engagementType.engagementType).label}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for statistic items
const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="space-y-1">
    <div className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-amber-700">
      {value}
    </div>
    <div className="flex items-center gap-1 capitalize">
      {icon}
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  </div>
);

// Helper component for detail items
const DetailItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 py-1">
    {icon}
    <span className="text-xs">{text}</span>
  </div>
);

export default FreelancerProfileCard;
