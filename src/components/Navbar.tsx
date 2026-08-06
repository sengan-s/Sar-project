/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Cpu, Database, FileText, RotateCcw, Satellite } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'archive' | 'preprocess' | 'docs';
  setActiveTab: (tab: 'upload' | 'archive' | 'preprocess' | 'docs') => void;
  onResetSamples: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetSamples,
  isResetting,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-red-900/40 text-slate-100 sticky top-0 z-40 shadow-xl shadow-red-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/15 border border-red-500/40 rounded-xl text-red-500 shadow-sm shadow-red-600/20">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-red-500 via-rose-400 to-amber-500 bg-clip-text text-transparent">
                  SAR-DisasterIntel
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 uppercase font-semibold">
                  Red Alert Ops
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI-Powered SAR Disaster Intelligence Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1.5">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-red-950/70 text-red-400 border border-red-700/60 shadow-sm shadow-red-950'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Satellite className={`w-4 h-4 ${activeTab === 'upload' ? 'text-red-400' : 'text-slate-400'}`} />
              <span>Module 1: Upload & Check</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-red-950/70 text-red-400 border border-red-700/60 shadow-sm shadow-red-950'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Database className={`w-4 h-4 ${activeTab === 'archive' ? 'text-red-400' : 'text-slate-400'}`} />
              <span>Module 1: Archive</span>
            </button>

            <button
              onClick={() => setActiveTab('preprocess')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preprocess'
                  ? 'bg-red-950/70 text-red-400 border border-red-700/60 shadow-sm shadow-red-950'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === 'preprocess' ? 'text-red-400' : 'text-slate-400'}`} />
              <span>Module 2: PHYS-Net Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-red-950/70 text-red-400 border border-red-700/60 shadow-sm shadow-red-950'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'docs' ? 'text-red-400' : 'text-slate-400'}`} />
              <span>Methodology & Paper Docs</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onResetSamples}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 hover:border-red-600/60 rounded-lg transition-all disabled:opacity-50"
              title="Reset sample Sentinel-1 datasets"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-red-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reload Samples'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950 px-2 py-1.5 flex justify-around text-xs">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-2 py-1.5 rounded ${activeTab === 'upload' ? 'bg-red-950 text-red-400 font-semibold border border-red-800/50' : 'text-slate-400'}`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-2 py-1.5 rounded ${activeTab === 'archive' ? 'bg-red-950 text-red-400 font-semibold border border-red-800/50' : 'text-slate-400'}`}
        >
          Archive
        </button>
        <button
          onClick={() => setActiveTab('preprocess')}
          className={`px-2 py-1.5 rounded ${activeTab === 'preprocess' ? 'bg-red-950 text-red-400 font-semibold border border-red-800/50' : 'text-slate-400'}`}
        >
          PHYS-Net
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-2 py-1.5 rounded ${activeTab === 'docs' ? 'bg-red-950 text-red-400 font-semibold border border-red-800/50' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
