"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ArrowLeft, MapPin, Calendar, User, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FeatureData {
  type: 'Feature';
  properties: {
    id: string;
    type?: string;
    claimant?: string;
    status?: string;
    area?: number;
    claim_type?: string;
    village?: string;
    state: string;
    district: string;
    osm_id?: number;
    tags?: any;
    application_date?: string;
    source?: string;
    resolution_status?: string;
    note?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number] | [number, number][] | [number, number][][] | [number, number][][][];
  };
}

export default function FeaturePage({ params }: { params: Promise<{ featureId: string }> }) {
  const [featureId, setFeatureId] = useState<string>('');
  const [feature, setFeature] = useState<FeatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const { featureId: id } = await params;
      setFeatureId(decodeURIComponent(id));
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (!featureId) return;

    const fetchFeature = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine if this is an FRA claim or asset based on ID pattern
        const isFRAClaim = featureId.includes('FRA');

        let apiUrl = '';
        let searchParams = '';

        if (isFRAClaim) {
          // For FRA claims, extract state and district from ID
          const parts = featureId.split('_');
          if (parts.length >= 3) {
            const stateCode = parts[0];
            const districtCode = parts[1];

            // Map codes to full names (simplified mapping)
            const stateMap: { [key: string]: string } = {
              'MP': 'Madhya Pradesh',
              'TR': 'Tripura',
              'OD': 'Odisha',
              'TS': 'Telangana',
              'WB': 'West Bengal'
            };

            const districtMap: { [key: string]: { [key: string]: string } } = {
              'MP': { 'BH': 'Bhopal', 'IN': 'Indore' },
              'TR': { 'WT': 'West Tripura' },
              'OD': { 'PU': 'Puri' },
              'TS': { 'HY': 'Hyderabad' },
              'WB': { 'SB': 'Sundarban' }
            };

            const state = stateMap[stateCode] || 'Madhya Pradesh';
            const district = districtMap[stateCode]?.[districtCode] || 'Bhopal';

            apiUrl = `/api/atlas/fra?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`;
          }
        } else {
          // For assets, try different states and districts
          const states = ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana', 'West Bengal'];
          const districts: { [key: string]: string[] } = {
            'Madhya Pradesh': ['Bhopal', 'Indore'],
            'Tripura': ['West Tripura'],
            'Odisha': ['Puri'],
            'Telangana': ['Hyderabad'],
            'West Bengal': ['Sundarban']
          };

          for (const state of states) {
            for (const district of districts[state] || []) {
              try {
                const response = await fetch(`/api/atlas/assets?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
                if (response.ok) {
                  const data = await response.json();
                  const foundFeature = data.features?.find((f: FeatureData) => f.properties.id === featureId);
                  if (foundFeature) {
                    setFeature(foundFeature);
                    setLoading(false);
                    return;
                  }
                }
              } catch (err) {
                console.log(`No feature found in ${state}, ${district}`);
              }
            }
          }
        }

        if (apiUrl) {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const data = await response.json();
          const foundFeature = data.features?.find((f: FeatureData) => f.properties.id === featureId);

          if (foundFeature) {
            setFeature(foundFeature);
          } else {
            setError('Feature not found');
          }
        } else {
          setError('Unable to determine feature type');
        }
      } catch (err) {
        console.error('Error fetching feature:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feature');
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, [featureId]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'submitted':
        return <Clock className="text-yellow-500" size={20} />;
      case 'pending':
        return <AlertCircle className="text-orange-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'granted':
        return 'text-green-700 bg-green-50';
      case 'submitted':
        return 'text-yellow-700 bg-yellow-50';
      case 'pending':
        return 'text-orange-700 bg-orange-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !feature) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-700">{error || 'Feature not found'}</p>
            <div className="mt-4">
              <Link href="/atlas" className="text-sm text-green-600 hover:text-green-800">← Back to Atlas</Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isFRAClaim = featureId.includes('FRA');
  const props = feature.properties;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/atlas" className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors">
              <ArrowLeft size={16} />
              Back to Atlas
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {isFRAClaim ? 'FRA Claim Details' : 'Asset Details'}
                  </h1>
                  <p className="text-green-100 mt-1">ID: {props.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(props.status)}
                  <span className="text-sm font-medium">{props.status || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{props.village || 'N/A'}, {props.district}, {props.state}</p>
                    </div>
                  </div>

                  {props.claimant && (
                    <div className="flex items-center gap-3">
                      <User className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Claimant</p>
                        <p className="font-medium">{props.claimant}</p>
                      </div>
                    </div>
                  )}

                  {props.area && (
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Area</p>
                        <p className="font-medium">{props.area} hectares</p>
                      </div>
                    </div>
                  )}

                  {props.application_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Application Date</p>
                        <p className="font-medium">{new Date(props.application_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Type</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {props.type || props.claim_type || 'Unknown'}
                    </span>
                  </div>

                  {props.status && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Status</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(props.status)}`}>
                        {getStatusIcon(props.status)}
                        {props.status}
                      </span>
                    </div>
                  )}

                  {props.source && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Data Source</p>
                      <p className="font-medium text-gray-700">{props.source}</p>
                    </div>
                  )}

                  {props.osm_id && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">OSM ID</p>
                      <p className="font-medium text-gray-700">{props.osm_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {props.tags && Object.keys(props.tags).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">OSM Tags</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(props.tags).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded text-sm">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600 ml-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {props.note && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Note</h3>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded">{props.note}</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Edit Details
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Generate Report
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
