import type { AntennaStyleId, Palette } from '../types.js';
import type { FaceAnchor } from './anchor.js';

/**
 * Antenna mounts at anchor.topperX / topperY (body's apex).
 */
export function renderAntenna(id: AntennaStyleId, anchor: FaceAnchor, palette: Palette): string {
  if (id === 'none') return '';

  const cx = anchor.topperX;
  const topY = anchor.topperY;
  const color = palette.accent;
  const ink = palette.ink;

  switch (id) {
    case 'classic':
      return [
        `<path d="M${cx} ${topY} Q${cx + 1} ${topY - 5} ${cx + 2.5} ${topY - 9}" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.55" />`,
        `<circle class="n-spark" cx="${cx + 2.5}" cy="${topY - 10}" r="2.6" fill="${color}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />`,
      ].join('');
    case 'curl':
      return [
        `<path d="M${cx} ${topY} Q${cx + 6} ${topY - 4} ${cx + 1} ${topY - 8} Q${cx - 4} ${topY - 11} ${cx + 1} ${topY - 14}" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.55" />`,
        `<circle class="n-spark" cx="${cx + 1}" cy="${topY - 14}" r="2.2" fill="${color}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />`,
      ].join('');
    case 'double':
      return [
        `<path d="M${cx - 4} ${topY} Q${cx - 5} ${topY - 4} ${cx - 5.5} ${topY - 8}" stroke="${ink}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55" />`,
        `<path d="M${cx + 4} ${topY} Q${cx + 5} ${topY - 4} ${cx + 5.5} ${topY - 8}" stroke="${ink}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity="0.55" />`,
        `<circle class="n-spark" cx="${cx - 5.5}" cy="${topY - 9}" r="2.1" fill="${color}" stroke="${ink}" stroke-width="0.5" opacity="0.95" />`,
        `<circle class="n-spark" cx="${cx + 5.5}" cy="${topY - 9}" r="2.1" fill="${color}" stroke="${ink}" stroke-width="0.5" opacity="0.95" />`,
      ].join('');
    case 'spike':
      return [
        `<path class="n-spark" d="M${cx - 2.5} ${topY - 1} L${cx + 1} ${topY - 11} L${cx + 4.5} ${topY - 1} Z" fill="${color}" stroke="${ink}" stroke-width="0.6" opacity="0.95" />`,
      ].join('');
  }
}
