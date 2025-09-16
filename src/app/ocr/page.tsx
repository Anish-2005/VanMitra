"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Upload, FileImage, Loader2, CheckCircle, XCircle, ArrowLeft, Leaf, MapPin, FileText, Eye, Info } from 'lucide-react'
import DecorativeBackground from "@/components/ui/DecorativeBackground"

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={6} />

      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <Leaf className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra</h1>
            <p className="text-xs text-green-700">OCR Document Processing</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
         
          <h1 className="text-4xl font-bold text-green-900 mb-2">OCR Document Processing</h1>
          <p className="text-lg text-green-700">Upload an image to extract text and create claims automatically</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-green-900 mb-2">Upload Image</h2>
              <p className="text-green-600">Select an image file to process with OCR</p>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-48 object-contain rounded-lg mb-4"
                    />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-green-500 mb-4" />
                      <p className="mb-2 text-sm text-green-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-green-500">PNG, JPG, JPEG up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <FileImage className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isProcessing}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Process Image
                  </>
                )}
              </button>

              {(selectedFile || result || error) && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-green-900 mb-2">OCR Results</h2>
              <p className="text-green-600">Extracted text and processed data</p>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">Processing image...</p>
                  <p className="text-green-600 text-sm">This may take a few moments</p>
                </div>
              </div>
            )}

            {result && !isProcessing && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="text-xl font-semibold text-green-800">Processing Complete!</span>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">{JSON.parse(result).message}</p>
                </div>

                {/* Claim Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Information */}
                  <div className="bg-white border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Village:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).village_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).district_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">State:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).state_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordinates:</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {JSON.parse(result).latitude.toFixed(6)}, {JSON.parse(result).longitude.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Information */}
                  <div className="bg-white border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Claim Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Claim ID:</span>
                        <span className="font-medium text-gray-900">#{JSON.parse(result).claim_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Claim Type:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).claim_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Claimant:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).claimant_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Community:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).community_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium text-gray-900">{JSON.parse(result).claimed_area} ha</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Data */}
                <div className="bg-white border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Extracted Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(JSON.parse(result).extracted_data).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">{key}</div>
                        <div className="font-medium text-gray-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium mb-1">Claim Successfully Created</p>
                      <p className="text-blue-700 text-sm">
                        The OCR data has been processed and a claim has been automatically created in the database with ID #{JSON.parse(result).claim_id}.
                        You can view and manage this claim in the dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result && !isProcessing && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileImage className="w-16 h-16 text-green-300 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No Results Yet</h3>
                <p className="text-green-600">Upload an image and click "Process Image" to see OCR results</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl border border-green-200 p-8">
          <h2 className="text-2xl font-semibold text-green-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">1. Upload Image</h3>
              <p className="text-green-600 text-sm">Select a clear image of your document</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">2. AI Processing</h3>
              <p className="text-green-600 text-sm">OCR extracts text and processes data</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">3. Claim Created</h3>
              <p className="text-green-600 text-sm">Data is automatically saved to database</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}