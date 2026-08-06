/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Cpu,
  MapPin,
  Calendar,
  Satellite,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SARDatasetMetadata } from '../types';

interface Module1ArchiveProps {
  onSelectDatasetForPreprocess: (sarId: string) => void;
}

export const Module1Archive: React.FC<Module1ArchiveProps> = ({
  onSelectDatasetForPreprocess,
}) => {
  const [datasets, setDatasets] = useState<SARDatasetMetadata[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDataset, setSelectedDataset] = useState<SARDatasetMetadata | null>(null);

  const fetchArchive = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        qualityFilter,
        sensorFilter,
      });
      const response = await fetch(`/api/sar/archive?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch archive:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [page, search, qualityFilter, sensorFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-red-900/30 rounded-xl p-6 shadow-md shadow-red-950/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/80 font-bold">
                MODULE 1 ARCHIVE
              </span>
              <h1 className="text-xl font-bold text-slate-100">
                Historical SAR & Optical Archive
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Archived paired C-Band / X-Band SAR imagery and optical reference datasets for disaster training and benchmarking.
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-red-900/30">
            <span className="text-red-400 font-bold">{total}</span> Datasets Stored
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search location or sensor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-3 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Quality:</span>
            <select
              value={qualityFilter}
              onChange={(e) => {
                setQualityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
            >
              <option value="ALL">All Quality</option>
              <option value="PASSED">Passed Only</option>
              <option value="WARNING">Warning</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Sensor:</span>
            <select
              value={sensorFilter}
              onChange={(e) => {
                setSensorFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
            >
              <option value="ALL">All Sensors</option>
              <option value="Sentinel-1A">Sentinel-1A</option>
              <option value="Sentinel-1B">Sentinel-1B</option>
              <option value="PAZ">PAZ</option>
              <option value="TerraSAR-X">TerraSAR-X</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading SAR dataset archive...
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No datasets found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Dataset & Thumbnails</th>
                  <th className="py-3 px-4">Disaster Location</th>
                  <th className="py-3 px-4">Sensor / Pol</th>
                  <th className="py-3 px-4">Acquisition Date</th>
                  <th className="py-3 px-4">Quality Status</th>
                  <th className="py-3 px-4">PHYS-Net Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Thumbnails */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <img
                            src={d.sarImageUrl}
                            alt="SAR"
                            className="w-12 h-12 object-cover rounded border border-red-900/40 bg-black"
                          />
                          <span className="absolute bottom-0 right-0 text-[9px] bg-red-950 text-red-300 px-1 font-mono rounded-tl border-t border-l border-red-800/60">
                            SAR
                          </span>
                        </div>
                        {d.opticalImageUrl ? (
                          <div className="relative group">
                            <img
                              src={d.opticalImageUrl}
                              alt="Optical"
                              className="w-12 h-12 object-cover rounded border border-rose-900/40 bg-black"
                            />
                            <span className="absolute bottom-0 right-0 text-[9px] bg-rose-950 text-rose-300 px-1 font-mono rounded-tl border-t border-l border-rose-800/60">
                              OPT
                            </span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded border border-slate-800 bg-slate-950 flex items-center justify-center text-[10px] text-slate-600">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-mono font-medium text-slate-200">{d.id}</p>
                          <p className="text-[10px] text-slate-500">{d.dimensions.width}x{d.dimensions.height} px</p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-200">{d.locationName}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            [{d.boundingBox.latMin}, {d.boundingBox.lngMin}]
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Sensor */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-red-950 text-red-300 border border-red-800/80">
                        {d.sensorSource} ({d.polarization})
                      </span>
                    </td>

                    {/* Acquisition Date */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {d.acquisitionDate.replace('T', ' ').replace('Z', '')}
                    </td>

                    {/* Quality Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                          d.qualityReport.statusLabel === 'PASSED'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : d.qualityReport.statusLabel === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {d.qualityReport.statusLabel === 'PASSED' && <CheckCircle2 className="w-3 h-3 text-red-400" />}
                        {d.qualityReport.statusLabel === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                        {d.qualityReport.statusLabel === 'FAILED' && <XCircle className="w-3 h-3" />}
                        <span>{d.qualityReport.statusLabel} ({d.qualityReport.score})</span>
                      </span>
                    </td>

                    {/* PHYS-Net Status */}
                    <td className="py-3 px-4">
                      {d.processedStatus === 'PREPROCESSED' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-800/80">
                          <Cpu className="w-3 h-3" />
                          <span>Preprocessed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-500 border border-slate-800">
                          <span>Raw Unprocessed</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedDataset(d)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3 text-red-400" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => onSelectDatasetForPreprocess(d.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] flex items-center space-x-1 font-semibold shadow-sm shadow-red-950"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>Process</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > pageSize && (
          <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-200">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-200">{Math.min(page * pageSize, total)}</span> of{' '}
              <span className="font-bold text-slate-200">{total}</span> datasets
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page}</span>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Detail Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900/40 rounded-xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-red-400 font-bold">{selectedDataset.id}</span>
                <h2 className="text-lg font-bold text-slate-100">{selectedDataset.locationName}</h2>
              </div>
              <button
                onClick={() => setSelectedDataset(null)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-xs font-mono text-red-400 block mb-2 font-bold">RAW SAR IMAGE</span>
                <img
                  src={selectedDataset.sarImageUrl}
                  alt="SAR"
                  className="h-48 mx-auto rounded object-cover border border-red-900/30"
                />
              </div>
              {selectedDataset.opticalImageUrl ? (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-xs font-mono text-rose-400 block mb-2 font-bold">OPTICAL REFERENCE</span>
                  <img
                    src={selectedDataset.opticalImageUrl}
                    alt="Optical"
                    className="h-48 mx-auto rounded object-cover border border-rose-900/30"
                  />
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  No Optical Pair
                </div>
              )}
            </div>

            {/* Metadata breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Sensor & Polarization</span>
                <span className="text-slate-200 font-bold">{selectedDataset.sensorSource} ({selectedDataset.polarization})</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Image Dimensions</span>
                <span className="text-slate-200 font-bold">{selectedDataset.dimensions.width} x {selectedDataset.dimensions.height}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Acquisition Time</span>
                <span className="text-slate-200 font-bold">{selectedDataset.acquisitionDate.split('T')[0]}</span>
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-red-400/90 uppercase tracking-wider">Quality Audit Log</h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {selectedDataset.qualityReport.reasons.map((r, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedDataset(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedDataset.id;
                  setSelectedDataset(null);
                  onSelectDatasetForPreprocess(id);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-red-950/40"
              >
                <Cpu className="w-4 h-4" />
                <span>Send to PHYS-Net Preprocessing Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
