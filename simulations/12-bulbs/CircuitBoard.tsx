
import React, { useMemo } from 'react';
import { CircuitComponent, ComponentType, ProbeState } from '../types';

interface Props {
  components: CircuitComponent[];
  positiveProbe: ProbeState;
  negativeProbe: ProbeState;
  activeProbe: 'positive' | 'negative';
  onSelectProbe: (probe: 'positive' | 'negative') => void;
  onMoveProbe: (nodeId: number) => void;
  onToggleDamage: (id: string) => void;
  circuitState: { 
    current: number; 
    isCircuitBroken: boolean;
    nodePotentials: (number | null)[];
  };
  colorCodeEnabled: boolean;
}

const CircuitBoard: React.FC<Props> = ({ 
  components, positiveProbe, negativeProbe, activeProbe, onSelectProbe, onMoveProbe, onToggleDamage, circuitState,
  colorCodeEnabled
}) => {
  const sizeX = 1000;
  const sizeY = 750;
  const paddingX = 140;
  const paddingY = 100;

  // Potential Highlight Colors
  const COLOR_240V = '#a855f7'; // Purple
  const COLOR_0V = '#22c55e';   // Green
  const DEFAULT_WIRE = '#334155'; // Dark Grey for inactive/broken segments
  const FLOW_WIRE = '#facc15';    // Yellow for active flow

  const nodes = useMemo(() => {
    const points = [];
    const count = components.length;
    const rectWidth = sizeX - paddingX * 2;
    const rectHeight = sizeY - paddingY * 2;

    const topCount = Math.floor(count * 0.35);
    const sideCount = Math.floor(count * 0.15);
    const bottomCount = topCount;
    const leftCount = count - topCount - sideCount - bottomCount;

    for (let i = 0; i < count; i++) {
      let x, y;
      if (i < topCount) {
        x = paddingX + (i / topCount) * rectWidth;
        y = paddingY;
      } else if (i < topCount + sideCount) {
        x = sizeX - paddingX;
        y = paddingY + ((i - topCount) / sideCount) * rectHeight;
      } else if (i < topCount + sideCount + bottomCount) {
        x = sizeX - paddingX - ((i - topCount - sideCount) / bottomCount) * rectWidth;
        y = sizeY - paddingY;
      } else {
        x = paddingX;
        y = sizeY - paddingY - ((i - topCount - sideCount - bottomCount) / leftCount) * rectHeight;
      }
      points.push({ id: i, x, y });
    }
    return points;
  }, [components.length]);

  const getSegmentColor = (i: number) => {
    const comp = components[i];
    
    // If the component itself is the break, don't highlight it as conducting
    if (comp.isDamaged || (comp.type === ComponentType.SWITCH && comp.isOpen)) {
      return DEFAULT_WIRE;
    }

    const startV = circuitState.nodePotentials[i];
    const endV = circuitState.nodePotentials[(i + 1) % nodes.length];
    
    // If either end is floating (not connected to positive or negative terminal), 
    // it should not be highlighted.
    if (startV === null || endV === null) {
      return DEFAULT_WIRE;
    }

    // Only apply potential highlights if colorCodeEnabled is true
    if (colorCodeEnabled) {
      // High potential highlight (240V)
      if (Math.abs(startV - 240) < 0.1 && Math.abs(endV - 240) < 0.1) return COLOR_240V;
      // Zero potential highlight (0V)
      if (Math.abs(startV - 0) < 0.1 && Math.abs(endV - 0) < 0.1) return COLOR_0V;
    }
    
    // Default state: if circuit is closed, use flow color, otherwise use default
    return !circuitState.isCircuitBroken ? FLOW_WIRE : DEFAULT_WIRE;
  };

  return (
    <svg 
      viewBox={`0 0 ${sizeX} ${sizeY}`} 
      className="w-full h-full object-contain select-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="bulbGlow">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="potentialGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* Circuit Wires */}
      {components.map((comp, i) => {
        const start = nodes[i];
        const end = nodes[(i + 1) % nodes.length];
        const segmentColor = getSegmentColor(i);
        const isHighlighted = colorCodeEnabled && (segmentColor === COLOR_240V || segmentColor === COLOR_0V);
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;

        return (
          <g key={`seg-${comp.id}`}>
            {/* Background Glow for Highlights */}
            {isHighlighted && (
              <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={segmentColor}
                strokeWidth="22"
                strokeLinecap="round"
                opacity="0.3"
                className="transition-all duration-500"
              />
            )}
            <line
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              stroke={segmentColor}
              strokeWidth={comp.type === ComponentType.WIRE ? "14" : "6"}
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Fault Indicator for Wires */}
            {comp.type === ComponentType.WIRE && comp.isDamaged && (
              <g transform={`translate(${centerX}, ${centerY})`}>
                <circle r="12" fill="#0f172a" />
                <g stroke="#ef4444" strokeWidth="4" strokeLinecap="round">
                  <line x1="-8" y1="-8" x2="8" y2="8" />
                  <line x1="-8" y1="8" x2="8" y2="-8" />
                </g>
              </g>
            )}

            {/* Hit Area */}
            <line
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              stroke="transparent"
              strokeWidth="45"
              className="cursor-pointer"
              onClick={() => onToggleDamage(comp.id)}
            />
          </g>
        );
      })}

      {/* Component Visuals */}
      {components.map((comp, i) => {
        const start = nodes[i];
        const end = nodes[(i + 1) % nodes.length];
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const segmentColor = getSegmentColor(i);
        const isFlowing = !circuitState.isCircuitBroken;

        if (comp.type === ComponentType.WIRE) return null;

        return (
          <g key={comp.id} transform={`translate(${centerX}, ${centerY})`} className="cursor-pointer" onClick={() => onToggleDamage(comp.id)}>
            {comp.type === ComponentType.SOURCE && (
               <g>
                 <rect x="-50" y="-35" width="100" height="70" fill="#0f172a" stroke="#6366f1" strokeWidth="4" rx="10" />
                 <text y="5" textAnchor="middle" fill="#fff" fontSize="22" className="font-black italic">240V</text>
                 
                 {/* Polarity Indicators */}
                 <text x="-35" y="2" textAnchor="middle" fill="#94a3b8" fontSize="16" className="font-bold">-</text>
                 <text x="35" y="2" textAnchor="middle" fill="#ef4444" fontSize="16" className="font-bold">+</text>
                 
                 {comp.isDamaged && (
                   <g stroke="#ef4444" strokeWidth="8" strokeLinecap="round" transform="translate(0, -45)">
                     <line x1="-15" y1="-15" x2="15" y2="15" />
                     <line x1="-15" y1="15" x2="15" y2="-15" />
                   </g>
                 )}
               </g>
            )}

            {comp.type === ComponentType.BULB && (
              <g>
                <circle 
                  r="32" 
                  fill={comp.isDamaged ? "#1e1b4b" : (isFlowing ? "#facc15" : "#1e293b")} 
                  stroke={segmentColor !== FLOW_WIRE && segmentColor !== DEFAULT_WIRE ? segmentColor : "#475569"} 
                  strokeWidth={(colorCodeEnabled && (segmentColor === COLOR_240V || segmentColor === COLOR_0V)) ? "4" : "2"} 
                />
                {isFlowing && !comp.isDamaged && (
                  <circle r="45" fill="url(#bulbGlow)" className="animate-pulse" />
                )}
                {comp.isDamaged && (
                   <g stroke="#ef4444" strokeWidth="5" strokeLinecap="round">
                     <line x1="-15" y1="-15" x2="15" y2="15" />
                     <line x1="-15" y1="15" x2="15" y2="-15" />
                   </g>
                )}
                <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" className="font-bold uppercase tracking-widest">{comp.label}</text>
              </g>
            )}

            {comp.type === ComponentType.SWITCH && (
              <g>
                <rect 
                  x="-40" y="-25" width="80" height="50" 
                  fill="#1e293b" rx="8" 
                  stroke={segmentColor !== FLOW_WIRE && segmentColor !== DEFAULT_WIRE ? segmentColor : "#475569"} 
                  strokeWidth={(colorCodeEnabled && (segmentColor === COLOR_240V || segmentColor === COLOR_0V)) ? "4" : "2"} 
                />
                <line 
                   x1="-28" y1="0" 
                   x2={comp.isOpen ? "15" : "28"} 
                   y2={comp.isOpen ? "-35" : "0"} 
                   stroke="#fff" 
                   strokeWidth="10" 
                   strokeLinecap="round"
                   className="transition-all duration-300"
                />
                {comp.isDamaged && (
                   <g stroke="#ef4444" strokeWidth="6" strokeLinecap="round" transform="translate(0, -35)">
                     <line x1="-10" y1="-10" x2="10" y2="10" />
                     <line x1="-10" y1="10" x2="10" y2="-10" />
                   </g>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* Interactive Nodes */}
      {nodes.map((node) => (
        <circle
          key={`hit-${node.id}`}
          cx={node.x}
          cy={node.y}
          r="25"
          fill="transparent"
          className="cursor-pointer hover:fill-white/20 transition-colors"
          onClick={() => onMoveProbe(node.id)}
        />
      ))}

      {/* Probes */}
      <ProbeMarker 
        x={nodes[positiveProbe.nodeId].x} 
        y={nodes[positiveProbe.nodeId].y} 
        color={positiveProbe.color} 
        label={positiveProbe.label} 
        isActive={activeProbe === 'positive'}
        onClick={() => onSelectProbe('positive')}
      />
      <ProbeMarker 
        x={nodes[negativeProbe.nodeId].x} 
        y={nodes[negativeProbe.nodeId].y} 
        color={negativeProbe.color} 
        label={negativeProbe.label} 
        isActive={activeProbe === 'negative'}
        onClick={() => onSelectProbe('negative')}
      />
    </svg>
  );
};

const ProbeMarker: React.FC<{ x: number; y: number; color: string; label: string; isActive: boolean; onClick: () => void }> = ({ x, y, color, label, isActive, onClick }) => (
  <g transform={`translate(${x}, ${y})`} className="cursor-pointer transition-transform duration-300" onClick={(e) => { e.stopPropagation(); onClick(); }}>
    {isActive && (
      <circle r="40" fill={color} fillOpacity="0.25" className="animate-pulse" />
    )}
    <g transform="translate(0, -50)">
      <path d="M-18,-45 L18,-45 L18,-15 L0,20 L-18,-15 Z" fill={color} stroke="#fff" strokeWidth={isActive ? "3" : "1"} filter={isActive ? "url(#glow)" : ""} />
      <text y="-22" textAnchor="middle" fill="#fff" fontSize="16" className="font-black pointer-events-none">{label}</text>
    </g>
  </g>
);

export default CircuitBoard;
