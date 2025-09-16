"use client";

import React, { useState } from "react";
import { BookOpen, MapPin, Loader2, AlertCircle } from "lucide-react";
import DecorativeBackground from "@/components/ui/DecorativeBackground";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface DSSResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export default function DSSPage() {
  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: ""
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DSSResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setResponse({
        success: false,
        error: "Please enter valid latitude and longitude values"
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      setResponse({
        success: false,
        error: "Latitude must be between -90 and 90"
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      setResponse({
        success: false,
        error: "Longitude must be between -180 and 180"
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/dss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        }),
      });

      if (res.ok) {
        const data = await res.text();
        setResponse({
          success: true,
          data: data
        });
      } else if (res.status === 422) {
        const errorData = await res.json();
        setResponse({
          success: false,
          error: errorData.detail?.[0]?.msg || "Validation error occurred"
        });
      } else {
        // Handle other error statuses including 500
        const errorText = await res.text();
        setResponse({
          success: false,
          error: `Server error (${res.status}): ${errorText || 'Unknown server error'}`
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        error: "Network error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'latitude' | 'longitude', value: string) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous response when user starts typing
    if (response) {
      setResponse(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
        <DecorativeBackground count={6} />

        <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
              <BookOpen className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-green-900">Decision Support System</h1>
              <p className="text-xs text-green-700">Scheme Recommendations</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Dashboard</Link>
            <Link href="/atlas" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Atlas</Link>
          </nav>
        </header>

        <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <section className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-green-300 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-green-600" size={24} />
                  <h2 className="text-xl font-semibold text-green-900">Location Input</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-green-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      step="any"
                      value={coordinates.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="e.g., 23.2599"
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 text-green-900 placeholder-green-400"
                      required
                    />
                    <p className="text-xs text-green-600 mt-1">Range: -90 to 90</p>
                  </div>

                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-green-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      step="any"
                      value={coordinates.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="e.g., 77.4126"
                      className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 text-green-900 placeholder-green-400"
                      required
                    />
                    <p className="text-xs text-green-600 mt-1">Range: -180 to 180</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Getting Recommendations...
                      </>
                    ) : (
                      <>
                        <BookOpen size={18} />
                        Get Scheme Recommendations
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md border border-green-100 p-6">
                <h4 className="font-semibold text-green-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/atlas"
                    className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Open Atlas
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 border border-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <section>
              <div className="bg-white rounded-2xl shadow-xl border border-green-300 p-8 h-full">
                <h2 className="text-xl font-semibold text-green-900 mb-6">Recommendations</h2>

                {response === null && !loading && (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto text-green-300 mb-4" size={48} />
                    <p className="text-green-600">
                      Enter coordinates above to get scheme recommendations for that location
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="mx-auto text-green-500 animate-spin mb-4" size={48} />
                    <p className="text-green-600">Analyzing location and generating recommendations...</p>
                  </div>
                )}

                {response && !loading && (
                  <div className="space-y-4">
                    {response.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <BookOpen className="text-green-600" size={16} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 mb-2">Scheme Recommendation</h3>
                            <div className="text-green-800 bg-white rounded-md p-4 border border-green-100">
                              <pre className="whitespace-pre-wrap font-mono text-sm">{response.data}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                            <p className="text-red-800">{response.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
