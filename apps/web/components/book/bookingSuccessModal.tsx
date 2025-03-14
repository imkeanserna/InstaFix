"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Calendar, Check, PartyPopper, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function BookingSuccessModal({
  isOpen,
  onClose,
  postTitle = "Service"
}: {
  isOpen: boolean
  onClose: () => void
  postTitle?: string
}) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95%] mx-auto !rounded-[24px] p-4 sm:p-6 border-0">
        <Button
          variant="outline"
          onClick={onClose}
          className="absolute left-2 sm:left-4 top-2 sm:top-4 rounded-full p-2 sm:px-3 sm:py-4 border-none hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </Button>
        <DialogHeader>
          <div className="w-full flex flex-col items-center pt-6 sm:pt-2">
            <div className="mb-3 sm:mb-4 relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="absolute -right-1 -top-1">
                <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              </div>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
              Booking Request Sent!
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 py-3 sm:py-4">
          <p className="text-center text-gray-600 text-xs sm:text-sm px-2">
            Your booking request for <span className="font-medium text-gray-900">{postTitle}</span> has been successfully submitted.
          </p>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg w-full">
            <div className="flex items-start gap-2 sm:gap-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-gray-600">
                {`The freelancer will review your request within 24 hours.
                You'll receive a notification once they respond.`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2 sm:mt-4">
          <Button
            onClick={() => {
              router.push('/notifications');
            }}
            className="w-full py-7 rounded-lg active:scale-[.97] bg-yellow-500 text-white hover:bg-yellow-400 hover:border hover:border-gray-900 hover:text-gray-900 text-sm"
          >
            View Your Notifications
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full py-7 rounded-lg text-sm active:scale-[.97]"
          >
            Return to Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
