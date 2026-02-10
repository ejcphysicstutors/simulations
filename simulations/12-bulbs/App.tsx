
import React, { useState, useMemo, useCallback } from 'react';
import { ComponentType, CircuitComponent, ProbeState } from './types';
import CircuitBoard from './components/CircuitBoard';
import VoltmeterDisplay from './components/VoltmeterDisplay';
import ControlPanel from './components/ControlPanel';
import { GoogleGenAI } from "@google/genai";

const VOLTAGE_SUPPLY = 240;
const BULB_RESISTANCE = 20; 
const WIRE_RESISTANCE = 0; 

const createInitialComponents = (): CircuitComponent[] => {
  const functional: Omit<CircuitComponent, 'id'>[] = [
    { type: ComponentType.SOURCE, resistance: 0, isDamaged: false, label: '240V Supply' },
    ...Array.from({ length: 12 }, (_, i) => ({
      type: ComponentType.BULB,
      resistance: BULB_RESISTANCE,
      isDamaged: false,
      label: `Bulb ${i + 1}`
    })),
    { type: ComponentType.SWITCH, resistance: 0, isDamaged: false, isOpen: false, label: 'Main Switch' }
  ];

  const interleaved: CircuitComponent[] = [];
  functional.forEach((comp, i) => {
    interleaved.push({ ...comp, id: `comp-${i}` });
    interleaved.push({
      id: `wire-${i}`,
      type: ComponentType.WIRE,
      resistance: WIRE_RESISTANCE,
      isDamaged: false,
      label: `Wire Segment ${i + 1}`
    });
  });
  return interleaved;
};

const INITIAL_COMPONENTS = createInitialComponents();
const INITIAL_POS_PROBE = { nodeId: 1, color: '#ef4444', label: 'V+' };
const INITIAL_NEG_PROBE = { nodeId: 0, color: '#3b82f6', label: 'V-' };

const App: React.FC = () => {
  const [components, setComponents] = useState<CircuitComponent[]>(INITIAL_COMPONENTS);
  const [positiveProbe, setPositiveProbe] = useState<ProbeState>(INITIAL_POS_PROBE);
  const [negativeProbe, setNegativeProbe] = useState<ProbeState>(INITIAL_NEG_PROBE);
  const [activeProbe, setActiveProbe] = useState<'positive' | 'negative'>('positive');
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorCodeEnabled, setColorCodeEnabled] = useState(false);

  const circuitState = useMemo(() => {
    const firstBreakIndex = components.findIndex(c => c.isDamaged || (c.type === ComponentType.SWITCH && c.isOpen));
    const isCircuitBroken = firstBreakIndex !== -1;
    const totalResistance = components.reduce((acc, c) => acc + (c.isDamaged ? 0 : c.resistance), 0);
    const current = isCircuitBroken ? 0 : (totalResistance > 0 ? VOLTAGE_SUPPLY / totalResistance : 0);
    const nodePotentials: (number | null)[] = new Array(components.length).fill(null);
    
    const isSourceDamaged = components[0].isDamaged;
    const vSource = isSourceDamaged ? 0 : VOLTAGE_SUPPLY;

    nodePotentials[0] = 0;
    nodePotentials[1] = vSource;

    if (isCircuitBroken) {
      for (let i = 1; i < components.length; i++) {
        const comp = components[i];
        if (comp.isDamaged || (comp.type === ComponentType.SWITCH && comp.isOpen)) break;
        const nextNodeIndex = (i + 1) % components.length;
        if (nextNodeIndex === 0) break;
        nodePotentials[nextNodeIndex] = vSource;
      }
      for (let i = components.length - 1; i >= 1; i--) {
        const comp = components[i];
        if (comp.isDamaged || (comp.type === ComponentType.SWITCH && comp.isOpen)) break;
        nodePotentials[i] = 0;
      }
    } else {
      let currentV = vSource;
      for (let i = 1; i < components.length; i++) {
        const comp = components[i];
        currentV -= (current * comp.resistance);
        const nextNodeIndex = (i + 1) % components.length;
        if (nextNodeIndex === 0) continue;
        nodePotentials[nextNodeIndex] = Math.max(0, currentV);
      }
    }

    return { isCircuitBroken, current, nodePotentials };
  }, [components]);

  const toggleDamage = useCallback((id: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, isDamaged: !c.isDamaged } : c));
  }, []);

  const toggleSwitch = useCallback(() => {
    setComponents(prev => prev.map(c => c.type === ComponentType.SWITCH ? { ...c, isOpen: !c.isOpen } : c));
  }, []);

  const resetSimulation = useCallback(() => {
    setComponents(createInitialComponents());
    setPositiveProbe(INITIAL_POS_PROBE);
    setNegativeProbe(INITIAL_NEG_PROBE);
    setActiveProbe('positive');
    setAnalysis("");
    setColorCodeEnabled(false);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const damaged = components.filter(c => c.isDamaged).map(c => c.label).join(", ");
      const switchState = components.find(c => c.type === ComponentType.SWITCH)?.isOpen ? "Open" : "Closed";
      const reading = ((circuitState.nodePotentials[positiveProbe.nodeId] ?? 0) - (circuitState.nodePotentials[negativeProbe.nodeId] ?? 0)).toFixed(2);
      const prompt = `Physics analysis: 240V DC series circuit with 12 bulbs. Damaged: ${damaged || "None"}. Switch: ${switchState}. Voltmeter at Node ${positiveProbe.nodeId} and ${negativeProbe.nodeId}. Reading: ${reading}V. Explain potential distribution.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAnalysis(response.text || "Analysis result empty.");
    } catch (error) {
      setAnalysis("Lab Assistant connection error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const voltmeterReading = ((circuitState.nodePotentials[positiveProbe.nodeId] ?? 0) - (circuitState.nodePotentials[negativeProbe.nodeId] ?? 0));

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden text-white font-sans">
      {/* Top Header */}
      <header className="shrink-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase italic tracking-tighter">Lab</span>
          <h1 className="text-xl font-black tracking-tighter">VIRTUAL BENCH</h1>
        </div>
        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-4 shadow-inner">
           <div className="flex flex-col items-center">
             <span className="text-slate-500 text-[8px] uppercase font-black tracking-widest">Ammeter</span>
             <span className="font-mono text-base text-yellow-400 font-bold">{circuitState.current.toFixed(2)} A</span>
           </div>
        </div>
      </header>

      {/* Main content: Bench area */}
      <main className="flex-1 relative flex flex-col min-h-0 bg-slate-900 overflow-hidden">
        <div className="flex-1 relative bg-black/40 shadow-inner overflow-hidden flex items-center justify-center">
          <CircuitBoard 
            components={components} 
            positiveProbe={positiveProbe}
            negativeProbe={negativeProbe}
            activeProbe={activeProbe}
            onSelectProbe={setActiveProbe}
            onMoveProbe={(nodeId) => {
              if (activeProbe === 'positive') setPositiveProbe(p => ({ ...p, nodeId }));
              else setNegativeProbe(p => ({ ...p, nodeId }));
            }}
            onToggleDamage={toggleDamage}
            circuitState={circuitState}
            colorCodeEnabled={colorCodeEnabled}
          />
          <VoltmeterDisplay reading={voltmeterReading} />
        </div>
      </main>

      {/* Bottom Panel for Master Controls */}
      <footer className="shrink-0 bg-slate-950 border-t border-slate-800 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <ControlPanel 
          components={components}
          onToggleSwitch={toggleSwitch}
          onReset={resetSimulation}
          activeProbe={activeProbe}
          setActiveProbe={setActiveProbe}
          analysis={analysis}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          colorCodeEnabled={colorCodeEnabled}
          setColorCodeEnabled={setColorCodeEnabled}
        />
      </footer>
    </div>
  );
};

export default App;
