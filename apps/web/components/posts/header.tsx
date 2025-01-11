"use client";

import { usePathname } from 'next/navigation';
import { Button } from '@repo/ui/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const clientPathname = usePathname();
  const isAboutServicePage = (clientPathname)?.includes('overview');
  const isPublishFinished = (clientPathname)?.includes('publish-celebration');

  return (
    <div className='fixed top-0 left-0 right-0 bg-white'>
      {isAboutServicePage ?
        <div className=" flex justify-between p-4">
          <h1>Become a Freelancer</h1>
          <Button
            variant="outline"
            className='rounded-full transform active:scale-95 px-8 py-6'
            onClick={() => {
              router.push('/find');
            }}
          >Exit</Button>
        </div>
        :
        <div className=" flex justify-between p-4">
          <h1>Become a Freelancer</h1>
          {!isPublishFinished &&
            <Button
              variant="outline"
              className='rounded-full transform active:scale-95 px-6 py-6'
              onClick={() => {
                router.push('/become-a-freelancer/overview');
              }}
            >{`Save & exit`}</Button>
          }
        </div>
      }
    </div>
  )
}
