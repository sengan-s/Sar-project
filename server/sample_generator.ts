/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sample Generator for Prototype Initialization
 * Generates 4 realistic C-band/X-band SAR + Optical dataset pairs with
 * authentic speckle noise profiles and geographic metadata.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { SARDatasetMetadata } from '../src/types.js';
import { extractImageMetadata, performQualityCheck, runPHYSNetPipeline } from './sar_engine.js';

interface SampleConfig {
  id: string;
  filename: string;
  opticalFilename: string;
  sensorSource: SARDatasetMetadata['sensorSource'];
  polarization: SARDatasetMetadata['polarization'];
  locationName: string;
  acquisitionDate: string;
  boundingBox: SARDatasetMetadata['boundingBox'];
  type: 'flood' | 'earthquake' | 'wildfire' | 'typhoon';
}

const SAMPLE_CONFIGS: SampleConfig[] = [
  {
    id: 'sar_dataset_001',
    filename: 'sentinel1_flood_mozambique.png',
    opticalFilename: 'sentinel2_flood_mozambique_optical.png',
    sensorSource: 'Sentinel-1A',
    polarization: 'VV+VH',
    locationName: 'Beira Flood Basin, Mozambique (Cyclone Idai)',
    acquisitionDate: '2024-03-18T10:14:22Z',
    boundingBox: { latMin: -19.85, lngMin: 34.82, latMax: -19.78, lngMax: 34.91 },
    type: 'flood',
  },
  {
    id: 'sar_dataset_002',
    filename: 'paz_earthquake_turkey.png',
    opticalFilename: 'planet_earthquake_turkey_optical.png',
    sensorSource: 'PAZ',
    polarization: 'HH',
    locationName: 'Kahramanmaraş Structural Damage, Turkey',
    acquisitionDate: '2024-02-08T04:22:15Z',
    boundingBox: { latMin: 37.56, lngMin: 36.88, latMax: 37.62, lngMax: 36.95 },
    type: 'earthquake',
  },
  {
    id: 'sar_dataset_003',
    filename: 'sentinel1_wildfire_greece.png',
    opticalFilename: 'sentinel2_wildfire_greece_optical.png',
    sensorSource: 'Sentinel-1B',
    polarization: 'VV',
    locationName: 'Rhodes Forest Burn Scar, Greece',
    acquisitionDate: '2024-07-22T16:45:00Z',
    boundingBox: { latMin: 36.15, lngMin: 27.92, latMax: 36.22, lngMax: 28.01 },
    type: 'wildfire',
  },
  {
    id: 'sar_dataset_004',
    filename: 'terrasar_coastal_philippines.png',
    opticalFilename: 'landsat8_coastal_philippines_optical.png',
    sensorSource: 'TerraSAR-X',
    polarization: 'HV',
    locationName: 'Tacloban Coastal Inundation, Philippines',
    acquisitionDate: '2024-11-12T08:30:10Z',
    boundingBox: { latMin: 11.23, lngMin: 124.98, latMax: 11.30, lngMax: 125.06 },
    type: 'typhoon',
  },
];

/**
 * Generate synthetic procedural SAR raw image buffer with speckle noise
 */
function createSyntheticSarPixels(width: number, height: number, type: SampleConfig['type']): Uint8Array {
  const pixels = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Base terrain reflectivity structure
      let baseReflectivity = 90; // Default terrain

      // Feature 1: Water body / Flooded area (Smooth surface -> low backscatter)
      const distToRiver = Math.abs(y - (Math.sin(x / 40) * 60 + height / 2));
      if (distToRiver < 45) {
        baseReflectivity = 18; // Smooth dark water
      }

      // Feature 2: Urban building structures / Bright corner reflectors
      if (type === 'earthquake' || (x > 180 && x < 350 && y > 120 && y < 380)) {
        if ((x % 24 < 12) && (y % 24 < 12)) {
          baseReflectivity = 220; // Double-bounce corner reflector
        }
      }

      // Feature 3: Burn scar / Vegetation rough canopy
      if (type === 'wildfire' && Math.hypot(x - 280, y - 260) < 130) {
        baseReflectivity = 45; // Reduced volume scattering in burn scar
      }

      // Add Rayleigh / Multiplicative Speckle Noise characteristic of SAR
      // Noise model: I = I_0 * (Exponential(1) or Gamma distribution)
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const gaussianNoise = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      
      // Multiplicative speckle factor ~ 1 + 0.35 * Gaussian
      const speckleFactor = Math.max(0.05, 1.0 + 0.35 * gaussianNoise);
      
      const noisyVal = baseReflectivity * speckleFactor;
      pixels[idx] = Math.min(255, Math.max(0, Math.round(noisyVal)));
    }
  }

  return pixels;
}

/**
 * Generate synthetic optical reference image buffer (RGB)
 */
function createSyntheticOpticalBuffer(width: number, height: number, type: SampleConfig['type']): Promise<Buffer> {
  const rgbPixels = new Uint8Array(width * height * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;

      let r = 70, g = 130, b = 60; // Green vegetation

      // Water body
      const distToRiver = Math.abs(y - (Math.sin(x / 40) * 60 + height / 2));
      if (distToRiver < 45) {
        r = 30; g = 80; b = 160; // Blue floodwater
      }

      // Urban area
      if (type === 'earthquake' || (x > 180 && x < 350 && y > 120 && y < 380)) {
        if ((x % 24 < 12) && (y % 24 < 12)) {
          r = 210; g = 190; b = 180; // Concrete roofs
        }
      }

      // Wildfire burn scar
      if (type === 'wildfire' && Math.hypot(x - 280, y - 260) < 130) {
        r = 60; g = 40; b = 30; // Charred soil
      }

      // Subtle atmospheric / sensor noise
      const noise = (Math.random() - 0.5) * 12;
      rgbPixels[idx] = Math.min(255, Math.max(0, Math.round(r + noise)));
      rgbPixels[idx + 1] = Math.min(255, Math.max(0, Math.round(g + noise)));
      rgbPixels[idx + 2] = Math.min(255, Math.max(0, Math.round(b + noise)));
    }
  }

  return sharp(rgbPixels, { raw: { width, height, channels: 3 } })
    .png()
    .toBuffer();
}

/**
 * Ensures all 4 sample SAR datasets are generated and recorded in the database
 */
export async function initializeSampleDatasets(
  uploadsDir: string,
  saveArchiveCallback: (datasets: SARDatasetMetadata[]) => Promise<void>
): Promise<SARDatasetMetadata[]> {
  const datasets: SARDatasetMetadata[] = [];
  const width = 512;
  const height = 512;

  await fs.mkdir(uploadsDir, { recursive: true });

  for (const cfg of SAMPLE_CONFIGS) {
    const sarFilePath = path.join(uploadsDir, cfg.filename);
    const opticalFilePath = path.join(uploadsDir, cfg.opticalFilename);

    let sarBuffer: Buffer;
    let opticalBuffer: Buffer;

    try {
      sarBuffer = await fs.readFile(sarFilePath);
      opticalBuffer = await fs.readFile(opticalFilePath);
    } catch {
      // Generate synthetic sample files
      const sarPixels = createSyntheticSarPixels(width, height, cfg.type);
      sarBuffer = await sharp(sarPixels, { raw: { width, height, channels: 1 } }).png().toBuffer();
      opticalBuffer = await createSyntheticOpticalBuffer(width, height, cfg.type);

      await fs.writeFile(sarFilePath, sarBuffer);
      await fs.writeFile(opticalFilePath, opticalBuffer);
    }

    // Extract metadata
    const metaInfo = await extractImageMetadata(
      sarBuffer,
      opticalBuffer,
      cfg.filename,
      {
        locationName: cfg.locationName,
        sensorSource: cfg.sensorSource,
        boundingBox: cfg.boundingBox,
        acquisitionDate: cfg.acquisitionDate,
      }
    );

    const qualityReport = performQualityCheck(metaInfo.metrics, width, height);

    const dataset: SARDatasetMetadata = {
      id: cfg.id,
      filename: cfg.filename,
      originalFilename: cfg.filename,
      opticalFilename: cfg.opticalFilename,
      uploadTimestamp: new Date().toISOString(),
      dimensions: metaInfo.dimensions,
      fileSizeBytes: metaInfo.fileSizeBytes,
      sensorSource: cfg.sensorSource,
      polarization: cfg.polarization,
      acquisitionDate: cfg.acquisitionDate,
      locationName: cfg.locationName,
      boundingBox: cfg.boundingBox,
      qualityReport,
      sarImageUrl: `/uploads/${cfg.filename}`,
      opticalImageUrl: `/uploads/${cfg.opticalFilename}`,
      processedStatus: 'RAW',
    };

    // Pre-run default PHYS-Net pipeline for the first sample so it's ready out of the box!
    if (cfg.id === 'sar_dataset_001') {
      try {
        const { preprocessingResult } = await runPHYSNetPipeline(
          sarBuffer,
          cfg.id,
          {
            despeckleFilter: 'lee',
            windowSize: 5,
            equalizeHistogram: true,
            applyMinMaxNormalization: true,
            alignOptical: true,
            patchSize: 256,
            patchOverlap: 32,
          },
          uploadsDir,
          opticalBuffer
        );
        dataset.processedStatus = 'PREPROCESSED';
        dataset.lastProcessedAt = preprocessingResult.processedAt;
      } catch (err) {
        console.error('Failed pre-processing sample dataset 001:', err);
      }
    }

    datasets.push(dataset);
  }

  await saveArchiveCallback(datasets);
  return datasets;
}
