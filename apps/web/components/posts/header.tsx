"use client";

import { usePathname } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';

export default function Header() {
  const clientPathname = usePathname();
  const isAboutServicePage = (clientPathname)?.includes('overview');

  return (
    <div>
      {isAboutServicePage ?
        <div className="flex justify-between p-4">
          <h1>Become a Freelancer</h1>
          <Button>Exit</Button>
        </div>
        :
        <div>
          <p>Header</p>
        </div>
      }
    </div>
  )
}
