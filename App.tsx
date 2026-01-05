import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_LAYERS, INITIAL_LOGS } from './constants';
import { IngestionJob, JobStatus, LogEntry, GeminiAnalysis, ErrorDiagnosis, ModalMode } from './types';
import JobCard from './components/JobCard';
import Terminal from './components/Terminal';
import AnalysisModal from './components/AnalysisModal';
import { analyzeLayerMetadata, diagnosePipelineError } from './services/geminiService';
import { Activity, Layers, Terminal as TerminalIcon, Settings, Cpu } from 'lucide-react';

const BATCH_SIZE = 1000;
const TICK_RATE = 1000; // 1 second update loop

const App: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>(() => 
    MOCK_LAYERS.map(layer => ({
      id: layer.id,
      layer,
      status: JobStatus.IDLE,
      processedCount: 0,
      totalCount: layer.estimatedCount,
      currentBatch: 0,
      currentSpeed: 0,
      errors: 0
    }))
  );

  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  
  // Analysis Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('OPTIMIZATION');
  const [currentAnalysis, setCurrentAnalysis] = useState<GeminiAnalysis | ErrorDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message
    };
    setLogs(prev => [...prev.slice(-199), newLog]); // Keep last 200 logs
  }, []);

  // Simulator for Python Backend Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.status !== JobStatus.RUNNING && job.status !== JobStatus.RETRYING) {
            return { ...job, currentSpeed: 0 };
          }

          // Random error simulation
          if (job.status === JobStatus.RUNNING && Math.random() > 0.98) {
             addLog(`[Tenacity] Connection timeout for ${job.layer.name} (Batch ${job.currentBatch}). Retrying...`, 'ERROR');
             return { ...job, status: JobStatus.RETRYING, currentSpeed: 0 }; // Speed drops to 0 on error
          }

          if (job.status === JobStatus.RETRYING) {
            if (Math.random() > 0.4) {
               addLog(`[Tenacity] Retry successful for ${job.layer.name}. Resuming...`, 'INFO');
               return { ...job, status: JobStatus.RUNNING };
            }
            return job; 
          }

          // Process Batch & Calculate Speed
          const batchSize = Math.floor(Math.random() * 800) + 200; // Random batch size 200-1000
          const newProcessed = Math.min(job.totalCount, job.processedCount + batchSize);
          
          if (newProcessed % (BATCH_SIZE * 5) < batchSize) {
             addLog(`[WFS 2.0.0] Ingested ${batchSize} features for ${job.layer.name}.`, 'DEBUG');
          }

          if (newProcessed >= job.totalCount) {
             addLog(`[Pipeline] Job completed for ${job.layer.name}. Total: ${job.totalCount}`, 'INFO');
             return { ...job, status: JobStatus.COMPLETED, processedCount: job.totalCount, currentSpeed: 0 };
          }

          return { 
            ...job, 
            processedCount: newProcessed, 
            currentBatch: job.currentBatch + 1,
            currentSpeed: batchSize // Simplified: batchSize per tick (1s) = features/sec
          };
        });
      });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [addLog]);

  const toggleJob = (id: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== id) return job;
      const newStatus = job.status === JobStatus.RUNNING ? JobStatus.IDLE : JobStatus.RUNNING;
      addLog(`[User] ${newStatus === JobStatus.RUNNING ? 'Started' : 'Paused'} ingestion for ${job.layer.name}`, 'INFO');
      return { ...job, status: newStatus };
    }));
  };

  const handleAnalyze = async (job: IngestionJob, mode: ModalMode) => {
    setActiveJobId(job.id);
    setModalMode(mode);
    setIsModalOpen(true);
    setCurrentAnalysis(null);
    
    // Only auto-trigger analysis if it's Optimization or Diagnosis. SQL waits for user input.
    if (mode === 'SQL') return;

    setIsAnalyzing(true);
    try {
      if (mode === 'OPTIMIZATION') {
        addLog(`[Gemini] Starting schema optimization analysis for ${job.layer.name}...`, 'INFO');
        const result = await analyzeLayerMetadata(job.layer);
        setCurrentAnalysis(result);
      } else if (mode === 'DIAGNOSIS') {
        addLog(`[Gemini] Diagnosing logs for ${job.layer.name}...`, 'WARN');
        const result = await diagnosePipelineError(job.layer, logs);
        setCurrentAnalysis(result);
      }
    } catch (e) {
      addLog(`[Gemini] Analysis failed for ${job.layer.name}.`, 'ERROR');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle switching tabs inside the modal
  const handleModalModeChange = (newMode: ModalMode) => {
    const job = jobs.find(j => j.id === activeJobId);
    if (job) {
      handleAnalyze(job, newMode);
    } else {
      setModalMode(newMode); // Fallback
    }
  };

  const activeJob = jobs.find(j => j.id === activeJobId) || null;

  return (
    <div className="min-h-screen flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
            <Cpu className="text-indigo-400" />
            ETL Commander
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">v2.5.0 (AI-Enhanced)</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="bg-indigo-500/10 text-indigo-400 px-4 py-3 rounded-lg flex items-center gap-3 border border-indigo-500/20 font-medium cursor-pointer">
            <Activity size={18} /> Dashboard
          </div>
          <div className="text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer">
            <Layers size={18} /> Layers Config
          </div>
          <div className="text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer">
            <TerminalIcon size={18} /> System Logs
          </div>
           <div className="text-slate-400 hover:bg-slate-900 hover:text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors cursor-pointer">
            <Settings size={18} /> Connection Settings
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="text-xs text-slate-500 font-mono mb-2">CONN STATUS</div>
           <div className="flex items-center gap-2 text-green-400 text-sm">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             WFS: Connected
           </div>
           <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             DB: 127.0.0.1:5432
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ingestion Pipeline Status</h2>
              <p className="text-slate-400">Monitoring async Python workers and WFS streams.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-white">
                  {(jobs.reduce((acc, curr) => acc + curr.processedCount, 0) / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Total Features</div>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-2xl font-mono font-bold text-indigo-400">
                  {jobs.filter(j => j.status === JobStatus.RUNNING).length}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Active Workers</div>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onToggle={toggleJob}
                onAnalyze={handleAnalyze} 
              />
            ))}
          </div>

          {/* Logs */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TerminalIcon size={16} /> Live Kernel Logs
            </h3>
            <Terminal logs={logs} />
          </div>

        </div>
      </main>

      <AnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysisData={currentAnalysis}
        isLoading={isAnalyzing}
        mode={modalMode}
        setMode={handleModalModeChange}
        layer={activeJob ? activeJob.layer : null}
      />
    </div>
  );
};

export default App;