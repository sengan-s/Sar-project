/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Satellite,
  Image as ImageIcon,
  MapPin,
  ArrowRight,
  Info,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SARDatasetMetadata, QualityCheckResult } from '../types';

interface Module1UploadProps {
  onUploadSuccess: (dataset: SARDatasetMetadata) => void;
  onNavigateToPreprocess: (sarId: string) => void;
}

export const Module1Upload: React.FC<Module1UploadProps> = ({
  onUploadSuccess,
  onNavigateToPreprocess,
}) => {
  const [sarFile, setSarFile] = useState<File | null>(null);
  const [opticalFile, setOpticalFile] = useState<File | null>(null);

  const [sarPreviewUrl, setSarPreviewUrl] = useState<string | null>(null);
  const [opticalPreviewUrl, setOpticalPreviewUrl] = useState<string | null>(null);

  // Metadata form state
  const [locationName, setLocationName] = useState('Beira Flood Inundation Zone, Mozambique');
  const [sensorSource, setSensorSource] = useState<SARDatasetMetadata['sensorSource']>('Sentinel-1A');
  const [polarization, setPolarization] = useState<SARDatasetMetadata['polarization']>('VV+VH');
  const [latMin, setLatMin] = useState(-19.85);
  const [lngMin, setLngMin] = useState(34.82);
  const [latMax, setLatMax] = useState(-19.78);
  const [lngMax, setLngMax] = useState(34.91);
  const [acquisitionDate, setAcquisitionDate] = useState('2024-03-18T10:14:22Z');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDataset, setUploadedDataset] = useState<SARDatasetMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSarFileChange = (file: File | null) => {
    if (!file) return;
    setSarFile(file);
    const url = URL.createObjectURL(file);
    setSarPreviewUrl(url);
    setUploadedDataset(null);
  };

  const handleOpticalFileChange = (file: File | null) => {
    if (!file) return;
    setOpticalFile(file);
    const url = URL.createObjectURL(file);
    setOpticalPreviewUrl(url);
  };

  const setLocationPreset = (preset: 'flood' | 'turkey' | 'greece') => {
    if (preset === 'flood') {
      setLocationName('Beira Flood Basin, Mozambique (Cyclone Idai)');
      setSensorSource('Sentinel-1A');
      setPolarization('VV+VH');
      setLatMin(-19.85); setLngMin(34.82); setLatMax(-19.78); setLngMax(34.91);
    } else if (preset === 'turkey') {
      setLocationName('Kahramanmaraş Structural Collapse Zone, Turkey');
      setSensorSource('PAZ');
      setPolarization('HH');
      setLatMin(37.56); setLngMin(36.88); setLatMax(37.62); setLngMax(36.95);
    } else if (preset === 'greece') {
      setLocationName('Rhodes Forest Burn Scar, Greece');
      setSensorSource('Sentinel-1B');
      setPolarization('VV');
      setLatMin(36.15); setLngMin(27.92); setLatMax(36.22); setLngMax(28.01);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sarFile) {
      setErrorMessage('Please select a raw SAR image file (.png, .jpg, or .tif) to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('sar_image', sarFile);
      if (opticalFile) {
        formData.append('optical_image', opticalFile);
      }

      formData.append('locationName', locationName);
      formData.append('sensorSource', sensorSource);
      formData.append('polarization', polarization);
      formData.append('latMin', latMin.toString());
      formData.append('lngMin', lngMin.toString());
      formData.append('latMax', latMax.toString());
      formData.append('lngMax', lngMax.toString());
      formData.append('acquisitionDate', acquisitionDate);

      setUploadProgress(40);

      const response = await fetch('/api/sar/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        let errorMsg = 'Failed to upload SAR image';
        if (response.status === 413) {
          errorMsg = 'File size exceeds serverless upload limit (4.5 MB on Vercel). Please upload a smaller image file or compressed PNG/JPG.';
        } else {
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            errorMsg = `Upload failed (${response.status} ${response.statusText}). Check serverless function logs.`;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setUploadProgress(100);
      setUploadedDataset(data.dataset);
      onUploadSuccess(data.dataset);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading dataset');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-red-900/30 rounded-xl p-6 shadow-md shadow-red-950/20">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/80 font-bold">
                MODULE 1
              </span>
              <h1 className="text-xl font-bold text-slate-100">
                SAR Data Acquisition & Quality Check
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Ingest raw C-Band / X-Band Synthetic Aperture Radar imagery alongside optional paired optical references. Auto-calculates spatial bounding metadata and executes automated quality verification (contrast, Laplacian blur, overexposure ratio).
            </p>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-red-900/30">
            <Info className="w-4 h-4 text-red-400 shrink-0" />
            <span>Accepts 8-bit / 16-bit grayscale SAR geotiffs, PNGs, and JPGs.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleUploadSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-200 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-red-400" />
              <span>1. Image File Selection</span>
            </h2>

            {/* Dropzone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SAR File Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Raw SAR Image File <span className="text-red-400">*Required</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative ${
                    sarFile
                      ? 'border-red-500/60 bg-red-950/30'
                      : 'border-slate-700 hover:border-red-600/50 bg-slate-950/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.tif,.tiff"
                    onChange={(e) => handleSarFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {sarPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={sarPreviewUrl}
                        alt="SAR Preview"
                        className="h-28 mx-auto rounded border border-red-800/60 object-cover"
                      />
                      <p className="text-xs text-slate-300 font-mono truncate">{sarFile?.name}</p>
                      <p className="text-[10px] text-red-400 font-medium">Click to change SAR file</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Satellite className="w-8 h-8 mx-auto text-red-400 opacity-90" />
                      <div className="text-xs text-slate-300 font-medium">Drop raw SAR image here</div>
                      <p className="text-[10px] text-slate-500">Grayscale PNG, JPG, or geotiff</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optical Pair Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Paired Optical Reference <span className="text-slate-500">(Optional)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative ${
                    opticalFile
                      ? 'border-red-500/60 bg-red-950/30'
                      : 'border-slate-700 hover:border-red-600/50 bg-slate-950/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOpticalFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {opticalPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={opticalPreviewUrl}
                        alt="Optical Preview"
                        className="h-28 mx-auto rounded border border-red-800/60 object-cover"
                      />
                      <p className="text-xs text-slate-300 font-mono truncate">{opticalFile?.name}</p>
                      <p className="text-[10px] text-red-400 font-medium">Click to change optical pair</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <ImageIcon className="w-8 h-8 mx-auto text-rose-400 opacity-80" />
                      <div className="text-xs text-slate-300 font-medium">Drop optical reference image</div>
                      <p className="text-[10px] text-slate-500">Sentinel-2 / PlanetScope RGB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>2. Geographic & Sensor Metadata</span>
                </h2>

                {/* Quick Presets */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setLocationPreset('flood')}
                    className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/50 text-red-300 text-[11px]"
                  >
                    Flood
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationPreset('turkey')}
                    className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/50 text-amber-300 text-[11px]"
                  >
                    Quake
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationPreset('greece')}
                    className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-800/50 text-rose-300 text-[11px]"
                  >
                    Fire
                  </button>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Target Disaster Location</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">SAR Sensor Platform</label>
                    <select
                      value={sensorSource}
                      onChange={(e) => setSensorSource(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="Sentinel-1A">Sentinel-1A (C-Band)</option>
                      <option value="Sentinel-1B">Sentinel-1B (C-Band)</option>
                      <option value="PAZ">PAZ (X-Band)</option>
                      <option value="TerraSAR-X">TerraSAR-X (X-Band)</option>
                      <option value="RADARSAT-2">RADARSAT-2 (C-Band)</option>
                      <option value="Custom SAR">Custom Airborne SAR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Polarization Channel</label>
                    <select
                      value={polarization}
                      onChange={(e) => setPolarization(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="VV">VV (Vertical-Vertical)</option>
                      <option value="VH">VH (Vertical-Horizontal)</option>
                      <option value="HH">HH (Horizontal-Horizontal)</option>
                      <option value="HV">HV (Horizontal-Vertical)</option>
                      <option value="VV+VH">Dual-Pol (VV+VH)</option>
                    </select>
                  </div>
                </div>

                {/* Bounding Box Inputs */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <span className="text-slate-400 text-[11px] font-medium block">
                    Geographic Bounding Box Coordinates (Lat/Lng)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                    <div>
                      <label className="text-[10px] text-slate-500">Lat Min</label>
                      <input
                        type="number"
                        step="0.01"
                        value={latMin}
                        onChange={(e) => setLatMin(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Lng Min</label>
                      <input
                        type="number"
                        step="0.01"
                        value={lngMin}
                        onChange={(e) => setLngMin(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Lat Max</label>
                      <input
                        type="number"
                        step="0.01"
                        value={latMax}
                        onChange={(e) => setLatMax(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Lng Max</label>
                      <input
                        type="number"
                        step="0.01"
                        value={lngMax}
                        onChange={(e) => setLngMax(parseFloat(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Satellite Acquisition Timestamp</label>
                  <input
                    type="text"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-700 text-red-200 text-xs p-3 rounded-lg flex items-center space-x-2">
                <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit & Progress */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-red-400 font-medium">
                  <span>Extracting Metadata & Executing Quality Verification...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-red-900/40">
                  <div
                    className="bg-red-500 h-full transition-all duration-300 shadow-sm shadow-red-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !sarFile}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-lg shadow-red-950/50 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Satellite className="w-4 h-4" />
              <span>{isUploading ? 'Ingesting & Analyzing Image...' : 'Upload & Execute Module 1 Quality Check'}</span>
            </button>
          </form>
        </div>

        {/* Right Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {uploadedDataset ? (
            <div className="bg-slate-900 border border-red-900/30 rounded-xl p-6 space-y-6 shadow-md shadow-red-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-red-400" />
                  <h2 className="text-base font-semibold text-slate-100">Quality Inspection Report</h2>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    uploadedDataset.qualityReport.statusLabel === 'PASSED'
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : uploadedDataset.qualityReport.statusLabel === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {uploadedDataset.qualityReport.statusLabel} ({uploadedDataset.qualityReport.score}/100)
                </span>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-red-400 block mb-1">RAW SAR INGESTED</span>
                  <img
                    src={uploadedDataset.sarImageUrl}
                    alt="SAR Ingested"
                    className="h-32 mx-auto rounded object-cover border border-slate-800"
                  />
                </div>
                {uploadedDataset.opticalImageUrl ? (
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-rose-400 block mb-1">OPTICAL REFERENCE</span>
                    <img
                      src={uploadedDataset.opticalImageUrl}
                      alt="Optical Ingested"
                      className="h-32 mx-auto rounded object-cover border border-slate-800"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 flex items-center justify-center text-center text-xs text-slate-500">
                    No optical pair provided
                  </div>
                )}
              </div>

              {/* Quality Metrics Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-red-400/90 uppercase tracking-wider">
                  Image Quality Diagnostics
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Contrast StdDev</span>
                    <span className="text-red-400 font-bold">{uploadedDataset.qualityReport.metrics.stdDevIntensity}</span>
                    <span className="text-[10px] text-slate-500 block">(Target &gt; 15)</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Laplacian Variance</span>
                    <span className="text-red-400 font-bold">{uploadedDataset.qualityReport.metrics.laplacianVariance}</span>
                    <span className="text-[10px] text-slate-500 block">(Blur/Noise index)</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Estimated SNR</span>
                    <span className="text-red-400 font-bold">{uploadedDataset.qualityReport.metrics.snrEstimateDb} dB</span>
                    <span className="text-[10px] text-slate-500 block">Signal-to-Noise Ratio</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Dimensions</span>
                    <span className="text-slate-200 font-bold">
                      {uploadedDataset.dimensions.width}x{uploadedDataset.dimensions.height}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Pixels</span>
                  </div>
                </div>
              </div>

              {/* Reasons Checklist */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Verification Audit Log
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {uploadedDataset.qualityReport.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigateToPreprocess(uploadedDataset.id)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-lg shadow-red-950/40 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>Proceed to Module 2 (PHYS-Net Engine)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm flex flex-col items-center justify-center h-full min-h-[420px]">
              <div className="p-3 bg-red-950/80 text-red-400 rounded-full border border-red-800/60">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-semibold text-slate-200">Awaiting Ingestion</h3>
                <p className="text-xs text-slate-400">
                  Upload a SAR image or select a preset location to execute automated quality verification and metadata generation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
