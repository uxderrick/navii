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
interface ResvgConstructor {
  new (svg: string, opts: { fitTo: { mode: 'width'; value: number } }): ResvgInstance;
}

async function getResvg(): Promise<ResvgConstructor> {
  if (cached) return cached;
  const mod = (await import('@resvg/resvg-js')) as { Resvg: ResvgConstructor };
  cached = mod.Resvg;
  return cached;
}

export async function svgToPng(svg: string, sizePx: number): Promise<Uint8Array> {
  const Resvg = await getResvg();
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: sizePx } });
  return r.render().asPng();
}
