import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface OCRHeaderProps {
  isLight: boolean;
}

const OCRHeader: React.FC<OCRHeaderProps> = ({ isLight }) => (
  <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
  >
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
        isLight
          ? 'bg-green-100 border border-green-200 text-green-800'
          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300'
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
    >
      <Sparkles size={16} className={isLight ? 'text-green-600' : 'text-green-400'} />
      <span className="font-medium">AI-Powered OCR Processing</span>
    </motion.div>
    <h1 className="text-5xl font-bold mb-6">
      <motion.span
        className={isLight
          ? 'text-green-700'
          : 'bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent'}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        OCR Document
      </motion.span>
      <br />
      <motion.span
        className={isLight
          ? 'text-emerald-700'
          : 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        Processing
      </motion.span>
    </h1>
    <motion.p
      className={`text-xl max-w-2xl mx-auto ${isLight ? 'text-slate-700' : 'text-green-100'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      Upload an image to extract text and create claims automatically with AI-powered OCR technology
    </motion.p>
  </motion.div>
);

export default OCRHeader;
