import { GlobeArt, PorticoArt, ScalesArt } from '@/components/art/LineArt';

/** The line art in a mega panel. Loaded with the panel, not the page. */
export default function PanelArt({ kind }: { kind: 'gimun' | 'gmc' | 'about' }) {
  if (kind === 'gimun') return <GlobeArt className="mega__art" />;
  if (kind === 'gmc') return <ScalesArt className="mega__art" />;
  return <PorticoArt className="mega__art" />;
}
