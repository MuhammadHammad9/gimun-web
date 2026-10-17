import type { ComponentType, RefObject } from 'react';

export interface LaserFlowProps {
  surfaceRef?: RefObject<HTMLElement | null>;
  beamPosition?: number;
  color?: string;
  intensity?: number;
  beamWidth?: number;
  flare?: number;
  spread?: number;
  spill?: number;
  fog?: number;
  dust?: number;
  streaks?: number;
  dots?: number;
  pulse?: number;
  speed?: number;
  seed?: number;
  mouseInteraction?: boolean;
  intro?: boolean;
  theme?: 'dark' | 'light';
  paused?: boolean;
  dpr?: number;
  className?: string;
}

declare const LaserFlow: ComponentType<LaserFlowProps>;
export default LaserFlow;
