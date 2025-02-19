import { EngagementType, ServiceLocationType, TargetAudience } from "@prisma/client/edge";
import { Building, Building2, Clock, Globe, Heart, MessageSquare, RepeatIcon, Settings, UserCheck, Users, Users2 } from "lucide-react";

export const getInitials = (name: string) => {
  return name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'UN';
};

export const formatTimeAgo = (date: Date, formatTime?: boolean): number | string => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return formatTime ? years > 1 ? "years" : "year" : years;
  } else if (months > 0) {
    return formatTime ? months > 1 ? "months" : "month" : months;
  } else if (days > 0) {
    return formatTime ? days > 1 ? "days" : "day" : days;
  } else if (hours > 0) {
    return formatTime ? hours > 1 ? "hours" : "hour" : hours;
  } else if (minutes > 0) {
    return formatTime ? minutes > 1 ? "minutes" : "minute" : minutes;
  } else {
    return formatTime ? seconds > 1 ? "seconds" : "second" : seconds;
  }
};

const serviceConfig = {
  ONLINE: {
    label: "Online",
    icon: Globe
  },
  IN_PERSON: {
    label: "In-Person",
    icon: UserCheck
  },
  HYBRID: {
    label: "Hybrid",
    icon: Users2
  }
};

const audienceConfig = {
  STARTUPS: {
    label: 'Startups',
    icon: Building2
  },
  ENTERPRISES: {
    label: 'Enterprises',
    icon: Building
  },
  INDIVIDUALS: {
    label: 'Individuals',
    icon: Users
  },
  NON_PROFITS: {
    label: 'Non Profits',
    icon: Heart
  }
};

const engagementConfig = {
  ONE_TIME_PROJECT: {
    label: 'One time project',
    icon: Clock
  },
  ONGOING_COLLABORATION: {
    label: 'Ongoing Collaboration',
    icon: RepeatIcon
  },
  CONSULTATION: {
    label: 'Consultation',
    icon: MessageSquare
  },
  CUSTOM_ARRANGEMENT: {
    label: 'Custom Arrangement',
    icon: Settings
  }
};

export const getServiceConfig = (type: ServiceLocationType) => serviceConfig[type];
export const getAudienceConfig = (type: TargetAudience) => audienceConfig[type];
export const getEngagementConfig = (type: EngagementType) => engagementConfig[type];
