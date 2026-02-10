
export enum ComponentType {
  SOURCE = 'SOURCE',
  BULB = 'BULB',
  SWITCH = 'SWITCH',
  WIRE = 'WIRE'
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  resistance: number; // in Ohms
  isDamaged: boolean;
  isOpen?: boolean; // For switches
  label: string;
}

export interface NodePoint {
  id: number;
  x: number;
  y: number;
}

export interface ProbeState {
  nodeId: number;
  color: string;
  label: string;
}
