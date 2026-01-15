import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { FileText, MapPin, CheckCircle, Eye, Info, FileImage, Loader2, XCircle } from "lucide-react";

interface OCRResultSectionProps {
  isLight: boolean;
  isProcessing: boolean;
  result: string | null;
  error: string | null;
}

const OCRResultSection: React.FC<OCRResultSectionProps> = ({ isLight, isProcessing, result, error }) => (
  <GlassCard className="p-4 sm:p-6 md:p-8 pb-20 sm:pb-24 md:pb-28">
    <div className="mb-8 sm:mb-10 md:mb-12">
      <h2 className={`text-xl sm:text-2xl font-semibold mb-2 flex items-center gap-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>
        <FileText className={isLight ? 'text-green-600' : 'text-green-400'} />
        OCR Results
      </h2>
      <p className={isLight ? 'text-green-700' : 'text-green-300'}>Extracted text and processed data</p>
    </div>
    {isProcessing && (
      <motion.div
        className="flex items-center justify-center py-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
          </motion.div>
          <p className={`text-xl font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Processing image...</p>
          <p className={isLight ? 'text-green-700' : 'text-green-300'}>This may take a few moments</p>
        </div>
      </motion.div>
    )}
    {result && !isProcessing && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            <CheckCircle className={`w-8 h-8 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
          </motion.div>
          <span className={`text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Processing Complete!</span>
        </div>
        {/* Success Message */}
        <motion.div
          className={`rounded-xl p-4 mb-6 backdrop-blur-sm border ${
            isLight ? 'bg-green-50 border-green-200' : 'bg-emerald-900/20 border-emerald-700/50'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className={`font-medium ${isLight ? 'text-green-700' : 'text-green-300'}`}>{JSON.parse(result).message}</p>
        </motion.div>
        {/* Claim Details */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {/* Location Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4 sm:p-6">
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                <MapPin className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
                Location Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Village:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).village_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>District:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).district_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>State:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).state_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Coordinates:</span>
                  <span className={`font-medium text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {JSON.parse(result).latitude.toFixed(6)}, {JSON.parse(result).longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          {/* Claim Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-4 sm:p-6">
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                <FileText className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
                Claim Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Claim ID:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>#{JSON.parse(result).claim_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Claim Type:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).claim_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Claimant:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).claimant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Community:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).community_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-green-700' : 'text-green-300'}>Area:</span>
                  <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{JSON.parse(result).claimed_area} ha</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
        {/* Extracted Data */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard className="p-4 sm:p-6">
            <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
              <Eye className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
              Extracted Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(JSON.parse(result).extracted_data).map(([key, value], index) => (
                <motion.div
                  key={key}
                  className={`rounded-lg p-3 sm:p-4 border backdrop-blur-sm ${
                    isLight
                      ? 'bg-green-50 border-green-200'
                      : 'bg-emerald-900/20 border-emerald-700/30'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className={`text-xs sm:text-sm mb-1 ${isLight ? 'text-green-700' : 'text-green-300'}`}>{key}</div>
                  <div className={`font-medium text-sm sm:text-base ${isLight ? 'text-slate-800' : 'text-white'}`}>{String(value)}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
        {/* Additional Info */}
        <motion.div
          className={`rounded-xl p-4 backdrop-blur-sm border ${
            isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-700/50'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
            <div>
              <p className={`font-medium mb-1 ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>Claim Successfully Created</p>
              <p className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-200'}`}>
                The OCR data has been processed and a claim has been automatically created in the database with ID #{JSON.parse(result).claim_id}.
                You can view and manage this claim in the dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
    {!result && !isProcessing && !error && (
      <motion.div
        className="flex flex-col items-center justify-center py-12 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FileImage className={`w-20 h-20 mb-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
        </motion.div>
        <h3 className={`text-xl font-medium mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>No Results Yet</h3>
        <p className={isLight ? 'text-green-700' : 'text-green-300'}>Upload an image and click &quot;Process Image&quot; to see OCR results</p>
      </motion.div>
    )}
  </GlassCard>
);

export default OCRResultSection;
