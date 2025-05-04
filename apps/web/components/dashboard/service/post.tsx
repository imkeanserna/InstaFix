"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui/components/ui/collapsible";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { X, ArrowLeft, ChevronDown, Trash2, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { TagInput } from "@repo/ui/components/ui/tag-input";
import LocationNavigation, { Location } from "@/components/ui/locationNavigation";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import {
  EngagementType,
  PricingType,
  RequestConfirmationType,
  ServiceLocationType,
  ServicesIncluded,
  TargetAudience
} from "@prisma/client/edge";
import { useRouter } from "next/navigation";
import { updatePostByUser, UpdatePostParams } from "@/lib/updatePostUtils";
import { toast } from "@repo/ui/components/ui/sonner";
import { deletePost, getPost } from "@/lib/postUtils";
import { PostWithTag, PostWithUserInfo } from "@repo/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";

export function ServicePost({
  postId
}: {
  postId: string
}) {
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(true);
  const [isManageLocationOpen, setIsManageLocationOpen] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isIncludedServicesOpen, setIsIncludedServicesOpen] = useState(false);

  // Form data state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState<PostWithTag[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState<ServiceLocationType>(ServiceLocationType.ONLINE);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(TargetAudience.INDIVIDUALS);
  const [pricingType, setPricingType] = useState<PricingType>(PricingType.FIXED_PRICE);
  const [engagementType, setEngagementType] = useState<EngagementType>(EngagementType.ONE_TIME_PROJECT);
  const [servicesIncluded, setServicesIncluded] = useState<ServicesIncluded[]>([]);
  const [requestConfirmation, setRequestConfirmation] = useState<RequestConfirmationType>(RequestConfirmationType.APPROVE_DECLINE);

  // File handling state
  const [files, setFiles] = useState<File[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<Array<{ url: string, id?: string }>>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);

  const [originalData, setOriginalData] = useState<{
    title: string;
    description: string;
    experience: string;
    price: string;
    tags: PostWithTag[];
    selectedLocation: Location | null;
    skillTags: string[];
    isOnline: ServiceLocationType;
    targetAudience: TargetAudience;
    pricingType: PricingType;
    engagementType: EngagementType;
    servicesIncluded: ServicesIncluded[];
    requestConfirmation: RequestConfirmationType;
    productImages: Array<{ url: string, id?: string }>;
    coverPhotoIndex: number;
  } | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(true);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadPostData = async () => {
      setIsDataLoading(true);
      try {
        const postData: PostWithUserInfo | null = await getPost({ postId });

        if (postData) {
          const newTitle = postData.title || '';
          const newDescription = postData.description || '';
          const newExperience = postData.experience || '';
          let newPrice = '';
          let newPricingType = postData.pricingType || PricingType.FIXED_PRICE;

          // Set price based on pricing type
          if (postData.pricingType === PricingType.FIXED_PRICE && postData.fixedPrice) {
            newPrice = postData.fixedPrice.toString();
            newPricingType = PricingType.FIXED_PRICE;
          } else if (postData.pricingType === PricingType.HOURLY && postData.hourlyRate) {
            newPrice = postData.hourlyRate.toString();
            newPricingType = PricingType.HOURLY;
          }

          // Set location
          const newLocation = postData.location ? {
            address: postData.location.fullAddress,
            lat: postData.location.latitude,
            lng: postData.location.longitude,
          } : null;

          // Set skills
          const newSkillTags = (postData.skills && Array.isArray(postData.skills)) ?
            postData.skills : [];

          // Set service location type
          const newIsOnline = postData.serviceLocation || ServiceLocationType.ONLINE;

          // Set target audience
          const newTargetAudience = postData.targetAudience || TargetAudience.INDIVIDUALS;

          // Set services included
          const newServicesIncluded = (postData.servicesIncluded && Array.isArray(postData.servicesIncluded)) ?
            postData.servicesIncluded : [];

          // Set request confirmation type
          const newRequestConfirmation = postData.requestConfirmation || RequestConfirmationType.APPROVE_DECLINE;

          // Set engagement type
          const newEngagementType = (postData.serviceEngagement && postData.serviceEngagement.length > 0) ?
            postData.serviceEngagement[0].engagementType || EngagementType.ONE_TIME_PROJECT :
            EngagementType.ONE_TIME_PROJECT;

          // Set tags
          const newTags = (postData.tags && postData.tags.length > 0) ?
            postData.tags : [];

          // Set media/images
          let newProductImages: Array<{ url: string, id?: string }> = [];
          let newCoverPhotoIndex = 0;

          if (postData.media && postData.media.length > 0) {
            newProductImages = postData.media.map(media => ({
              url: media.url,
              id: media.id
            }));

            // Determine cover photo index
            if (postData.coverPhoto) {
              const coverIndex = newProductImages.findIndex(img => img.url === postData.coverPhoto);
              if (coverIndex !== -1) {
                newCoverPhotoIndex = coverIndex;
              }
            }
          }

          setTitle(newTitle);
          setDescription(newDescription);
          setExperience(newExperience);
          setPrice(newPrice);
          setPricingType(newPricingType);
          setSelectedLocation(newLocation);
          setSkillTags(newSkillTags);
          setIsOnline(newIsOnline);
          setTargetAudience(newTargetAudience);
          setServicesIncluded(newServicesIncluded);
          setRequestConfirmation(newRequestConfirmation);
          setEngagementType(newEngagementType);
          setTags(newTags);
          setProductImages(newProductImages);
          setCoverPhotoIndex(newCoverPhotoIndex);

          // Store original values for comparison
          setOriginalData({
            title: newTitle,
            description: newDescription,
            experience: newExperience,
            price: newPrice,
            tags: newTags,
            selectedLocation: newLocation,
            skillTags: newSkillTags,
            isOnline: newIsOnline,
            targetAudience: newTargetAudience,
            pricingType: newPricingType,
            engagementType: newEngagementType,
            servicesIncluded: newServicesIncluded,
            requestConfirmation: newRequestConfirmation,
            productImages: newProductImages,
            coverPhotoIndex: newCoverPhotoIndex
          });

          setIsDataLoading(false);
        } else {
          router.push('/dashboard/all-posts');
        }
      } catch (err) {
        console.error('Error loading post data:', err);
        setError('Failed to load service data');
      }
    };

    if (postId) {
      loadPostData();
    }
  }, [postId, router]);

  const hasChanges = () => {
    if (!originalData) return false;

    // Check for any file uploads or removed images
    if (files.length > 0 || removedMediaIds.length > 0) {
      return true;
    }

    // Compare current values with original values
    if (
      title !== originalData.title ||
      description !== originalData.description ||
      experience !== originalData.experience ||
      price !== originalData.price ||
      pricingType !== originalData.pricingType ||
      isOnline !== originalData.isOnline ||
      targetAudience !== originalData.targetAudience ||
      engagementType !== originalData.engagementType ||
      coverPhotoIndex !== originalData.coverPhotoIndex ||
      requestConfirmation !== originalData.requestConfirmation
    ) {
      return true;
    }

    if (JSON.stringify(skillTags) !== JSON.stringify(originalData.skillTags)) {
      return true;
    }

    if (JSON.stringify(servicesIncluded) !== JSON.stringify(originalData.servicesIncluded)) {
      return true;
    }

    if (JSON.stringify(tags) !== JSON.stringify(originalData.tags)) {
      return true;
    }

    if (
      (selectedLocation && !originalData.selectedLocation) ||
      (!selectedLocation && originalData.selectedLocation) ||
      (selectedLocation && originalData.selectedLocation && (
        selectedLocation.address !== originalData.selectedLocation.address ||
        selectedLocation.lat !== originalData.selectedLocation.lat ||
        selectedLocation.lng !== originalData.selectedLocation.lng
      ))
    ) {
      return true;
    }

    if (productImages.length !== originalData.productImages.length) {
      return true;
    }

    // Check if any service images have changed (difficult to compare by URL only, this is simplified)
    const hasImageChanges = productImages.some((img, idx) => {
      if (!originalData.productImages[idx]) return true;
      return img.url !== originalData.productImages[idx].url;
    });

    if (hasImageChanges) {
      return true;
    }

    return false;
  };

  const handleLocationSelect = (value: Location | null) => {
    const newValue = value?.address === selectedLocation?.address ? null : value;
    setSelectedLocation(newValue);
  };

  const handlePriceChange = (value: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || regex.test(value)) {
      setPrice(value);
    }
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setSkillTags(newSkills);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files);

      setFiles(prevFiles => [...prevFiles, ...fileList]);

      fileList.forEach(file => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          if (e.target?.result) {
            setProductImages(prev => [...prev, { url: e.target!.result as string }]);
          }
        };
        fileReader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => {
      const newImages = [...prev];

      const removedImage = newImages[index];
      if (removedImage && removedImage.id) {
        setRemovedMediaIds(prev => [...prev, removedImage.id!]);
      }

      newImages.splice(index, 1);

      // If the current cover photo removed, set the new cover photo to the first image
      if (index === coverPhotoIndex) {
        setCoverPhotoIndex(newImages.length > 0 ? 0 : -1);
      } else if (index < coverPhotoIndex) {
        // If an image removed before the cover photo, adjust the index
        setCoverPhotoIndex(coverPhotoIndex - 1);
      }

      return newImages;
    });
  };

  const handleSetCoverPhoto = (index: number) => {
    setCoverPhotoIndex(index);
  };

  const handleServiceIncluded = (service: ServicesIncluded) => {
    setServicesIncluded(prev => {
      // Remove if already included 
      if (prev.includes(service)) {
        return prev.filter(item => item !== service);
      }
      return [...prev, service];
    });
  };

  const handleOpenDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleRequestConfirmationChange = (value: RequestConfirmationType) => {
    setRequestConfirmation(value);
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost({ postId });
      if (result) {
        toast.success("Post deleted successfully!");
        router.push('/dashboard/all-posts');
      } else {
        toast.error("Failed to delete post");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleUpdate = async () => {
    if (!hasChanges()) {
      toast.info("No changes detected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updateData: UpdatePostParams = {
        tags: {
          tags: [
            { subcategoryId: tags[0].subcategoryId }
          ]
        },
        postId,
        basicInfo: {
          title: title,
          description,
          experience,
          targetAudience: targetAudience,
          servicesIncluded: servicesIncluded,
          skills: skillTags,
          requestConfirmation: requestConfirmation
        },
        serviceEngagement: {
          serviceEngagement: [
            {
              engagementType: engagementType,
            }
          ]
        },
        location: {
          address: selectedLocation?.address || '',
          lat: selectedLocation?.lat || 0,
          lng: selectedLocation?.lng || 0,
          serviceLocation: isOnline
        },
        pricing: {
          pricingType: pricingType,
          hourlyRate: pricingType === PricingType.HOURLY ? Number(price) : 0,
          fixedPrice: pricingType === PricingType.FIXED_PRICE ? Number(price) : 0
        },
        media: {
          files: files,
          coverPhotoIndex: coverPhotoIndex,
        },
        deleteImages: {
          imageIds: removedMediaIds
        }
      };

      const result = await updatePostByUser(updateData);

      if (result) {
        // Reset removed media IDs since they've been processed
        // Reset files since they've been uploaded
        setRemovedMediaIds([]);
        setFiles([]);
        toast.success("Service updated successfully!");
        router.refresh();
      } else {
        toast.error("Failed to update the post, please try again");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return <ServicePostSkeleton />
  }

  return (
    <div>
      <div className="sticky top-0 z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-4 md:px-12 border-b border-b-gray-200 shadow-sm bg-white">
        <div className="flex items-center justify-center">
          <div className="flex gap-4 items-center justify-center">
            <Link href="/dashboard/all-posts" className="flex items-center justify-center text-gray-600 hover:text-gray-900 w-10 h-10 border border-gray-200 rounded-xl active:scale-[0.98]">
              <ArrowLeft className="h-5 w-5 mr-1" />
            </Link>
            <span className="text-xs text-gray-500">Back to List</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto text-lg">
          <Button
            onClick={handleOpenDeleteModal}
            variant="outline"
            className="rounded-xl bg-red-500 p-6 hover:bg-red-600 text-white hover:text-white"
          >
            <Trash2 className="h-4 w-4 me-2" />
            Delete Post
          </Button>
          <Button
            className={`rounded-xl p-6 ${hasChanges()
              ? "bg-yellow-500 hover:bg-yellow-600 text-gray-950 border border-gray-400"
              : "bg-white hover:bg-gray-100 text-gray-950 border border-gray-200"
              }`}
            onClick={handleUpdate}
            disabled={isLoading || !hasChanges()}
          >
            {hasChanges() ? (
              isLoading ? (
                <span className="flex items-center">
                  Updating...
                  <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                </span>
              ) : (
                "Save Service"
              )
            ) : (
              "Already Updated"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-12 mt-4">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md p-6 !rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Delete Post</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              className="rounded-lg px-5 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="rounded-lg px-5 py-2"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  Deleting...
                  <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 me-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 p-4 md:p-12 bg-gray-100">
        {/* Left Column - Service Image */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-medium">
                Posts Images
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <label className="block font-medium mb-2">
                  Service Image
                </label>

                <div className="w-full aspect-video bg-gray-100 rounded-xl relative flex items-center justify-center overflow-hidden">
                  {productImages.length > 0 && coverPhotoIndex >= 0 ? (
                    <div className="w-full h-full">
                      <Image
                        src={productImages[coverPhotoIndex].url}
                        alt="Cover Image"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('fileInput')?.click()}
                        >
                          Replace
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveImage(coverPhotoIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="mb-4">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      </div>
                      <p className="mb-4 text-gray-500">
                        Upload or drag and drop an image here
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('fileInput')?.click()}
                      >
                        Browse Files
                      </Button>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block font-medium mb-2">
                    Additional Images
                  </label>

                  {productImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {productImages.map((image, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-xl overflow-hidden relative ${index === coverPhotoIndex ? 'ring-2 ring-yellow-600' : ''
                            }`}
                        >
                          <Image
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 33vw, 20vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex flex-col justify-between">
                            <div className="p-1 flex justify-end">
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="w-6 h-6 rounded-full bg-white text-red-500 flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {index !== coverPhotoIndex && (
                              <div className="p-2">
                                <button
                                  onClick={() => handleSetCoverPhoto(index)}
                                  className="w-full py-1 bg-white bg-opacity-75 text-xs font-medium rounded hover:bg-yellow-600 hover:text-white transition-colors"
                                >
                                  Set as Cover
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center rounded-lg text-gray-700"
                    onClick={() => document.getElementById('additionalImage')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Another Image
                  </Button>
                  <input
                    id="additionalImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Information */}
        <div className="md:col-span-2">
          <Collapsible open={isGeneralInfoOpen} onOpenChange={setIsGeneralInfoOpen}>
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full p-6 bg-white border border-gray-200 ${isGeneralInfoOpen ? "rounded-t-2xl" : "rounded-2xl"} shadow-md`}
            >
              <h2 className="text-2xl font-medium">
                General Information
              </h2>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white p-6 rounded-b-2xl border-x border-b border-b-gray-200 border-x-gray-200 shadow-md">
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-1">Service Title</label>
                  <Input
                    placeholder="Service Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-12 px-4 py-6 text-base rounded-lg"
                  />
                </div>

                <div>
                  <TagInput
                    label="What skills best describe your service?"
                    placeholder="Add skills..."
                    helperText="Press space or enter to add a skill"
                    className="w-full"
                    onChange={handleSkillsChange}
                    tagsInitial={skillTags}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <Input
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="pl-7 h-12 py-6 text-base rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Price Type</label>
                    <Select
                      value={pricingType}
                      onValueChange={(value) => {
                        if (value !== PricingType.CUSTOM && value !== PricingType.PACKAGE) {
                          setPricingType(value as PricingType);
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 px-4 py-6 text-base rounded-lg">
                        <SelectValue placeholder="Select pricing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PricingType.HOURLY}>Hourly Rate</SelectItem>
                        <SelectItem value={PricingType.FIXED_PRICE}>Fixed Price</SelectItem>

                        {/* Disabled items with Coming Soon badges */}
                        <div className="relative cursor-not-allowed opacity-60">
                          <SelectItem
                            value={PricingType.CUSTOM}
                            disabled
                            className="pr-24"
                          >
                            Custom Price
                          </SelectItem>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-800 text-[8px] font-medium px-2 py-0.5 rounded">
                            Coming Soon
                          </span>
                        </div>

                        <div className="relative cursor-not-allowed opacity-60">
                          <SelectItem
                            value={PricingType.PACKAGE}
                            disabled
                            className="pr-24"
                          >
                            Package
                          </SelectItem>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-800 text-[8px] font-medium px-2 py-0.5 rounded">
                            Coming Soon
                          </span>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Engagement Type</label>
                    <Select
                      value={engagementType}
                      onValueChange={(value) => setEngagementType(value as EngagementType)}
                    >
                      <SelectTrigger className="h-12 px-4 py-6 text-base rounded-lg">
                        <SelectValue placeholder="Select engagement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EngagementType.ONE_TIME_PROJECT}>One-Time Project</SelectItem>
                        <SelectItem value={EngagementType.ONGOING_COLLABORATION}>Ongoing Collaboration</SelectItem>
                        <SelectItem value={EngagementType.CONSULTATION}>Consultation</SelectItem>
                        <SelectItem value={EngagementType.CUSTOM_ARRANGEMENT}>Custom Arrangement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block font-medium">Service Descriptions</label>
                    <span className="text-xs text-gray-400">{description.length}/500</span>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[100px] !text-base !rounded-lg p-4"
                    maxLength={500}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block font-medium">{`Service Experience & Expertise`}</label>
                    <span className="text-xs text-gray-400">{experience.length}/500</span>
                  </div>
                  <Textarea
                    placeholder="Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full min-h-[100px] !text-base !rounded-lg p-4"
                    maxLength={500}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Manage Location Section */}
          <Collapsible open={isManageLocationOpen} onOpenChange={setIsManageLocationOpen} className="mt-6">
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full p-6 bg-white border border-gray-200 ${isManageLocationOpen ? "rounded-t-2xl" : "rounded-2xl"} shadow-md`}
            >
              <h2 className="text-2xl font-medium">Manage Location</h2>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white p-6 rounded-b-2xl border-x border-b border-b-gray-200 border-x-gray-200 shadow-md">
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-1">Service Location</label>
                  <LocationNavigation
                    selectedLocation={selectedLocation}
                    setSelectedLocation={handleLocationSelect}
                    maptilerKey={process.env.MAPTILER_API_KEY || ''}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-base">
                    <label className="block font-medium mb-1">Service Location Type</label>
                    <Select
                      value={isOnline}
                      onValueChange={(value) => setIsOnline(value as ServiceLocationType)}
                    >
                      <SelectTrigger className="w-full px-4 py-6 rounded-lg bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServiceLocationType.ONLINE}>Online</SelectItem>
                        <SelectItem value={ServiceLocationType.IN_PERSON}>In-Person</SelectItem>
                        <SelectItem value={ServiceLocationType.HYBRID}>Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-base">
                    <label className="block font-medium mb-1">Target Audience</label>
                    <Select
                      value={targetAudience}
                      onValueChange={(value) => setTargetAudience(value as TargetAudience)}
                    >
                      <SelectTrigger className="w-full px-4 py-6 rounded-lg bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TargetAudience.INDIVIDUALS}>Individuals</SelectItem>
                        <SelectItem value={TargetAudience.STARTUPS}>Startups</SelectItem>
                        <SelectItem value={TargetAudience.ENTERPRISES}>Enterprises</SelectItem>
                        <SelectItem value={TargetAudience.NON_PROFITS}>Non-Profits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Services Included Section */}
          <Collapsible open={isIncludedServicesOpen} onOpenChange={setIsIncludedServicesOpen} className="mt-6">
            <CollapsibleTrigger
              className={`flex items-center justify-between w-full p-6 bg-white border border-gray-200 ${isIncludedServicesOpen ? "rounded-t-2xl" : "rounded-2xl"} shadow-md`}
            >
              <h2 className="text-2xl font-medium">Services Included and Booking</h2>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white p-6 rounded-b-2xl border-x border-b border-b-gray-200 border-x-gray-200 shadow-md">
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-3">Services Included</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.values(ServicesIncluded).map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={servicesIncluded.includes(service as ServicesIncluded)}
                          onCheckedChange={() => handleServiceIncluded(service as ServicesIncluded)}
                          className="h-5 w-5 rounded-md"
                        />
                        <label
                          htmlFor={`service-${service}`}
                          className="text-base cursor-pointer"
                        >
                          {service.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-3">Booking Confirmation</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroup
                        value={requestConfirmation}
                        onValueChange={value => handleRequestConfirmationChange(value as RequestConfirmationType)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={RequestConfirmationType.INSTANT_BOOK}
                            id="instant-book"
                            className="h-5 w-5"
                          />
                          <label htmlFor="instant-book" className="text-base cursor-pointer">
                            Instant Book (Automatic approval)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={RequestConfirmationType.APPROVE_DECLINE}
                            id="approve-decline"
                            className="h-5 w-5"
                          />
                          <label htmlFor="approve-decline" className="text-base cursor-pointer">
                            Review and Approve/Decline
                          </label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div >
  );
}

export function ServicePostSkeleton() {
  return (
    <div>
      {/* Header with back button and action buttons */}
      <div className="sticky top-0 z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 px-12 border-b border-b-gray-200 shadow-sm bg-white">
        <div className="flex items-center justify-center">
          <div className="flex gap-4 items-center justify-center">
            <Link href="/dashboard/all-posts" className="flex items-center justify-center text-gray-600 hover:text-gray-900 w-10 h-10 border border-gray-200 rounded-xl active:scale-[0.98]">
              <ArrowLeft className="h-5 w-5 mr-1" />
            </Link>
            <span className="text-xs text-gray-500">Back to List</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto text-lg">
          {/* Delete button skeleton */}
          <div className="h-12 w-36 bg-gray-200 animate-pulse rounded-xl"></div>
          {/* Save button skeleton */}
          <div className="h-12 w-36 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-gray-100">
        {/* Left Column - Service Image Skeleton */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md"></div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="h-5 w-32 bg-gray-200 animate-pulse rounded-md"></div>

                {/* Main image skeleton */}
                <div className="w-full aspect-video bg-gray-200 animate-pulse rounded-lg"></div>

                <div className="mt-4">
                  <div className="h-5 w-40 bg-gray-200 animate-pulse rounded-md mb-4"></div>

                  {/* Additional images grid skeleton */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-md"></div>
                    ))}
                  </div>

                  {/* Add button skeleton */}
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Information Skeleton */}
        <div className="md:col-span-2">
          {/* General Information Section */}
          <div className="bg-white border border-gray-200 rounded-t-2xl shadow-md">
            <div className="flex items-center justify-between w-full p-6">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
            <div className="bg-white p-6 rounded-b-2xl border-x border-b border-gray-200 shadow-md">
              <div className="space-y-6">
                {/* Title skeleton */}
                <div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                  <div className="h-12 w-full bg-gray-200 animate-pulse rounded-md"></div>
                </div>

                {/* Skills skeleton */}
                <div>
                  <div className="h-5 w-64 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                  <div className="h-12 w-full bg-gray-200 animate-pulse rounded-md"></div>
                </div>

                {/* Price, Type, Engagement grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <div className="h-5 w-24 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                      <div className="h-12 w-full bg-gray-200 animate-pulse rounded-md"></div>
                    </div>
                  ))}
                </div>

                {/* Description and Experience text areas */}
                {[...Array(2)].map((_, i) => (
                  <div key={i}>
                    <div className="h-5 w-48 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                    <div className="h-32 w-full bg-gray-200 animate-pulse rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manage Location Section */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-md">
            <div className="flex items-center justify-between w-full p-6">
              <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          </div>

          {/* Services Included Section */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-md">
            <div className="flex items-center justify-between w-full p-6">
              <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
