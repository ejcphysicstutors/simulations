
import React from 'react';
import { CircuitComponent, ComponentType } from '../types';

interface Props {
  components: CircuitComponent[];
  onToggleSwitch: () => void;
  onReset: () => void;
  activeProbe: 'positive' | 'negative';
  setActiveProbe: (probe: 'positive' | 'negative') => void;
  analysis: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  colorCodeEnabled: boolean;
  setColorCodeEnabled: (enabled: boolean) => void;
}

const ControlPanel: React.FC<Props> = ({ 
  components, onToggleSwitch, onReset,
  activeProbe, setActiveProbe, analysis, onAnalyze, isAnalyzing,
  colorCodeEnabled, setColorCodeEnabled
}) => {
  const switchComp = components.find(c => c.type === ComponentType.SWITCH);
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:px-6 md:py-5 flex flex-col md:flex-row items-stretch gap-6">
      
      {/* Master Switches & Toggles */}
      <div className="flex flex-col gap-3 min-w-[200px] justify-center">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Master Controls</div>
        <button
          onClick={onToggleSwitch}
          className={`w-full py-3 rounded-xl font-black transition-all border-2 text-xs shadow-lg flex items-center justify-center gap-3 ${
            switchComp?.isOpen
              ? 'bg-slate-900 text-slate-500 border-slate-800'
              : 'bg-emerald-600 text-white border-emerald-400'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${switchComp?.isOpen ? 'bg-slate-700' : 'bg-emerald-300 animate-pulse'}`} />
          {switchComp?.isOpen ? 'CIRCUIT OPEN' : 'CIRCUIT ACTIVE'}
        </button>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black text-white tracking-tight uppercase">Colour Code</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={colorCodeEnabled}
              onChange={(e) => setColorCodeEnabled(e.target.checked)}
            />
            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Probe Selection */}
      <div className="flex flex-col gap-3 min-w-[180px] justify-center">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Meter Probes</div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveProbe('positive')}
            className={`flex-1 py-2.5 rounded-lg font-bold border-2 text-[10px] tracking-tight transition-all ${
              activeProbe === 'positive' ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            ACTIVE: V+ PROBE
          </button>
          <button
            onClick={() => setActiveProbe('negative')}
            className={`flex-1 py-2.5 rounded-lg font-bold border-2 text-[10px] tracking-tight transition-all ${
              activeProbe === 'negative' ? 'bg-blue-950/40 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            ACTIVE: V- PROBE
          </button>
        </div>
      </div>

      {/* AI Analysis and Status Area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 flex justify-between items-center">
          <span>AI Lab Assistant</span>
          {analysis && <button onClick={onReset} className="text-slate-500 hover:text-slate-300 transition-colors">Clear Simulation</button>}
        </div>
        <div className="flex-1 bg-black/40 rounded-xl border border-slate-800 p-3 overflow-y-auto max-h-[80px] md:max-h-none scrollbar-hide">
          {analysis ? (
            <p className="text-[10px] leading-relaxed text-slate-300 font-medium">
              <span className="text-indigo-400 font-bold uppercase mr-1.5">Note:</span>
              {analysis}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 italic flex items-center h-full justify-center">Select "AI Lab Assistant" for circuit analysis...</p>
          )}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-col gap-2 justify-center min-w-[140px]">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-950/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Circuit'}
        </button>
        <button onClick={onReset} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">
          Reset Bench
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
