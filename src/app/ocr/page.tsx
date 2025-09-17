"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Upload, FileImage, Loader2, CheckCircle, XCircle, ArrowLeft, Leaf, MapPin, FileText, Eye, Info, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import GlassCard from "@/components/ui/GlassCard"
import MagneticButton from "@/components/ui/MagneticButton"
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
// Client-only components to prevent hydration mismatches
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false })
const FloatingOrbs = dynamic(() => import('@/components/ui/FloatingOrbs'), { ssr: false })
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false })

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      setResult(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.[0]?.msg || `HTTP ${response.status}`)
      }

      const ocrResult = await response.text()
      setResult(ocrResult)
    } catch (err) {
      console.error('OCR processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process image')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
      <ThreeBackground />
      <DecorativeElements />
      <FloatingOrbs />

      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1" />

      {/* Animated Grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-1">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
          >
            <Sparkles size={16} className="text-green-400" />
            <span className="text-green-300 font-medium">AI-Powered OCR Processing</span>
          </motion.div>

          <h1 className="text-5xl font-bold text-white mb-6">
            <motion.span
              className="bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              OCR Document
            </motion.span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              Processing
            </motion.span>
          </h1>
          <motion.p
            className="text-xl text-green-100 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Upload an image to extract text and create claims automatically with AI-powered OCR technology
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 xl:grid-cols-2 gap-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, staggerChildren: 0.2 }}
        >
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                  <Upload className="text-green-400" />
                  Upload Image
                </h2>
                <p className="text-green-300">Select an image file to process with OCR</p>
              </div>

              {/* File Upload Area */}
              <motion.div
                className="mb-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-700/50 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-900/20 transition-all duration-300 backdrop-blur-sm"
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
                          src={preview}
                          alt="Preview"
                          className="max-w-full max-h-48 object-contain rounded-lg mb-4"
                        />
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Upload className="w-16 h-16 text-green-400 mb-4" />
                        </motion.div>
                        <p className="mb-2 text-lg text-green-300 font-medium">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-green-400">PNG, JPG, JPEG up to 10MB</p>
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

              {/* File Info */}
              {selectedFile && (
                <motion.div
                  className="mb-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-700/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-sm text-green-300">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
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

                {(selectedFile || result || error) && (
                  <motion.button
                    onClick={resetForm}
                    className="px-6 py-3 border border-emerald-700/50 text-green-300 rounded-xl hover:bg-emerald-900/20 transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset
                  </motion.button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl backdrop-blur-sm flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300">{error}</p>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-8 pb-28 ">
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                  <FileText className="text-green-400" />
                  OCR Results
                </h2>
                <p className="text-green-300">Extracted text and processed data</p>
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
                      <Loader2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-xl font-semibold text-white mb-2">Processing image...</p>
                    <p className="text-green-300">This may take a few moments</p>
                  </div>
                </motion.div>
              )}

              {result && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <span className="text-2xl font-bold text-white">Processing Complete!</span>
                  </div>

                  {/* Success Message */}
                  <motion.div
                    className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4 mb-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-green-300 font-medium">{JSON.parse(result).message}</p>
                  </motion.div>

                  {/* Claim Details */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
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
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-400" />
                          Location Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-green-300">Village:</span>
                            <span className="font-medium text-white">{JSON.parse(result).village_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">District:</span>
                            <span className="font-medium text-white">{JSON.parse(result).district_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">State:</span>
                            <span className="font-medium text-white">{JSON.parse(result).state_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Coordinates:</span>
                            <span className="font-medium text-white text-sm">
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
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-400" />
                          Claim Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-green-300">Claim ID:</span>
                            <span className="font-medium text-white">#{JSON.parse(result).claim_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Claim Type:</span>
                            <span className="font-medium text-white">{JSON.parse(result).claim_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Claimant:</span>
                            <span className="font-medium text-white">{JSON.parse(result).claimant_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Community:</span>
                            <span className="font-medium text-white">{JSON.parse(result).community_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Area:</span>
                            <span className="font-medium text-white">{JSON.parse(result).claimed_area} ha</span>
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
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-400" />
                        Extracted Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(JSON.parse(result).extracted_data).map(([key, value], index) => (
                          <motion.div
                            key={key}
                            className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/30 backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                          >
                            <div className="text-sm text-green-300 mb-1">{key}</div>
                            <div className="font-medium text-white">{String(value)}</div>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Additional Info */}
                  <motion.div
                    className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-300 font-medium mb-1">Claim Successfully Created</p>
                        <p className="text-blue-200 text-sm">
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
                    <FileImage className="w-20 h-20 text-green-400 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-white mb-2">No Results Yet</h3>
                  <p className="text-green-300">Upload an image and click "Process Image" to see OCR results</p>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pb-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
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
            ].map((step, index) => (
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
                  className={`w-16 h-16 bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-green-300">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>
      <Footer />
    </div>
  )
}