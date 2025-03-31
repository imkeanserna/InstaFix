"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@repo/ui/components/ui/button";
import { toast } from "sonner";
import { DotTypingLoading } from "../ui/dot-typing-loading";

export const GoogleForm: FC<{
  onSuccess?: () => void;
  callbackUrl?: string;
  isMobile?: boolean;
}> = ({
  onSuccess,
  callbackUrl,
  isMobile
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
      const error = searchParams.get("error");

      if (error) {
        let errorMsg = "Something went wrong with authentication";

        switch (error) {
          case "CredentialsSignin":
            errorMsg = "Invalid credentials";
            break;
          case "AccessDenied":
            errorMsg = "Access denied. You may have declined permission";
            break;
          case "OAuthAccountNotLinked":
            errorMsg = "Email already exists with different provider";
            break;
          case "OAuthSignInError":
            errorMsg = "Could not sign in with Google";
            break;
          case "OAuthCallbackError":
            errorMsg = "Error during Google authentication";
            break;
        }
        toast.error(errorMsg);
      }
    }, [searchParams]);

    const handleGoogleSignIn = async () => {
      try {
        setIsLoading(true);

        const result = await signIn("google", {
          callbackUrl: callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        if (result?.url) {
          toast.success("Successfully signed in with Google");
          if (onSuccess) {
            onSuccess();
          }
          router.push(result.url);
        }
      } catch (error) {
        toast.error("Failed to connect with Google. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex flex-col items-center w-full">
        <Button
          disabled={isLoading}
          variant="outline"
          size="lg"
          className={`${isMobile ? "py-9 rounded-full" : "py-8 rounded-2xl"} w-full bg-yellow-400 flex items-center shadow-sm border border-gray-900
                justify-start gap-12 hover:bg-yellow-500 active:scale-[0.98]`}
          onClick={handleGoogleSignIn}
        >
          {isLoading ? (
            <DotTypingLoading />
          ) : (
            <FcGoogle className="w-8 h-8" />
          )}
          <span className={`${isMobile ? "text-lg text-gray-800 font-bold" : "text-sm text-gray-700"}`}>Continue with Google</span>
        </Button>
      </div>
    );
  }
