import { SheetMenu } from "@repo/ui/components/admin-panel/sheet-menu";

interface NavbarProps {
  title: string;
  description: string;
}

export function Navbar({ title, description }: NavbarProps) {
  return (
    <header className="w-full">
      <div className="mx-4 sm:mx-8 flex h-14 items-center py-16 border-b border-b-gray-300">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <div className="space-y-2">
            <h1 className="font-bold text-3xl">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
