import { useRecoilState } from "recoil";
import { sidebarOpenState } from "@repo/store";

export interface SidebarState {
  isOpen: boolean;
  setIsOpen: () => void;
}

export function useSidebarToggle() {
  const [isOpen, setIsOpen] = useRecoilState(sidebarOpenState);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    setIsOpen: toggleSidebar
  };
}
