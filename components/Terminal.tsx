import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { Search, Filter } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [filterText, setFilterText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

  // Auto-scroll only if at bottom or new logs arrive (simplified for this demo to always scroll)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, filterText, filterLevel]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesText = log.message.toLowerCase().includes(filterText.toLowerCase());
      const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
      return matchesText && matchesLevel;
    });
  }, [logs, filterText, filterLevel]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg flex flex-col shadow-2xl overflow-hidden h-96">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
          <span className="ml-2 text-slate-500 font-mono text-xs hidden sm:inline">pipeline_logs.log</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Level Filter */}
          <div className="flex bg-slate-900 rounded-md border border-slate-800 p-0.5">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                  filterLevel === level 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search size={12} className="absolute left-2 top-1.5 text-slate-500 group-focus-within:text-indigo-400" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-32 sm:w-48 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 pl-7 pr-2 py-1 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Logs Content */}
      <div className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-1 font-mono text-xs">
        {filteredLogs.length === 0 && (
          <div className="text-slate-600 italic text-center mt-10">No logs match your filter.</div>
        )}
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-600 shrink-0 select-none">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]
            </span>
            <span className={`font-bold shrink-0 w-14 ${
              log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'WARN' ? 'text-yellow-400' :
              log.level === 'ERROR' ? 'text-red-500' : 'text-gray-400'
            }`}>
              {log.level}
            </span>
            <span className={`${
              log.level === 'ERROR' ? 'text-red-200' : 'text-slate-300'
            } break-all hover:bg-slate-800/50 px-1 rounded`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;