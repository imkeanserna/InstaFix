"use client";

import { LayoutDashboard, Sparkles, Star, Tag } from "lucide-react";
import { differenceInDays } from 'date-fns';

export function UserSkillRating({
  skills,
  averageRating,
  noOfReviews,
  createdAt
}: {
  skills: string[],
  averageRating: number,
  noOfReviews: number,
  createdAt: Date
}) {
  const isNewPost = differenceInDays(new Date(), createdAt) <= 21;
  const showRatingsAndReviews = noOfReviews > 0 && averageRating > 0;

  return (
    <div className="p-4 w-full flex flex-col relative bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50 my-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(251,191,36,0.05)_1px,transparent_0)] bg-[size:24px_24px]"></div>
      {/* Floating orbs in background */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-200/10 rounded-full blur-3xl animate-float-slower"></div>

      <div className="relative flex justify-center items-center gap-12 px-8 py-4 rounded-3xl mx-auto overflow-hidden 
                      bg-gradient-to-br from-amber-50 via-white to-yellow-50 border-amber-200/50
                      shadow-xl border hover:shadow-2xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32 blur-3xl bg-amber-400/20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-32 -translate-x-32 blur-3xl bg-yellow-400/20"></div>

        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,0.03)_25%,rgba(251,191,36,0.03)_50%,transparent_50%,transparent_75%,rgba(251,191,36,0.03)_75%)] bg-[length:4px_4px]"></div>

        <div className="flex flex-col gap-6 items-start relative">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <LayoutDashboard className="w-6 h-6 text-amber-500" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-amber-400" />
              </div>
              <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500">
                Freelancer Skills
              </p>
            </div>
            <p className="text-xs text-gray-600">
              A showcase of skills and expertise to help clients find the right freelancer for their needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-start">
            {skills.map((skill) => (
              <div
                key={skill}
                className="flex gap-2 items-center group cursor-pointer capitalize 
                           py-2 px-4 rounded-full transition-all duration-300 text-xs
                           border-amber-200 bg-white text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md
                           border backdrop-blur-sm"
              >
                <Tag className="w-4 h-4 transition-colors text-amber-500 group-hover:text-amber-600" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-200 to-transparent"></div>
        {isNewPost && !showRatingsAndReviews
          ?
          <div className="flex flex-col items-center group">
            <p className="text-3xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
              New
            </p>
            <p className="text-xs px-20 font-medium cursor-pointer transition-colors text-gray-600 hover:text-amber-600">
              Post
            </p>
          </div>
          :
          <>
            <div className="flex flex-col items-center group">
              <p className="text-3xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
                {averageRating.toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {RenderStars(averageRating, "w-4 h-4")}
              </div>
            </div>

            <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-200 to-transparent"></div>

            <div className="flex flex-col items-center group">
              <p className="text-3xl font-semibold bg-clip-text text-transparent group-hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 to-amber-700">
                {noOfReviews}
              </p>
              <p className="text-xs font-medium cursor-pointer transition-colors text-gray-600 hover:text-amber-600">
                Reviews
              </p>
            </div>
          </>
        }
        {/*Badge in the top right side corner*/}
        {isNewPost && showRatingsAndReviews && (
          <div className="absolute top-2 -right-16 rotate-[30deg]">
            <div className="relative">
              <div className="py-1 bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg px-20">
                <p className="uppercase font-semibold text-white">New</p>
              </div>
              <div className="absolute -inset-0.5 bg-amber-300/20 rounded-full blur"></div>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px blur-sm bg-amber-400/50"></div>
      </div>
    </div>
  );
}

export const RenderStars = (rating: number, className?: string) => {
  return [...Array(5)].map((_, index) => {
    const fillPercentage = Math.min(Math.max((rating - index) * 100, 0), 100);

    return (
      <div key={index} className="relative w-4 h-4">
        <Star
          className={`${className} absolute group-hover:scale-110 transition-transform stroke-amber-400`}
        />
        <div
          className="absolute w-4 h-4 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star
            className={`${className} group-hover:scale-110 transition-transform fill-amber-400 stroke-amber-400`}
          />
        </div>
      </div>
    );
  });
};
