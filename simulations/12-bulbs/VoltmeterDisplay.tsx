
import React from 'react';

interface Props {
  reading: number;
}

const VoltmeterDisplay: React.FC<Props> = ({ reading }) => {
  const isNegative = reading < -0.05;
  const absReading = Math.abs(reading);
  
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border-2 border-slate-700/50 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] min-w-[180px] backdrop-blur-xl z-20 pointer-events-none border-indigo-500/30">
      <div className="text-slate-500 text-[9px] font-black uppercase mb-3 tracking-[0.25em] flex items-center justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isNegative ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
        DIGITAL VOLTMETER
      </div>
      
      <div className="bg-black/90 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
        {/* Subtle Scanline Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] z-0 bg-[length:100%_4px] pointer-events-none opacity-20" />
        
        <div className="relative z-10 flex items-baseline">
          <span className={`text-4xl md:text-5xl font-mono ${isNegative ? 'text-amber-400' : 'text-emerald-400'} font-bold tabular-nums tracking-tighter`}>
            {reading.toFixed(1)}
          </span>
          <span className={`text-sm font-black ${isNegative ? 'text-amber-600' : 'text-emerald-600'} ml-2 self-end mb-1.5`}>V</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">
          <span>0V</span>
          <span>120V</span>
          <span>240V</span>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1.5px]">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${isNegative ? 'from-amber-600 to-amber-400' : 'from-emerald-600 to-emerald-400'} transition-all duration-500 ease-out`} 
            style={{ width: `${Math.min((absReading / 240) * 100, 100)}%` }} 
          />
        </div>
        {isNegative && (
          <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.15em] text-center mt-1 animate-pulse">Polarity Inverted</p>
        )}
      </div>
    </div>
  );
};

export default VoltmeterDisplay;
