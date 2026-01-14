import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface OCRHowItWorksSectionProps {
  isLight: boolean;
}

const steps = [
  {
    icon: Upload,
    title: "1. Upload Image",
    description: "Select a clear image of your document",
    color: "green"
  },
  {
    icon: Loader2,
    title: "2. AI Processing",
    description: "OCR extracts text and processes data",
    color: "blue"
  },
  {
    icon: CheckCircle,
    title: "3. Claim Created",
    description: "Data is automatically saved to database",
    color: "emerald"
  }
];

const OCRHowItWorksSection: React.FC<OCRHowItWorksSectionProps> = ({ isLight }) => (
  <motion.div
    className={`relative z-10 max-w-7xl mx-auto px-6 pb-16 ${isLight ? 'text-slate-900' : 'text-white'}`}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
  >
    <GlassCard className="p-8">
      <h2 className={`text-3xl font-bold mb-8 text-center ${isLight ? 'text-slate-800' : 'text-white'}`}>How It Works</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, staggerChildren: 0.2 }}
        viewport={{ once: true }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                isLight
                  ? `bg-gradient-to-r from-${step.color}-500 to-${step.color}-600`
                  : `bg-gradient-to-r from-${step.color}-500 to-${step.color}-600`
              }`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <step.icon className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className={`text-xl font-semibold mb-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>{step.title}</h3>
            <p className={isLight ? 'text-green-700' : 'text-green-300'}>{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  </motion.div>
);

export default OCRHowItWorksSection;
