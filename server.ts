/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Express + Vite Server Entry Point for SAR Disaster Intelligence Platform
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { SARDatasetMetadata, PreprocessOptions, PreprocessingResult } from './src/types.js';
import {
  extractImageMetadata,
  performQualityCheck,
  runPHYSNetPipeline,
} from './server/sar_engine.js';
import { initializeSampleDatasets } from './server/sample_generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const ARCHIVE_FILE = path.join(UPLOADS_DIR, 'archive.json');
const PREPROCESS_RESULTS_FILE = path.join(UPLOADS_DIR, 'preprocess_results.json');

// Memory + JSON file store
let datasetsArchive: SARDatasetMetadata[] = [];
let preprocessingResultsStore: Record<string, PreprocessingResult> = {};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

async function saveArchive() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(ARCHIVE_FILE, JSON.stringify(datasetsArchive, null, 2));
}

async function loadArchive() {
  try {
    const data = await fs.readFile(ARCHIVE_FILE, 'utf-8');
    datasetsArchive = JSON.parse(data);
  } catch {
    datasetsArchive = [];
  }
}

async function savePreprocessResults() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(PREPROCESS_RESULTS_FILE, JSON.stringify(preprocessingResultsStore, null, 2));
}

async function loadPreprocessResults() {
  try {
    const data = await fs.readFile(PREPROCESS_RESULTS_FILE, 'utf-8');
    preprocessingResultsStore = JSON.parse(data);
  } catch {
    preprocessingResultsStore = {};
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static directory for uploads
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Initialize archive & sample data
  await loadArchive();
  await loadPreprocessResults();

  if (datasetsArchive.length === 0) {
    console.log('[INIT] Generating sample SAR datasets for research paper prototype...');
    datasetsArchive = await initializeSampleDatasets(UPLOADS_DIR, async (updated) => {
      datasetsArchive = updated;
      await saveArchive();
    });
  }

  // ============================================================
  // MODULE 1 API ENDPOINTS
  // ============================================================

  /**
   * [MODULE 1] POST /api/sar/upload
   * Upload raw SAR image (+ optional paired optical image) and generate metadata + quality check.
   */
  app.post(
    '/api/sar/upload',
    upload.fields([
      { name: 'sar_image', maxCount: 1 },
      { name: 'optical_image', maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files || !files.sar_image || files.sar_image.length === 0) {
          return res.status(400).json({ error: 'Raw SAR image file (sar_image) is required.' });
        }

        const sarFile = files.sar_image[0];
        const opticalFile = files.optical_image ? files.optical_image[0] : undefined;

        const sarBuffer = await fs.readFile(sarFile.path);
        const opticalBuffer = opticalFile ? await fs.readFile(opticalFile.path) : undefined;

        // Custom metadata body params
        const locationName = req.body.locationName || 'Uploaded Disaster Zone';
        const sensorSource = (req.body.sensorSource as SARDatasetMetadata['sensorSource']) || 'Sentinel-1A';
        const polarization = (req.body.polarization as SARDatasetMetadata['polarization']) || 'VV';
        const acquisitionDate = req.body.acquisitionDate || new Date().toISOString();

        const latMin = parseFloat(req.body.latMin) || 37.58;
        const lngMin = parseFloat(req.body.lngMin) || 36.85;
        const latMax = parseFloat(req.body.latMax) || 37.62;
        const lngMax = parseFloat(req.body.lngMax) || 36.9;

        // Extract metadata and statistics
        const metaInfo = await extractImageMetadata(
          sarBuffer,
          opticalBuffer,
          sarFile.originalname,
          {
            locationName,
            sensorSource,
            boundingBox: { latMin, lngMin, latMax, lngMax },
            acquisitionDate,
          }
        );

        // Perform quality check
        const qualityReport = performQualityCheck(
          metaInfo.metrics,
          metaInfo.dimensions.width,
          metaInfo.dimensions.height
        );

        const id = `sar_dataset_${Date.now()}`;

        const dataset: SARDatasetMetadata = {
          id,
          filename: sarFile.filename,
          originalFilename: sarFile.originalname,
          opticalFilename: opticalFile ? opticalFile.filename : undefined,
          uploadTimestamp: new Date().toISOString(),
          dimensions: metaInfo.dimensions,
          fileSizeBytes: metaInfo.fileSizeBytes,
          sensorSource,
          polarization,
          acquisitionDate,
          locationName,
          boundingBox: { latMin, lngMin, latMax, lngMax },
          qualityReport,
          sarImageUrl: `/uploads/${sarFile.filename}`,
          opticalImageUrl: opticalFile ? `/uploads/${opticalFile.filename}` : undefined,
          processedStatus: 'RAW',
        };

        // Add to archive
        datasetsArchive.unshift(dataset);
        await saveArchive();

        return res.json({
          message: 'SAR image uploaded and analyzed successfully.',
          dataset,
        });
      } catch (err: any) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: err.message || 'Failed to process SAR upload' });
      }
    }
  );

  /**
   * [MODULE 1] GET /api/sar/archive
   * List all historical SAR datasets with metadata and quality check results.
   */
  app.get('/api/sar/archive', (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || '';
      const qualityFilter = (req.query.qualityFilter as string) || 'ALL';
      const sensorFilter = (req.query.sensorFilter as string) || 'ALL';

      let filtered = [...datasetsArchive];

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.locationName.toLowerCase().includes(q) ||
            d.sensorSource.toLowerCase().includes(q) ||
            d.originalFilename.toLowerCase().includes(q)
        );
      }

      if (qualityFilter !== 'ALL') {
        filtered = filtered.filter((d) => d.qualityReport.statusLabel === qualityFilter);
      }

      if (sensorFilter !== 'ALL') {
        filtered = filtered.filter((d) => d.sensorSource === sensorFilter);
      }

      const total = filtered.length;
      const startIdx = (page - 1) * pageSize;
      const paginated = filtered.slice(startIdx, startIdx + pageSize);

      return res.json({
        datasets: paginated,
        total,
        page,
        pageSize,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * [MODULE 1] GET /api/sar/:id/quality-report
   * Detailed quality report metrics for specific SAR dataset.
   */
  app.get('/api/sar/:id/quality-report', (req, res) => {
    const dataset = datasetsArchive.find((d) => d.id === req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }
    return res.json({
      id: dataset.id,
      filename: dataset.originalFilename,
      sensorSource: dataset.sensorSource,
      qualityReport: dataset.qualityReport,
      dimensions: dataset.dimensions,
    });
  });

  // ============================================================
  // MODULE 2 API ENDPOINTS
  // ============================================================

  /**
   * [MODULE 2] POST /api/preprocess/:sar_id
   * Run PHYS-Net Preprocessing Engine (Despeckling, Normalization, Co-Registration, Patchify).
   */
  app.post('/api/preprocess/:sar_id', async (req, res) => {
    try {
      const sarId = req.params.sar_id;
      const dataset = datasetsArchive.find((d) => d.id === sarId);

      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found in archive.' });
      }

      const sarFilePath = path.join(UPLOADS_DIR, dataset.filename);
      const sarBuffer = await fs.readFile(sarFilePath);

      let opticalBuffer: Buffer | undefined;
      if (dataset.opticalFilename) {
        try {
          const opticalFilePath = path.join(UPLOADS_DIR, dataset.opticalFilename);
          opticalBuffer = await fs.readFile(opticalFilePath);
        } catch (e) {
          console.warn('Optical image missing:', e);
        }
      }

      const options: PreprocessOptions = {
        despeckleFilter: req.body.despeckleFilter || 'lee',
        windowSize: req.body.windowSize || 5,
        leeNoiseVariance: req.body.leeNoiseVariance || 0.08,
        equalizeHistogram: req.body.equalizeHistogram !== false,
        applyMinMaxNormalization: req.body.applyMinMaxNormalization !== false,
        alignOptical: req.body.alignOptical !== false,
        patchSize: req.body.patchSize || 256,
        patchOverlap: req.body.patchOverlap ?? 32,
      };

      const { preprocessingResult } = await runPHYSNetPipeline(
        sarBuffer,
        sarId,
        options,
        UPLOADS_DIR,
        opticalBuffer
      );

      // Store results
      preprocessingResultsStore[sarId] = preprocessingResult;
      await savePreprocessResults();

      // Update dataset status
      dataset.processedStatus = 'PREPROCESSED';
      dataset.lastProcessedAt = preprocessingResult.processedAt;
      await saveArchive();

      return res.json({
        message: 'PHYS-Net Preprocessing pipeline completed successfully.',
        result: preprocessingResult,
      });
    } catch (err: any) {
      console.error('Preprocessing pipeline error:', err);
      return res.status(500).json({ error: err.message || 'Preprocessing failed' });
    }
  });

  /**
   * [MODULE 2] GET /api/preprocess/:sar_id/patches
   * Get patch grid metadata and tile URLs for downstream neural network consumption.
   */
  app.get('/api/preprocess/:sar_id/patches', (req, res) => {
    const sarId = req.params.sar_id;
    const result = preprocessingResultsStore[sarId];

    if (!result) {
      return res.status(404).json({ error: 'Preprocessing result not found for this dataset. Run preprocessing first.' });
    }

    return res.json(result.patchGrid);
  });

  /**
   * [MODULE 2] GET /api/preprocess/:sar_id/result
   * Get full preprocessing result if previously calculated.
   */
  app.get('/api/preprocess/:sar_id/result', (req, res) => {
    const sarId = req.params.sar_id;
    const result = preprocessingResultsStore[sarId];

    if (!result) {
      return res.status(404).json({ error: 'No preprocessing result found.' });
    }

    return res.json(result);
  });

  /**
   * Reset & re-populate sample datasets
   */
  app.post('/api/sar/reset-samples', async (req, res) => {
    try {
      datasetsArchive = await initializeSampleDatasets(UPLOADS_DIR, async (updated) => {
        datasetsArchive = updated;
        await saveArchive();
      });
      return res.json({ message: 'Sample datasets reset successfully.', count: datasetsArchive.length });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================================
  // VITE / STATIC MIDDLEWARE SETUP
  // ============================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAR Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
