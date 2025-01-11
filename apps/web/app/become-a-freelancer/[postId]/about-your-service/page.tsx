import { Card } from "@repo/ui/components/ui/card";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="h-full w-full py-48">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          {/* Left Content Section */}
          <div className="flex-1 w-full md:max-w-[50%] space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-medium text-gray-600">Step 1 of 3</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tell us about your service
                </h1>
                <Card className="p-6 border-none bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm">
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      We're excited to learn more about the services you offer. Please provide the necessary details so that we can showcase your service to the right audience.
                    </p>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <p className="text-sm">
                        Make sure to fill in all the required information accurately. This helps potential customers understand your offering and makes your listing more attractive.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
          {/* Right Image Section */}
          <div className="flex-1 w-full md:max-w-[50%] relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-2xl" />
            <Card className="relative overflow-hidden border-none shadow-xl">
              <div className="relative w-full h-[400px]">
                <Image
                  src="https://plus.unsplash.com/premium_photo-1736437251499-9b5d6f0a9a53?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8fHx8"
                  alt="Service Preview"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
