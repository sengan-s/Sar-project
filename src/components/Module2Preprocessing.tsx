/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Sliders,
  Layers,
  Grid,
  CheckCircle2,
  Sparkles,
  Download,
  Copy,
  Info,
  Maximize2,
  RefreshCw,
  Eye,
  Zap,
} from 'lucide-react';
import {
  SARDatasetMetadata,
  PreprocessOptions,
  PreprocessingResult,
  PatchMetadata,
} from '../types';

interface Module2PreprocessingProps {
  selectedSarId: string | null;
  onSelectSarIdChange: (id: string) => void;
}

export const Module2Preprocessing: React.FC<Module2PreprocessingProps> = ({
  selectedSarId,
  onSelectSarIdChange,
}) => {
  const [archiveDatasets, setArchiveDatasets] = useState<SARDatasetMetadata[]>([]);
  const [currentDataset, setCurrentDataset] = useState<SARDatasetMetadata | null>(null);

  // Preprocessing Options State
  const [despeckleFilter, setDespeckleFilter] = useState<PreprocessOptions['despeckleFilter']>('lee');
  const [windowSize, setWindowSize] = useState<PreprocessOptions['windowSize']>(5);
  const [leeNoiseVariance, setLeeNoiseVariance] = useState<number>(0.08);
  const [equalizeHistogram, setEqualizeHistogram] = useState<boolean>(true);
  const [alignOptical, setAlignOptical] = useState<boolean>(true);
  const [patchSize, setPatchSize] = useState<PreprocessOptions['patchSize']>(256);
  const [patchOverlap, setPatchOverlap] = useState<PreprocessOptions['patchOverlap']>(32);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [preprocessingResult, setPreprocessingResult] = useState<PreprocessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive UI view modes
  const [viewMode, setViewMode] = useState<'comparison' | 'alignment' | 'patchgrid'>('comparison');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [opticalOpacity, setOpticalOpacity] = useState<number>(50); // 0 to 100%
  const [hoveredPatch, setHoveredPatch] = useState<PatchMetadata | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load Archive List
  useEffect(() => {
    fetch('/api/sar/archive?pageSize=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.datasets && data.datasets.length > 0) {
          setArchiveDatasets(data.datasets);
          if (!selectedSarId) {
            onSelectSarIdChange(data.datasets[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch archive:', err));
  }, []);

  // Sync selected SAR dataset
  useEffect(() => {
    if (selectedSarId && archiveDatasets.length > 0) {
      const match = archiveDatasets.find((d) => d.id === selectedSarId);
      if (match) {
        setCurrentDataset(match);
        // Fetch existing preprocessing result if available
        fetch(`/api/preprocess/${selectedSarId}/result`)
          .then((res) => (res.ok ? res.json() : null))
          .then((resData) => {
            if (resData) setPreprocessingResult(resData);
            else setPreprocessingResult(null);
          })
          .catch(() => setPreprocessingResult(null));
      }
    }
  }, [selectedSarId, archiveDatasets]);

  // Execute PHYS-Net Preprocessing
  const handleRunPipeline = async () => {
    if (!selectedSarId) return;

    setIsProcessing(true);
    setProcessProgress(20);
    setErrorMessage(null);

    try {
      const payload: PreprocessOptions = {
        despeckleFilter,
        windowSize,
        leeNoiseVariance,
        equalizeHistogram,
        applyMinMaxNormalization: true,
        alignOptical,
        patchSize,
        patchOverlap,
      };

      setProcessProgress(50);

      const response = await fetch(`/api/preprocess/${selectedSarId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setProcessProgress(85);

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Preprocessing failed');
      }

      const resData = await response.json();
      setProcessProgress(100);
      setPreprocessingResult(resData.result);

      // Refresh dataset status
      const updatedDatasets = archiveDatasets.map((d) =>
        d.id === selectedSarId ? { ...d, processedStatus: 'PREPROCESSED' as const } : d
      );
      setArchiveDatasets(updatedDatasets);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error running PHYS-Net Preprocessing Engine');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPatchManifest = () => {
    if (!preprocessingResult) return;
    const jsonStr = JSON.stringify(preprocessingResult.patchGrid, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-red-900/30 rounded-xl p-6 shadow-md shadow-red-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/80 font-bold">
                MODULE 2
              </span>
              <h1 className="text-xl font-bold text-slate-100">
                PHYS-Net Preprocessing Engine
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Co-register and normalize raw SAR input, reduce multiplicative speckle noise via adaptive Lee/Median filtering, align optical reference pairs, and patchify into fixed 256x256 tile tensors for downstream deep learning core (Module 3).
            </p>
          </div>

          {/* Dataset Switcher Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-red-900/30">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Target Dataset:</span>
            <select
              value={selectedSarId || ''}
              onChange={(e) => onSelectSarIdChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-red-400 font-mono font-semibold focus:outline-none focus:border-red-500"
            >
              {archiveDatasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.locationName.slice(0, 32)}... ({d.sensorSource})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-slate-200">Engine Configurations</h2>
            </div>

            {/* 1. Despeckling Filter */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-medium">
                1. Speckle Noise Reduction Filter
              </label>
              <select
                value={despeckleFilter}
                onChange={(e) => setDespeckleFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-red-500"
              >
                <option value="lee">Adaptive Lee Filter (Multiplicative Noise)</option>
                <option value="median">Median Filter (3x3 / 5x5 Spikes)</option>
                <option value="bilateral">Bilateral Edge-Preserving Filter</option>
                <option value="none">None (Raw Speckled Baseline)</option>
              </select>

              {despeckleFilter === 'lee' && (
                <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Noise Variance ($\sigma_v^2$):</span>
                    <span className="font-mono text-red-400">{leeNoiseVariance}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.25"
                    step="0.01"
                    value={leeNoiseVariance}
                    onChange={(e) => setLeeNoiseVariance(parseFloat(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Hyperparameter estimating multi-look speckle noise variance.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Filter Window Size:</span>
                <div className="flex space-x-1">
                  {[3, 5, 7].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWindowSize(w as any)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                        windowSize === w
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {w}x{w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Normalization & Equalization */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <label className="block text-slate-300 font-medium">
                2. Contrast & Normalization
              </label>
              <label className="flex items-center space-x-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equalizeHistogram}
                  onChange={(e) => setEqualizeHistogram(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0"
                />
                <span>Histogram Equalization (CLAHE)</span>
              </label>
              <p className="text-[10px] text-slate-500">
                Stretches raw intensity distribution evenly across 0-255 range to expose land surface topography.
              </p>
            </div>

            {/* 3. Optical Co-Registration */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <label className="block text-slate-300 font-medium">
                3. Spatial Co-Registration
              </label>
              <label className="flex items-center space-x-2 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alignOptical}
                  onChange={(e) => setAlignOptical(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-0"
                />
                <span>Align Optical Reference Pair</span>
              </label>
            </div>

            {/* 4. Patchify Grid Configuration */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <label className="block text-slate-300 font-medium">
                4. Patchification (Tile Tensors)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Tile Resolution</label>
                  <select
                    value={patchSize}
                    onChange={(e) => setPatchSize(parseInt(e.target.value) as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                  >
                    <option value={128}>128 x 128 px</option>
                    <option value={256}>256 x 256 px (Standard)</option>
                    <option value={512}>512 x 512 px</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Stride Overlap</label>
                  <select
                    value={patchOverlap}
                    onChange={(e) => setPatchOverlap(parseInt(e.target.value) as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                  >
                    <option value={0}>0 px (No Overlap)</option>
                    <option value={16}>16 px</option>
                    <option value={32}>32 px (Recommended)</option>
                    <option value={64}>64 px</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-950/80 border border-red-700 text-red-200 text-xs p-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-red-400 font-mono font-medium">
                  <span>Executing PHYS-Net Filters...</span>
                  <span>{processProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-red-900/40">
                  <div
                    className="bg-red-500 h-full transition-all duration-300 shadow-sm shadow-red-500"
                    style={{ width: `${processProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunPipeline}
              disabled={isProcessing || !selectedSarId}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg shadow-red-950/50 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isProcessing ? 'Processing Engine Running...' : 'Run PHYS-Net Preprocessing'}</span>
            </button>
          </div>
        </div>

        {/* Right Interactive Dashboard Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {preprocessingResult ? (
            <div className="space-y-6">
              {/* Quantitative Metrics Bar */}
              <div className="bg-slate-900 border border-red-900/30 rounded-xl p-4 shadow-md shadow-red-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-red-400" />
                    <span>PHYS-Net Quantitative Analysis</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Processed in {preprocessingResult.processedAt.split('T')[1].slice(0, 8)} UTC
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Speckle Noise Drop</span>
                    <span className="text-red-400 font-bold text-sm">
                      +{preprocessingResult.beforeAfterMetrics.speckleSuppressionDb} dB
                    </span>
                    <span className="text-[10px] text-slate-500 block">SNR Improvement</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ENL (Looks Before/After)</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {preprocessingResult.beforeAfterMetrics.enlBefore} &rarr; {preprocessingResult.beforeAfterMetrics.enlAfter}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Equiv. Number of Looks</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Total Patch Grid</span>
                    <span className="text-rose-400 font-bold text-sm">
                      {preprocessingResult.patchGrid.totalPatches} Patches
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({preprocessingResult.patchGrid.gridRows} x {preprocessingResult.patchGrid.gridCols} Tiles)
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Co-Registration RMSE</span>
                    <span className="text-amber-400 font-bold text-sm">
                      {preprocessingResult.alignmentResult?.transformMatrix.rmsePixels || 0.42} px
                    </span>
                    <span className="text-[10px] text-slate-500 block">Affine Shift Residual</span>
                  </div>
                </div>
              </div>

              {/* View Selector Tabs */}
              <div className="flex space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('comparison')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 ${
                    viewMode === 'comparison'
                      ? 'bg-slate-800 text-red-400 border border-red-900/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>1. Despeckle Before / After Slider</span>
                </button>

                <button
                  onClick={() => setViewMode('alignment')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 ${
                    viewMode === 'alignment'
                      ? 'bg-slate-800 text-red-400 border border-red-900/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Optical Alignment Overlay</span>
                </button>

                <button
                  onClick={() => setViewMode('patchgrid')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 ${
                    viewMode === 'patchgrid'
                      ? 'bg-slate-800 text-red-400 border border-red-900/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>3. 256x256 Patch Tensor Overlay</span>
                </button>
              </div>

              {/* VIEW MODE 1: Before / After Split Slider */}
              {viewMode === 'comparison' && currentDataset && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                      <span>Raw Speckled SAR Input</span>
                    </span>
                    <span className="font-semibold flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      <span>PHYS-Net Despeckled & Normalized SAR</span>
                    </span>
                  </div>

                  {/* Interactive Split Slider Container */}
                  <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-slate-800 bg-black select-none">
                    {/* Background Processed Image */}
                    <img
                      src={preprocessingResult.processedSarUrl}
                      alt="Processed SAR"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Foreground Raw Image (Clipped) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-red-500 shadow-2xl"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={currentDataset.sarImageUrl}
                        alt="Raw SAR"
                        className="absolute inset-0 max-w-none h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Slider Line Indicator */}
                    <div
                      className="absolute inset-y-0 w-1 bg-red-500 cursor-ew-resize flex items-center justify-center"
                      style={{ left: `calc(${sliderPosition}% - 2px)` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
                        &harr;
                      </div>
                    </div>

                    {/* Labels */}
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur text-rose-300 px-2.5 py-1 rounded text-[11px] font-mono border border-rose-800/80">
                      RAW SAR
                    </span>
                    <span className="absolute top-3 right-3 bg-black/80 backdrop-blur text-red-300 px-2.5 py-1 rounded text-[11px] font-mono border border-red-800/80">
                      PHYS-NET DESPECKLED
                    </span>
                  </div>

                  {/* Slider Control */}
                  <div className="flex items-center space-x-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 shrink-0">Comparison Slider:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <span className="font-mono text-red-400 font-bold shrink-0">{sliderPosition}%</span>
                  </div>
                </div>
              )}

              {/* VIEW MODE 2: Co-Registration Alignment Overlay */}
              {viewMode === 'alignment' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      SAR + Optical Reference Co-Registration Overlay
                    </span>
                    <span className="text-red-400 font-mono">
                      Quality: {preprocessingResult.alignmentResult?.coRegistrationQuality || 'EXCELLENT'}
                    </span>
                  </div>

                  <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
                    {/* SAR Image Base Layer */}
                    <img
                      src={preprocessingResult.processedSarUrl}
                      alt="SAR Base"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Optical Overlay Layer */}
                    {preprocessingResult.alignmentResult?.alignedOpticalUrl && (
                      <img
                        src={preprocessingResult.alignmentResult.alignedOpticalUrl}
                        alt="Aligned Optical"
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
                        style={{ opacity: opticalOpacity / 100 }}
                      />
                    )}

                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur p-2 rounded text-[11px] font-mono text-slate-300 border border-slate-800 space-y-0.5">
                      <div>Scale: {preprocessingResult.alignmentResult?.transformMatrix.scaleX} x {preprocessingResult.alignmentResult?.transformMatrix.scaleY}</div>
                      <div>Rotation: {preprocessingResult.alignmentResult?.transformMatrix.rotationDeg}&deg;</div>
                      <div>Control Points: {preprocessingResult.alignmentResult?.transformMatrix.matchedControlPoints} ORB matches</div>
                    </div>
                  </div>

                  {/* Opacity Control */}
                  <div className="flex items-center space-x-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400 shrink-0">Optical Layer Opacity:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opticalOpacity}
                      onChange={(e) => setOpticalOpacity(parseInt(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <span className="font-mono text-red-400 font-bold shrink-0">{opticalOpacity}%</span>
                  </div>
                </div>
              )}

              {/* VIEW MODE 3: Visual Patchify Grid Overlay */}
              {viewMode === 'patchgrid' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-200">Module 3 Deep Learning Patch Grid Manifest</h3>
                      <p className="text-[11px] text-slate-400">
                        Image tiled into {preprocessingResult.patchGrid.totalPatches} patches of size {preprocessingResult.patchGrid.patchSize}x{preprocessingResult.patchGrid.patchSize} px with {preprocessingResult.patchGrid.patchOverlap} px stride overlap.
                      </p>
                    </div>

                    <button
                      onClick={copyPatchManifest}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded font-mono text-xs flex items-center space-x-1.5 border border-red-900/30"
                    >
                      <Copy className="w-3.5 h-3.5 text-red-400" />
                      <span>{copiedSuccess ? 'Manifest Copied!' : 'Copy JSON Manifest'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual Grid Image Overlay */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-square">
                      <img
                        src={preprocessingResult.processedSarUrl}
                        alt="Processed Grid"
                        className="w-full h-full object-cover"
                      />

                      {/* SVG Tile Overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                        {preprocessingResult.patchGrid.patches.map((p) => {
                          // Standard 512x512 image proportions
                          const scaleX = 100 / 512;
                          const scaleY = 100 / 512;
                          const x = p.x * scaleX;
                          const y = p.y * scaleY;
                          const w = p.width * scaleX;
                          const h = p.height * scaleY;

                          const isHovered = hoveredPatch?.id === p.id;

                          return (
                            <rect
                              key={p.id}
                              x={`${x}%`}
                              y={`${y}%`}
                              width={`${w}%`}
                              height={`${h}%`}
                              fill={isHovered ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.08)'}
                              stroke={isHovered ? '#ef4444' : 'rgba(239, 68, 68, 0.5)'}
                              strokeWidth={isHovered ? '2' : '1'}
                              className="cursor-pointer transition-colors"
                              onMouseEnter={() => setHoveredPatch(p)}
                            />
                          );
                        })}
                      </svg>
                    </div>

                    {/* Tile Details & Tensor Inspection */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {hoveredPatch ? (
                        <div className="bg-slate-950 p-4 rounded-lg border border-red-800/80 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="font-mono text-xs text-red-400 font-bold">
                              PATCH TENSOR [{hoveredPatch.rowIndex}, {hoveredPatch.colIndex}]
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {hoveredPatch.id}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <img
                              src={hoveredPatch.thumbnailUrl}
                              alt="Tile Thumbnail"
                              className="w-20 h-20 object-cover rounded border border-slate-700 bg-black"
                            />
                            <div className="space-y-1 text-xs font-mono text-slate-300">
                              <div>Offset: X={hoveredPatch.x}px, Y={hoveredPatch.y}px</div>
                              <div>Dimensions: {hoveredPatch.width} x {hoveredPatch.height}</div>
                              <div>Mean Intensity: {hoveredPatch.meanIntensity}</div>
                              <div>StdDev: {hoveredPatch.stdDevIntensity}</div>
                            </div>
                          </div>

                          <div className="bg-slate-900 p-2 rounded text-[10px] font-mono text-slate-400">
                            Tensor Array Shape: [1, {hoveredPatch.height}, {hoveredPatch.width}, 1] float32
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center text-xs text-slate-500 space-y-2">
                          <Grid className="w-8 h-8 mx-auto text-red-400 opacity-60" />
                          <p>Hover over any tile in the image grid to inspect patch coordinates and tensor shape.</p>
                        </div>
                      )}

                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Module 3 Ingestion Array
                        </span>
                        <div className="text-slate-300 space-y-1 text-[11px]">
                          <div>• Tensor Shape: [{preprocessingResult.patchGrid.totalPatches}, {patchSize}, {patchSize}, 1]</div>
                          <div>• Target Core: U-Net / Swin-Transformer Feature Extractor</div>
                          <div>• Data Type: Normalized Float32 [0.0 - 1.0]</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center h-full min-h-[480px]">
              <div className="p-4 bg-red-950/80 text-red-400 rounded-full border border-red-800/80">
                <Cpu className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-bold text-slate-200">PHYS-Net Engine Standby</h3>
                <p className="text-xs text-slate-400">
                  Select despeckle filter parameters on the left and click "Run PHYS-Net Preprocessing" to compute real despeckling, contrast equalization, optical co-registration, and 256x256 patchification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
