import presentation from './design/ankara101Presentation.json';
import { Guide } from './types';
import { resolveGuideById } from './ankara101';

export type GuidePresentation = (typeof presentation)[keyof typeof presentation];
export const GUIDE_PRESENTATIONS: Readonly<Record<string, GuidePresentation>> = presentation;
export const PRODUCTION_GUIDE_IDS = Object.keys(presentation);

/** The catalog owns content. Presentation cannot resolve a missing ID by title. */
export function resolveAnkara101Reader(guides: readonly Guide[], id?: string) {
  const guide = resolveGuideById(guides, id);
  const config = id ? GUIDE_PRESENTATIONS[id] : undefined;
  return guide && config ? { guide, config } : undefined;
}

export type Ankara101Origin = { screen: 'guides' | 'saved'; id?: string; scrollY: number };
export type Ankara101Session = { guideId: string; origin: Ankara101Origin; exitOrigin?: Ankara101Origin };
export function openAnkara101Reader(guides: readonly Guide[], guideId: string, origin: Ankara101Origin, exitOrigin?: Ankara101Origin): Ankara101Session | undefined {
  return resolveAnkara101Reader(guides, guideId) ? { guideId, origin: { ...origin }, ...(exitOrigin ? { exitOrigin: { ...exitOrigin } } : {}) } : undefined;
}
/** A reader has one exact Guide. Back, hardware Back and Close share its origin. */
export function ankara101Return(session: Ankara101Session, action: 'back' | 'close' | 'androidBack'): Ankara101Origin {
  return { ...(action === 'close' ? session.exitOrigin ?? session.origin : session.origin) };
}

export function ankara101FontState(loaded: boolean, error: unknown, timedOut: boolean): 'ready' | 'loading' | 'failed' {
  return loaded && !timedOut ? 'ready' : error || timedOut ? 'failed' : 'loading';
}

/** Layout order uses current paragraph/stop arrays without inventing museum stops. */
export function ankara101Chapters(guide: Guide, config: GuidePresentation) {
  const split = Math.ceil(guide.paragraphs.length / 2);
  const stops = guide.routeStops ?? [];
  const stopSplit = Math.ceil(stops.length / 2);
  return config.headings.map((title, index) => ({
    title, paragraphs: index === 0 ? guide.paragraphs.slice(0, split) : guide.paragraphs.slice(split),
    stops: config.routeAt === 'split' ? stops.slice(index * stopSplit, (index + 1) * stopSplit) : [],
    stopOffset: index * stopSplit,
  }));
}

export function ankara101EditorialFont(family: string, style: string, size?: number) {
  if (family === 'Instrument Serif') return style === 'Italic' ? 'A101InstrumentItalic' : 'A101InstrumentRegular';
  const weight = ({ Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Italic: 400 } as Record<string, number>)[style] ?? 400;
  if (family === 'Fraunces' && weight === 600 && size === 21) return 'A101Fraunces600';
  if (family === 'Fraunces' && style !== 'Italic' && size && [21, 25, 36, 41].includes(size)) return `A101Fraunces${weight}opsz${size}`;
  return `A101${family === 'Fraunces' ? 'Fraunces' : 'Bricolage'}${weight}${style === 'Italic' ? 'Italic' : ''}`;
}
