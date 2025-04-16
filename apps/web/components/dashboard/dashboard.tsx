"use client";

import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Filter, MoreHorizontal, Pencil, Search } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PostWithUserInfo } from '@repo/types';
import { getPostsByUserId } from '@/lib/postUtils';
import { formateDatePosts } from '@/lib/dateFormatters';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar';
import { getInitials } from '@/lib/profile';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export const currencySymbols = {
  USD: '$',
  PHP: '₱',
};

export function DashboardPage() {
  const { currency } = useCurrency();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<PostWithUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchUserPosts = async (userId: string) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const result: PostWithUserInfo[] = await getPostsByUserId({ userId })
      setPosts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchUserPosts(session.user.id);
  }, [session?.user?.id]);

  const renderPricing = (post: PostWithUserInfo) => {
    switch (post.pricingType) {
      case 'HOURLY':
        return `${currencySymbols[currency as keyof typeof currencySymbols]}${post.hourlyRate}/hr`;
      case 'FIXED_PRICE':
        return `${currencySymbols[currency as keyof typeof currencySymbols]}${post.fixedPrice}`;
      case 'PACKAGE':
        return 'Package';
      case 'CUSTOM':
        return 'Custom';
      default:
        return 'Not specified';
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If loading and no posts yet, show skeleton
  if (isLoading && posts.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <Tabs defaultValue="published" className="w-full mb-14">
          <TabsList className="bg-gray-white p-1 gap-1">
            <TabsTrigger
              value="published"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Published
              <span className="ml-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {posts.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Drafts
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="deleted"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Deleted
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search articles"
              className="pl-14 py-6 border-gray-300 rounded-full w-full text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 text-gray-700 rounded-full py-6">
            <Filter size={16} />
            Filter
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">
              {searchTerm ? "No matching posts found" : "No posts found"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mt-2 text-gray-700 rounded-lg"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Posts Table */}
        {filteredPosts.length > 0 && (
          <div className="border border-gray-200 rounded-3xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-6">
                <span className="font-medium text-gray-700">Title</span>
              </div>
              <div className="col-span-3">
                <span className="font-medium text-gray-700">Pricing</span>
              </div>
              <div className="col-span-1">
                <span className="font-medium text-gray-700">Rating</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="font-medium text-gray-700">Actions</span>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {filteredPosts.map(post => (
                <div key={post.id} className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="col-span-6 flex items-start gap-3 p-4">
                    {post.coverPhoto && (
                      <Image
                        src={post.coverPhoto}
                        alt={post.title || 'Post cover'}
                        width={150}
                        height={150}
                        className="w-20 h-20 object-cover rounded cursor-pointer"
                        onClick={() => {
                          router.push(`/find/${post.user.name}/${post.title}/${post.id}`);
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{post.title || 'Untitled Post'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6 border border-gray-500 text-gray-500 text-xs">
                          <AvatarImage
                            className="object-cover"
                            src={post.user?.image || '/default-avatar.png'}
                            alt={post.user.name || 'User Avatar'}
                          />
                          <AvatarFallback>{getInitials(post.user.name!)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">
                          {post.user?.name || 'Anonymous'} · {formateDatePosts(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center text-gray-700 p-4">
                    {renderPricing(post)}
                  </div>
                  <div className="col-span-1 flex items-center text-gray-700 p-4">
                    {post.averageRating ? `${post.averageRating.toFixed(1)}★` : 'N/A'}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700">
                      <Pencil size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-gray-700">
                      <MoreHorizontal size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  // Create an array of 5 items for skeleton rows
  const skeletonRows = Array(5).fill(0);

  return (
    <div className="text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <Tabs defaultValue="published" className="w-full mb-14">
          <TabsList className="bg-gray-white p-1 gap-1">
            <TabsTrigger
              value="published"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Published
              <span className="ml-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                -
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="drafts"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Drafts
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="deleted"
              className="relative data-[state=active]:bg-gray-100 rounded-2xl px-4 py-3 text-base"
            >
              Deleted
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search articles"
              className="pl-14 py-6 border-gray-300 rounded-full w-full"
              disabled
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 text-gray-700 rounded-full py-6" disabled>
            <Filter size={16} />
            Filter
          </Button>
        </div>

        {/* Posts Table with Skeleton */}
        <div className="border border-gray-200 rounded-3xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 p-4 border-b border-gray-200 bg-gray-50">
            <div className="col-span-6">
              <span className="font-medium text-gray-700">Title</span>
            </div>
            <div className="col-span-3">
              <span className="font-medium text-gray-700">Pricing</span>
            </div>
            <div className="col-span-1">
              <span className="font-medium text-gray-700">Rating</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-medium text-gray-700">Actions</span>
            </div>
          </div>

          {/* Skeleton Table Body */}
          <div>
            {skeletonRows.map((_, index) => (
              <div key={index} className="grid grid-cols-12 p-4 border-b border-gray-100">
                <div className="col-span-6 flex items-start gap-3">
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="col-span-1 flex items-center">
                  <Skeleton className="h-5 w-10" />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
