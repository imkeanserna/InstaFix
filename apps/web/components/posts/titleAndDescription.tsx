"use client";

import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { TextPostInput } from "./textInput";

export function Title() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('title');

  return (
    <TextPostInput
      fieldName="title"
      heading="Now, let's give your service a title"
      subheading="Short titles work best. Have fun with it you can always change it later."
      minLength={5}
      maxLength={32}
      placeholder="Tell us about your service"
      formData={formData}
      updateFormData={updateFormData}
      setStepValidity={setStepValidity}
    />
  );
}

export function Description() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('description');

  return (
    <TextPostInput
      fieldName="description"
      heading="Describe your service"
      subheading="Help customers understand what you offer by providing a detailed description."
      minLength={50}
      maxLength={500}
      placeholder="Tell us more about your service..."
      formData={formData}
      updateFormData={updateFormData}
      setStepValidity={setStepValidity}
    />
  );
}

