import React from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { Upload, FileImage, Loader2, XCircle } from "lucide-react";

interface OCRUploadSectionProps {
  isLight: boolean;
  preview: string | null;
  selectedFile: File | null;
  isProcessing: boolean;
  error: string | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  resetForm: () => void;
}

const OCRUploadSection: React.FC<OCRUploadSectionProps> = ({
  isLight, preview, selectedFile, isProcessing, error, handleFileSelect, handleUpload, resetForm
}) => (
  <GlassCard className="p-4 sm:p-6 md:p-8">
    <div className="mb-6">
      <h2 className={`text-2xl font-semibold mb-2 flex items-center gap-3 ${isLight ? 'text-slate-800' : 'text-white'}`}>
        <Upload className={isLight ? 'text-green-600' : 'text-green-400'} />
        Upload Image
      </h2>
      <p className={isLight ? 'text-green-700' : 'text-green-300'}>Select an image file to process with OCR</p>
    </div>
    <motion.div
      className="mb-6"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
          isLight
            ? 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100'
            : 'border-emerald-700/50 hover:border-emerald-400 hover:bg-emerald-900/20'
        }`}
      >
        <motion.div
          className="flex flex-col items-center justify-center pt-5 pb-6"
          whileHover={{ scale: 1.05 }}
        >
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={preview || undefined}
                alt="Preview"
                className="max-w-full max-h-32 sm:max-h-40 md:max-h-48 object-contain rounded-lg mb-4"
              />
            </motion.div>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Upload className={`w-16 h-16 mb-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
              </motion.div>
              <p className={`mb-2 text-lg font-medium ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className={`text-sm ${isLight ? 'text-green-600' : 'text-green-400'}`}>PNG, JPG, JPEG up to 10MB</p>
            </>
          )}
        </motion.div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </label>
    </motion.div>
    {selectedFile && (
      <motion.div
        className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
          isLight
            ? 'bg-green-50 border-green-200'
            : 'bg-emerald-900/20 border-emerald-700/50'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <FileImage className={`w-8 h-8 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
          <div className="flex-1">
            <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{selectedFile.name}</p>
            <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
            </p>
          </div>
        </div>
      </motion.div>
    )}
    <div className="flex flex-col sm:flex-row gap-3">
      <MagneticButton
        onClick={handleUpload}
        disabled={!selectedFile || isProcessing}
        className="flex-1"
      >
        {isProcessing ? (
          <>
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <Upload className="w-5 h-5 mr-2" />
              Process Image
            </div>
          </>
        )}
      </MagneticButton>
      {(selectedFile || error) && (
        <motion.button
          onClick={resetForm}
          className={`px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm ${
            isLight
              ? 'border border-green-300 text-green-700 hover:bg-green-100'
              : 'border border-emerald-700/50 text-green-300 hover:bg-emerald-900/20'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      )}
    </div>
    {error && (
      <motion.div
        className={`mt-4 p-4 rounded-xl backdrop-blur-sm flex items-center gap-3 ${
          isLight
            ? 'bg-red-100 border border-red-300'
            : 'bg-red-900/20 border border-red-700/50'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <XCircle className={`w-5 h-5 flex-shrink-0 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
        <p className={isLight ? 'text-red-700' : 'text-red-300'}>{error}</p>
      </motion.div>
    )}
  </GlassCard>
);

export default OCRUploadSection;
