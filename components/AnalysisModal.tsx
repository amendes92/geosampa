import React from 'react';
import { GeminiAnalysis } from '../types';
import { X, Lightbulb, Zap, Database } from 'lucide-react';

interface AnalysisModalProps {
  analysis: GeminiAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysis, isOpen, onClose, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400" />
            AI Schema Analysis
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="text-slate-400 animate-pulse">Consulting Gemini for GIS optimization...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                  <Database size={14} /> Data Context
                </h3>
                <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded border border-slate-800">
                  {analysis.summary}
                </p>
              </div>

              <div className="space-y-3">
                 <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                  <Zap size={14} /> Optimization Strategy
                </h3>
                <div className="grid gap-3">
                  {analysis.optimizationTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-12 text-slate-500">
               No analysis data available.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;