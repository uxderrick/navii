/**
 * SVG → PNG via @resvg/resvg-js (Node native).
 *
 * Lazy import so non-Node runtimes (Workers, Deno) can still load the rest of
 * the app and just not advertise the PNG route. Animated flag is ignored for
 * raster output — resvg renders the static base frame.
 */

let cached: ResvgConstructor | null = null;

interface ResvgInstance {
  render(): { asPng(): Uint8Array };
}
interface ResvgOpts {
  fitTo: { mode: 'width'; value: number };
  font?: {
    loadSystemFonts?: boolean;
    fontFiles?: string[];
    fontDirs?: string[];
    sansSerifFamily?: string;
    serifFamily?: string;
    monospaceFamily?: string;
    defaultFontFamily?: string;
    defaultFontSize?: number;
  };
}
interface ResvgConstructor {
  new (svg: string, opts: ResvgOpts): ResvgInstance;
}

async function getResvg(): Promise<ResvgConstructor> {
  if (cached) return cached;
  const mod = (await import('@resvg/resvg-js')) as { Resvg: ResvgConstructor };
  cached = mod.Resvg;
  return cached;
}

export async function svgToPng(svg: string, sizePx: number): Promise<Uint8Array> {
  const Resvg = await getResvg();
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: sizePx },
    font: {
      loadSystemFonts: true,
      // Force-load the DejaVu directory that ships in the Docker runtime.
      // resvg's auto-scan of system fonts is unreliable across distros, so we
      // point at the canonical Debian path explicitly. On non-Linux dev
      // machines this path simply doesn't exist and the option is ignored.
      fontDirs: ['/usr/share/fonts/truetype/dejavu', '/usr/share/fonts'],
      sansSerifFamily: 'DejaVu Sans',
      serifFamily: 'DejaVu Serif',
      monospaceFamily: 'DejaVu Sans Mono',
      defaultFontFamily: 'DejaVu Sans',
    },
  });
  return r.render().asPng();
}
