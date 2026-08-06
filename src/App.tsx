/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Module1Upload } from './components/Module1Upload';
import { Module1Archive } from './components/Module1Archive';
import { Module2Preprocessing } from './components/Module2Preprocessing';
import { ResearchDocs } from './components/ResearchDocs';
import { SARDatasetMetadata } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'archive' | 'preprocess' | 'docs'>('preprocess');
  const [selectedSarId, setSelectedSarId] = useState<string | null>('sar_dataset_001');
  const [isResetting, setIsResetting] = useState(false);

  const handleUploadSuccess = (dataset: SARDatasetMetadata) => {
    setSelectedSarId(dataset.id);
  };

  const handleNavigateToPreprocess = (sarId: string) => {
    setSelectedSarId(sarId);
    setActiveTab('preprocess');
  };

  const handleResetSamples = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/sar/reset-samples', { method: 'POST' });
      if (res.ok) {
        setSelectedSarId('sar_dataset_001');
        window.location.reload();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetSamples={handleResetSamples}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'upload' && (
          <Module1Upload
            onUploadSuccess={handleUploadSuccess}
            onNavigateToPreprocess={handleNavigateToPreprocess}
          />
        )}

        {activeTab === 'archive' && (
          <Module1Archive
            onSelectDatasetForPreprocess={handleNavigateToPreprocess}
          />
        )}

        {activeTab === 'preprocess' && (
          <Module2Preprocessing
            selectedSarId={selectedSarId}
            onSelectSarIdChange={setSelectedSarId}
          />
        )}

        {activeTab === 'docs' && <ResearchDocs />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-red-950/80 py-4 px-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>AI-Powered SAR Disaster Intelligence Platform &bull; Red Alert Disaster Intelligence</span>
          </div>
          <div className="text-red-400/80">
            Module 1: Ingestion & Quality Audit | Module 2: PHYS-Net Preprocessing Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
