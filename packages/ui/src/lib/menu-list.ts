import {
  Settings,
  LayoutGrid,
  LucideIcon,
  Zap,
  PlusIcon,
  House,
  UserPlus,
  Folder
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon
  submenus: Submenu[];
  disabled?: boolean;
  comingSoon?: boolean;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard/subscription",
          label: "Upgrade",
          active: pathname.includes("/dashboard/subscription"),
          icon: Zap,
          submenus: [],
          disabled: false
        },
        {
          href: "/become-a-freelancer",
          label: "New Post",
          active: pathname.includes("/become-a-freelancer"),
          icon: PlusIcon,
          submenus: [],
          disabled: false
        },
        {
          href: "/dashboard/all-posts",
          label: "Dashboard",
          active: pathname.includes("/dashboard/all-posts"),
          icon: House,
          submenus: [],
          disabled: false
        }
      ]
    },
    {
      groupLabel: "Posts",
      menus: [
        {
          href: "/dashboard/all-posts",
          label: "All Posts",
          active: pathname.includes("/dashboard/all-posts"),
          icon: Folder,
          submenus: [],
          disabled: false
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "#",  // Changed to "#" to prevent navigation
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
          submenus: [],
          disabled: true,
          comingSoon: true
        },
        {
          href: "#",  // Changed to "#" to prevent navigation
          label: "Refer a Friend",
          active: pathname.includes("/refer-a-friend"),
          icon: UserPlus,
          submenus: [],
          disabled: true,
          comingSoon: true
        }
      ]
    }
  ];
}
