import { Navbar } from "@repo/ui/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, description, children }: ContentLayoutProps) {
  return (
    <div>
      <Navbar title={title} description={description} />
      <div className="min-h-screen py-6">{children}</div>
    </div>
  );
}
