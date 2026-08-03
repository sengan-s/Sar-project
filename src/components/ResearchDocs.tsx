/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Satellite,
  Cpu,
  Layers,
  Grid,
  ShieldCheck,
  Code,
  BookOpen,
} from 'lucide-react';

export const ResearchDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-300 text-sm">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-bold text-slate-100">
            Research Paper Implementation Methodology
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Technical specifications, mathematical formulations, and explicit statement of real vs. prototype-approximated components for project presentation and research documentation.
        </p>
      </div>

      {/* Module Mapping Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1 Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-base">Module 1: Data Acquisition Layer</h2>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Multi-Source SAR Ingestion:</strong> Ingests raw C-Band (Sentinel-1) and X-Band (PAZ, TerraSAR-X) single/dual-polarization imagery along with optical references.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Automated Quality Audit:</strong> Evaluates contrast standard deviation ($\sigma \ge 15$), dynamic range, and blur/noise via 3x3 Laplacian variance matrix convolution.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Historical Archive Indexing:</strong> Stores paired dataset metadata, bounding box coordinates, and diagnostic logs in JSON archive store.
              </span>
            </li>
          </ul>
        </div>

        {/* Module 2 Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-slate-100 text-base">Module 2: PHYS-Net Engine</h2>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Adaptive Lee Despeckling:</strong> Reduces multiplicative speckle noise while preserving high-reflectivity corner scatterers using local window statistics ($W_k$).
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Histogram Equalization:</strong> Equalizes cumulative intensity distribution across $0-255$ spectrum for enhanced flood/burn visibility.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>256x256 Patchification:</strong> Extracts fixed tile grid with configurable overlap stride for direct tensor consumption by Module 3 deep neural network.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Real vs Prototype Statement Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Statement of Real Image-Processing vs. Prototype Approximations</span>
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          For transparency in academic reporting and college project evaluation, the table below outlines which algorithmic components are fully executed in real time versus approximated for prototype speed:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Implementation Status</th>
                <th className="p-3">Methodology & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-bold text-cyan-400">Adaptive Lee Despeckle Filter</td>
                <td className="p-3">
                  <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    REAL & WORKING
                  </span>
                </td>
                <td className="p-3">
                  Calculates local mean mean(I), local variance Var(I), and noise factor sigma_v^2 across 3x3/5x5 windows to smooth speckle adaptively.
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-cyan-400">Histogram Equalization</td>
                <td className="p-3">
                  <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    REAL & WORKING
                  </span>
                </td>
                <td className="p-3">
                  Computes 256-bin histogram CDF and redistributes pixel intensity dynamic range.
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-cyan-400">Quality Check (Laplacian Var)</td>
                <td className="p-3">
                  <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    REAL & WORKING
                  </span>
                </td>
                <td className="p-3">
                  Convolves 3x3 Laplacian edge matrix over pixels to detect blur and measure contrast.
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-cyan-400">256x256 Patchify Grid Generator</td>
                <td className="p-3">
                  <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    REAL & WORKING
                  </span>
                </td>
                <td className="p-3">
                  Extracts physical tile files, calculates tile mean/stdDev, and outputs JSON tensor manifest.
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-amber-400">Co-Registration / Alignment</td>
                <td className="p-3">
                  <span className="bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800">
                    APPROXIMATED PROTOTYPE
                  </span>
                </td>
                <td className="p-3">
                  Executes fast spatial scaling and affine shift ($s_x, s_y, \theta, t_x, t_y$) simulating full ORB feature matching and RANSAC homography.
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold text-amber-400">Module 3 Deep Learning Core</td>
                <td className="p-3">
                  <span className="bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-800">
                    OUT OF SCOPE
                  </span>
                </td>
                <td className="p-3">
                  Module 3 (Neural Network Segmentation/Classification) consumes the patch matrix produced by Module 2.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippet Mapping Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Code className="w-5 h-5 text-cyan-400" />
          <span>Codebase Architecture Mapping</span>
        </h2>

        <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="text-cyan-400 font-bold">// Backend Image Processing Pipeline (server/sar_engine.ts)</div>
          <div>• Module 1: extractImageMetadata() & performQualityCheck()</div>
          <div>• Module 2: applyLeeDespeckleFilter() & applyHistogramEqualization()</div>
          <div>• Module 2: alignOpticalToSar() & createPatchGrid()</div>
          <div className="pt-2 text-emerald-400 font-bold">// Frontend React Component Hierarchy (src/components/)</div>
          <div>• Module 1 UI: Module1Upload.tsx (Ingestion & Quality Audit)</div>
          <div>• Module 1 Archive UI: Module1Archive.tsx (Historical Dataset Index)</div>
          <div>• Module 2 UI: Module2Preprocessing.tsx (PHYS-Net Interactive Dashboard)</div>
        </div>
      </div>
    </div>
  );
};
