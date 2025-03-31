"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface DotTypingLoadingProps {
  color?: string;
}

export const DotTypingLoading: React.FC<DotTypingLoadingProps> = ({
  color = "bg-current",
}) => {
  return (
    <div className="flex gap-1 h-6 items-center">
      <motion.div
        className={`w-2 h-2 rounded-full ${color}`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className={`w-2 h-2 rounded-full ${color}`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className={`w-2 h-2 rounded-full ${color}`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
};
