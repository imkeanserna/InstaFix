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
      maxLength={100}
      placeholder="Title of your service..."
      formData={formData}
      updateFormData={updateFormData}
      setStepValidity={setStepValidity}
      variant="title"
    />
  );
}

export function Description() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('description');

  return (
    <TextPostInput
      fieldName="description"
      heading="Let's create the service description"
      subheading="Help customers understand what you offer by providing a detailed description."
      minLength={50}
      maxLength={500}
      placeholder="Tell us more about your service..."
      formData={formData}
      updateFormData={updateFormData}
      setStepValidity={setStepValidity}
      variant="description"
    />
  );
}

