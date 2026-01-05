import React, { useState, useEffect } from 'react';
import { GeminiAnalysis, ErrorDiagnosis, ModalMode, LayerConfig } from '../types';
import { X, Lightbulb, Zap, Database, Terminal, Bug, Copy, PlayCircle } from 'lucide-react';
import { generatePostGISQuery } from '../services/geminiService';

interface AnalysisModalProps {
  layer: LayerConfig | null;
  mode: ModalMode;
  analysisData: GeminiAnalysis | ErrorDiagnosis | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  setMode: (mode: ModalMode) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  layer, mode, analysisData, isOpen, onClose, isLoading, setMode 
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [generatedSql, setGeneratedSql] = useState('');
  const [isGeneratingSql, setIsGeneratingSql] = useState(false);

  // Reset local state when opening
  useEffect(() => {
    if (isOpen) {
      setGeneratedSql('');
      setUserQuery('');
    }
  }, [isOpen]);

  const handleGenerateSql = async () => {
    if (!layer || !userQuery) return;
    setIsGeneratingSql(true);
    const sql = await generatePostGISQuery(layer, userQuery);
    setGeneratedSql(sql);
    setIsGeneratingSql(false);
  };

  if (!isOpen || !layer) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="text-indigo-400" size={20} />
              AI Assistant: <span className="font-mono text-indigo-300">{layer.name}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 shrink-0">
          <button 
            onClick={() => setMode('OPTIMIZATION')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              mode === 'OPTIMIZATION' ? 'border-indigo-500 text-white bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Lightbulb size={16} /> Optimization
          </button>
          <button 
            onClick={() => setMode('SQL')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              mode === 'SQL' ? 'border-indigo-500 text-white bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Terminal size={16} /> SQL Assistant
          </button>
          <button 
            onClick={() => setMode('DIAGNOSIS')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              mode === 'DIAGNOSIS' ? 'border-red-500 text-red-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Bug size={16} /> Error Diagnosis
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <p className="text-slate-400 animate-pulse text-sm">Consulting Gemini...</p>
            </div>
          ) : (
            <>
              {/* --- OPTIMIZATION TAB --- */}
              {mode === 'OPTIMIZATION' && (
                analysisData && 'summary' in analysisData ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Data Context</h3>
                      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-4 rounded border border-slate-800">
                        {analysisData.summary}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" /> Strategies
                      </h3>
                      <div className="grid gap-3">
                        {analysisData.optimizationTips.map((tip, idx) => (
                          <div key={idx} className="flex gap-3 bg-slate-800/50 p-3 rounded border border-slate-700/50">
                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : <div className="text-slate-500 text-center">No optimization data loaded.</div>
              )}

              {/* --- SQL ASSISTANT TAB --- */}
              {mode === 'SQL' && (
                <div className="space-y-4 h-full flex flex-col">
                  <div>
                    <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Describe your query</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="e.g., Calculate total area of lots in zone ZM-1"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateSql()}
                      />
                      <button 
                        onClick={handleGenerateSql}
                        disabled={!userQuery || isGeneratingSql}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingSql ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <PlayCircle size={16} />}
                        Generate
                      </button>
                    </div>
                  </div>

                  {generatedSql && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-xs uppercase text-slate-500 font-bold">Generated PostGIS SQL</label>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto flex-1 relative group">
                        <pre className="whitespace-pre-wrap">{generatedSql}</pre>
                      </div>
                    </div>
                  )}
                  
                  {!generatedSql && !isGeneratingSql && (
                    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                      Ask a question to generate SQL for {layer.id}
                    </div>
                  )}
                </div>
              )}

              {/* --- DIAGNOSIS TAB --- */}
              {mode === 'DIAGNOSIS' && (
                 analysisData && 'errorType' in analysisData ? (
                  <div className="space-y-6">
                     <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-4 items-start">
                        <div className="bg-red-500/20 p-2 rounded-full shrink-0">
                          <Bug className="text-red-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-red-400 font-bold text-lg">{analysisData.errorType}</h3>
                          <p className="text-slate-300 text-sm mt-1">{analysisData.explanation}</p>
                        </div>
                     </div>

                     <div className="space-y-2">
                       <h3 className="text-xs uppercase tracking-wider text-green-400 font-bold">Suggested Fix</h3>
                       <div className="bg-slate-950 border border-green-900/30 rounded-lg p-4 font-mono text-sm text-green-300 shadow-inner">
                         {analysisData.suggestedFix}
                       </div>
                     </div>
                     
                     <div className="text-xs text-slate-500 text-center">
                        Based on analysis of recent system logs.
                     </div>
                  </div>
                 ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className="text-slate-500">No active diagnosis found.</div>
                      <button 
                        onClick={() => {/* Trigger analysis logic in parent if needed */}}
                        className="text-indigo-400 text-sm hover:underline"
                      >
                        Run diagnosis on current logs
                      </button>
                    </div>
                 )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;