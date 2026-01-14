"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/components/ThemeProvider';
import OCRHeader from '@/components/ocr/OCRHeader';
import OCRUploadSection from '@/components/ocr/OCRUploadSection';
import OCRResultSection from '@/components/ocr/OCRResultSection';
import OCRHowItWorksSection from '@/components/ocr/OCRHowItWorksSection';
// Client-only components to prevent hydration mismatches
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

export default function OCRPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
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
    <div className={`min-h-screen relative overflow-hidden ${
      isLight
        ? 'bg-gradient-to-br from-white via-emerald-50 to-green-50 text-slate-900'
        : 'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'
    }`}>
      <ThreeBackground />
      <DecorativeElements />
      {/* Mesh Gradient Overlay */}
      <div className={isLight
        ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1"
        : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"
      } />
      {/* Animated Grid */}
      <div className={isLight
        ? "fixed inset-0 opacity-10 pointer-events-none z-1"
        : "fixed inset-0 opacity-10 pointer-events-none z-1"
      }>
        <div className="absolute inset-0" style={{
          backgroundImage: isLight
            ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      <Navbar />
      <div className={`relative z-10 w-full max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
        <OCRHeader isLight={isLight} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <OCRUploadSection
            isLight={isLight}
            preview={preview}
            selectedFile={selectedFile}
            isProcessing={isProcessing}
            error={error}
            handleFileSelect={handleFileSelect}
            handleUpload={handleUpload}
            resetForm={resetForm}
          />
          <OCRResultSection
            isLight={isLight}
            isProcessing={isProcessing}
            result={result}
            error={error}
          />
        </div>
      </div>
      <OCRHowItWorksSection isLight={isLight} />
      <Footer />
    </div>
  );
}