"use client";

import React, { useEffect } from 'react';
import { useFormData } from "@/context/FormDataProvider";
import { useRouteValidation } from "@/hooks/posts/useRouteValidation";
import { DynamicInput } from "@repo/ui/components/ui/dynamic-input";
import { TagInput } from "@repo/ui/components/ui/tag-input";
import { TargetAudience } from "@prisma/client/edge";
import { Briefcase, Building2, Heart, Rocket, Star, Tags, Users } from 'lucide-react';
import { motion } from "framer-motion";

export function ServiceDescription() {
  const { formData, updateFormData } = useFormData();
  const { setStepValidity } = useRouteValidation('service-description');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [experience, setExperience] = React.useState<string>("");
  const [selectedTargetAudience, setSelectedTargetAudience] = React.useState<TargetAudience | null>(null);
  const suggestedSkills = [
    "Web Development",
    "UI/UX Design",
    "Digital Marketing",
    "Content Writing",
    "Data Analysis",
    "Mobile Development",
    "SEO",
    "Project Management",
    "Video Editing",
    "Social Media"
  ];

  useEffect(() => {
    setStepValidity(formData);
  }, [formData, setStepValidity]);

  const handleTagsChange = (tags: string[]) => {
    setSkills(tags);
    if (tags.length > 0 && selectedTargetAudience !== null) {
      updateFormData({
        basicInfo: {
          skills: tags,
          experience: experience,
          targetAudience: selectedTargetAudience
        }
      })
    }
  };

  const handleTargetAudienceChange = (value: TargetAudience) => {
    const newValue = value === selectedTargetAudience ? null : value;

    setSelectedTargetAudience(newValue);
    if (newValue !== null && skills.length > 0) {
      updateFormData({
        basicInfo: {
          skills: skills,
          experience: experience,
          targetAudience: newValue
        }
      })
    }
  };

  // For animation and it uses framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="grid gap-8" variants={containerVariants}>
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          variants={cardVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div variants={iconVariants}>
              <Tags className="h-5 w-5 text-purple-500" />
            </motion.div>
            <h3 className="font-semibold text-lg">Your skills</h3>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TagInput
              label="What skills best describe your service?"
              placeholder="Add skills..."
              helperText="Press space or enter to add a skills"
              className="w-full"
              onChange={handleTagsChange}
            />
          </motion.div>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <SuggestedSkill skill={skill} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          variants={cardVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div variants={iconVariants}>
              <Star className="h-5 w-5 text-yellow-500" />
            </motion.div>
            <h3 className="font-semibold text-lg">
              Experience & Expertise <span className="text-sm text-gray-500">(Optional)</span>
            </h3>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <DynamicInput
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Describe your experience in this field..."
              className="w-full p-4 rounded-lg border border-gray-100 min-h-28"
              onSubmit={() => { }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          variants={cardVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div variants={iconVariants}>
              <Users className="h-5 w-5 text-blue-500" />
            </motion.div>
            <h3 className="font-semibold text-lg">Target Audience</h3>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SelectTargetAudience
              selectedTargetAudience={selectedTargetAudience}
              setSelectedTargetAudience={handleTargetAudienceChange}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="text-sm text-gray-500">
          {skills.length > 0 && experience.length > 0 && selectedTargetAudience ? (
            <motion.span
              className="flex items-center gap-2 text-green-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Briefcase className="h-4 w-4" />
              Ready to proceed
            </motion.span>
          ) : (
            <motion.span
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Briefcase className="h-4 w-4" />
              Please complete all sections
            </motion.span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const SuggestedSkill = ({ skill }: { skill: string }) => (
  <div
    className="px-3 py-1.5 text-sm rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 
    transition-colors duration-200 border border-purple-100 hover:border-purple-200 font-medium"
  >
    {skill}
  </div>
);

interface SelectTargetAudienceProps {
  selectedTargetAudience: TargetAudience | null;
  setSelectedTargetAudience: (value: TargetAudience) => void;
}

export function SelectTargetAudience({
  selectedTargetAudience,
  setSelectedTargetAudience
}: SelectTargetAudienceProps) {
  const targetAudience = [
    {
      value: TargetAudience.STARTUPS,
      label: "Startups",
      description: "New businesses that need quick and simple solutions.",
      icon: Rocket,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverBg: "hover:bg-orange-100"
    },
    {
      value: TargetAudience.ENTERPRISES,
      label: "Enterprises",
      description: "Big companies that need advanced and reliable services.",
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverBg: "hover:bg-blue-100"
    },
    {
      value: TargetAudience.INDIVIDUALS,
      label: "Individuals",
      description: "Single clients looking for personal help or small projects.",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverBg: "hover:bg-purple-100"
    },
    {
      value: TargetAudience.NON_PROFITS,
      label: "Non-Profits",
      description: "Charities or social groups needing affordable solutions.",
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      hoverBg: "hover:bg-pink-100"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {targetAudience.map(({ value, label, description, icon: Icon, color, bgColor, borderColor, hoverBg }) => (
        <button
          key={value}
          onClick={() => setSelectedTargetAudience(value)}
          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 
            ${selectedTargetAudience === value
              ? `${bgColor} ${borderColor} shadow-sm`
              : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <h4 className={`font-semibold text-lg ${selectedTargetAudience === value ? color : 'text-gray-900'}`}>
                {label}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            </div>
            <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 transition-colors
              ${selectedTargetAudience === value
                ? `${color} border-current`
                : 'border-gray-300 group-hover:border-gray-400'}`}
            />
          </div>

          {/* Hover effect overlay */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none
            ${hoverBg} ${selectedTargetAudience === value ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}
          />
        </button>
      ))}
    </div>
  );
}

