"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import Image from "next/image";

export function FinalSetup() {
  return (
    <div>
      <p>Review your service posts</p>
      <p>Your post has been live and you can see it here</p>
      <div>
        <ImageCard
          imageUrl={`https://pub-e0bfb8aa11494284842ae2b0f72da1ef.r2.dev/1736255251212-7asqf2fgln.jpg`}
          title="Publish Celebration"
          buttonText="View post"
          onButtonClick={() => { }}
        />
      </div>
    </div>
  );
}

interface ImageCardProps {
  imageUrl: string
  title: string
  buttonText: string
  onButtonClick: () => void
}

export function ImageCard({ imageUrl, title, buttonText, onButtonClick }: ImageCardProps) {
  return (
    <Card className="w-full max-w-sm overflow-hidden">
      <CardContent className="p-0 relative">
        <Image
          src={imageUrl}
          alt={title}
          width={384}
          height={256}
          layout="responsive"
          className="object-cover"
        />
        <Button
          onClick={onButtonClick}
          className="absolute top-4 left-4 z-10"
        >
          {buttonText}
        </Button>
      </CardContent>
      <CardFooter className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardFooter>
    </Card>
  )
}

