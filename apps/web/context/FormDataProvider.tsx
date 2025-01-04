"use client";

import { PostBasicInfo, PostLocation, PostMedia, PostPricing, PostServiceEngagement, PostWithTag } from "@/app/api/_action/posts/getPosts";
import { createContext, useContext, useState } from "react";

export type FormDataType = {
  tags: PostWithTag
  basicInfo: PostBasicInfo;
  pricing: PostPricing;
  location: PostLocation;
  serviceEngagement: PostServiceEngagement[];
  media: PostMedia[];
};

type FormContextType = {
  formData: Partial<FormDataType>;
  updateFormData: (data: Partial<FormDataType>) => void;
};

const FormDataContext = createContext<FormContextType>({
  formData: {},
  updateFormData: () => { },
});

export function FormDataProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<Partial<FormDataType>>({});
  const updateFormData = (newData: Partial<FormDataType>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <FormDataContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormDataContext.Provider>
  )
}

export const useFormData = () => useContext(FormDataContext); 
