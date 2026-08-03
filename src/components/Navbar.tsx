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
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  SAR-DisasterIntel
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
                  Research Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI-Powered SAR Disaster Intelligence Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>Module 1: Upload & Check</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'archive'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Module 1: Archive</span>
            </button>

            <button
              onClick={() => setActiveTab('preprocess')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'preprocess'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Module 2: PHYS-Net Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Methodology & Paper Docs</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onResetSamples}
              disabled={isResetting}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors disabled:opacity-50"
              title="Reset sample Sentinel-1 datasets"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reload Samples'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950 px-2 py-1.5 flex justify-around text-xs">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-2 py-1.5 rounded ${activeTab === 'upload' ? 'bg-cyan-950 text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-2 py-1.5 rounded ${activeTab === 'archive' ? 'bg-amber-950 text-amber-400 font-semibold' : 'text-slate-400'}`}
        >
          Archive
        </button>
        <button
          onClick={() => setActiveTab('preprocess')}
          className={`px-2 py-1.5 rounded ${activeTab === 'preprocess' ? 'bg-emerald-950 text-emerald-400 font-semibold' : 'text-slate-400'}`}
        >
          PHYS-Net
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-2 py-1.5 rounded ${activeTab === 'docs' ? 'bg-purple-950 text-purple-400 font-semibold' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
