import { ExperiencePoint } from './types';

function validCoordinate(point: ExperiencePoint): boolean {
  return Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
    && point.latitude >= -90
    && point.latitude <= 90
    && point.longitude >= -180
    && point.longitude <= 180;
}

function coordinate(point: ExperiencePoint): string {
  return `${point.latitude},${point.longitude}`;
}

/** Builds a Google Maps search or ordered walking-directions URL without user data. */
export function googleMapsUrlForExperiencePoints(points: ExperiencePoint[]): string | undefined {
  if (!points.length || !points.every(validCoordinate)) return undefined;
  if (points.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinate(points[0]))}`;
  }

  const parameters = [
    'api=1',
    `origin=${encodeURIComponent(coordinate(points[0]))}`,
    `destination=${encodeURIComponent(coordinate(points[points.length - 1]))}`,
    'travelmode=walking',
  ];
  const waypoints = points.slice(1, -1);
  if (waypoints.length) parameters.push(`waypoints=${encodeURIComponent(waypoints.map(coordinate).join('|'))}`);
  return `https://www.google.com/maps/dir/?${parameters.join('&')}`;
}
