"use client"

import { ReactNode, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Facebook, Mail, Share2, Twitter } from 'lucide-react'
import { Button } from "@repo/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import { FaWhatsapp } from 'react-icons/fa'

interface QRDialogProps {
  qrValue: string;
  children: ReactNode;
}

export function QRDialog({ qrValue, children }: QRDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hashedValue, setHashedValue] = useState("")
  const postUrl = `${process.env.NEXT_BACKEND_URL}/${qrValue}`;
  const postTitle = "Check out my post!";

  useEffect(() => {
    const generateBcryptLikeHash = (input: string) => {
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '$2b$10$';
      const seed = input.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      for (let i = 0; i < 22; i++) {
        const index = (seed * (i + 1)) % base64Chars.length;
        result += base64Chars[index];
      }
      return result;
    };
    setHashedValue(generateBcryptLikeHash(qrValue));
  }, [qrValue]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${postTitle} ${postUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(postUrl)}`
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    window.open(url, '_blank', 'width=600,height=400');
  };

  const preventRightClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  const preventSelection = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  const canUseNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: postTitle,
        url: postUrl
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md !rounded-2xl">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code or share the URL.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG value={qrValue} size={200} />

          <div className="flex w-full items-center space-x-2">
            <input
              className="flex-1 px-3 py-2 text-sm border rounded-md user-select-none"
              value={hashedValue}
              readOnly
              onContextMenu={preventRightClick}
              onMouseDown={preventSelection}
              style={{ userSelect: 'none' }}
            />
            <Button size="sm" onClick={copyToClipboard} variant="outline">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>

          {canUseNativeShare ? (
            <Button onClick={handleNativeShare} variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          ) : (
            <div className="flex justify-center space-x-2 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare('facebook')}
                className="hover:text-blue-600 rounded-full"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare('twitter')}
                className="hover:text-sky-500 rounded-full"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare('whatsapp')}
                className="hover:text-green-500 rounded-full"
              >
                <FaWhatsapp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShare('email')}
                className="hover:text-gray-600 rounded-full"
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
