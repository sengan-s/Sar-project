/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================
// MODULE 1: SAR DATA ACQUISITION & PREPROCESSING TYPES
// ============================================================

export interface BoundingBox {
  latMin: number;
  lngMin: number;
  latMax: number;
  lngMax: number;
}

export interface ImageQualityMetrics {
  meanIntensity: number;
  stdDevIntensity: number;
  laplacianVariance: number; // Blur / noise metric
  dynamicRange: number;
  darkPixelRatio: number;
  overexposedPixelRatio: number;
  snrEstimateDb: number;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0 - 100
  statusLabel: 'PASSED' | 'WARNING' | 'FAILED';
  reasons: string[];
  metrics: ImageQualityMetrics;
}

export interface SARDatasetMetadata {
  id: string;
  filename: string;
  originalFilename: string;
  opticalFilename?: string;
  uploadTimestamp: string;
  dimensions: {
    width: number;
    height: number;
    channels: number;
  };
  fileSizeBytes: number;
  sensorSource: 'Sentinel-1A' | 'Sentinel-1B' | 'PAZ' | 'TerraSAR-X' | 'RADARSAT-2' | 'Custom SAR';
  polarization: 'VV' | 'VH' | 'HH' | 'HV' | 'VV+VH';
  acquisitionDate: string;
  locationName: string;
  boundingBox: BoundingBox;
  qualityReport: QualityCheckResult;
  sarImageUrl: string;
  opticalImageUrl?: string;
  processedStatus: 'RAW' | 'PREPROCESSED';
  lastProcessedAt?: string;
}

// ============================================================
// MODULE 2: PHYS-NET PREPROCESSING ENGINE TYPES
// ============================================================

export type DespeckleFilterType = 'lee' | 'median' | 'bilateral' | 'none';

export interface PreprocessOptions {
  despeckleFilter: DespeckleFilterType;
  windowSize: 3 | 5 | 7;
  leeNoiseVariance?: number; // Noise variance hyperparameter for Lee filter
  equalizeHistogram: boolean;
  applyMinMaxNormalization: boolean;
  alignOptical: boolean;
  patchSize: 128 | 256 | 512;
  patchOverlap: 0 | 16 | 32 | 64;
}

export interface AffineTransformMatrix {
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
  translateX: number;
  translateY: number;
  rmsePixels: number;
  matchedControlPoints: number;
}

export interface AlignmentResult {
  alignedOpticalUrl?: string;
  transformMatrix: AffineTransformMatrix;
  coRegistrationQuality: 'EXCELLENT' | 'GOOD' | 'FAIR';
  comments: string;
}

export interface PatchMetadata {
  id: string;
  rowIndex: number;
  colIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  meanIntensity: number;
  stdDevIntensity: number;
  thumbnailUrl: string;
}

export interface PatchGridResult {
  patchSize: number;
  patchOverlap: number;
  totalPatches: number;
  gridRows: number;
  gridCols: number;
  patches: PatchMetadata[];
  tensorShape: [number, number, number, number]; // [TotalPatches, PatchHeight, PatchWidth, Channels]
}

export interface PreprocessingResult {
  sarId: string;
  processedSarUrl: string;
  beforeAfterMetrics: {
    rawStdDev: number;
    processedStdDev: number;
    rawSnrDb: number;
    processedSnrDb: number;
    enlBefore: number; // Equivalent Number of Looks before
    enlAfter: number;  // Equivalent Number of Looks after
    speckleSuppressionDb: number;
  };
  alignmentResult?: AlignmentResult;
  patchGrid: PatchGridResult;
  processedAt: string;
  optionsUsed: PreprocessOptions;
}

export interface ArchiveResponse {
  datasets: SARDatasetMetadata[];
  total: number;
  page: number;
  pageSize: number;
}
