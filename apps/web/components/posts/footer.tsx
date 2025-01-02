"use client";

import { usePathname } from 'next/navigation';
import DraftButton from './draftButton';
import Link from "next/link";

export default function Footer() {
  const clientPathname = usePathname();
  const isAboutServicePage = (clientPathname)?.includes('overview');

  return (
    <div>
      {isAboutServicePage ?
        <div className="flex justify-between p-4">
          <Link href="/become-a-freelancer">Back</Link>
          <DraftButton />
        </div>
        : <div>
          <p>Footer</p>
        </div>}
    </div>
  )
}
