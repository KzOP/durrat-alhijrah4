import { describe, expect, it } from 'vitest';
import {
  isLandPropertyType,
  isStoredVideoUrl,
  licenseWatch,
  matchesPropertyCategory,
  matchesRoomCount,
  normalizeLandClassification,
} from '@/durrat/lib/property-meta';

describe('property metadata', () => {
  it('flags expired and soon licenses', () => {
    expect(licenseWatch('2020-01-01', new Date('2026-11-16T12:00:00'))).toBe('expired');
    expect(licenseWatch('2026-11-20', new Date('2026-11-16T12:00:00'))).toBe('soon');
    expect(licenseWatch('2027-01-01', new Date('2026-11-16T12:00:00'))).toBe('ok');
    expect(licenseWatch('')).toBe('none');
  });

  it('accepts only http video links for the player', () => {
    expect(isStoredVideoUrl('https://firebasestorage.googleapis.com/v0/b/x/o/v.mp4')).toBe(true);
    expect(isStoredVideoUrl('data:video/mp4;base64,AAAA')).toBe(false);
  });

  it('recognizes land and preserves legacy land labels as their classification', () => {
    expect(isLandPropertyType('أرض')).toBe(true);
    expect(isLandPropertyType('أرض خام')).toBe(true);
    expect(isLandPropertyType('شقة')).toBe(false);
    expect(normalizeLandClassification('', 'أرض تجارية')).toBe('commercial');
    expect(normalizeLandClassification('', 'أرض سكنية')).toBe('residential');
  });

  it('filters land categories using the selected classification', () => {
    expect(matchesPropertyCategory('أرض', 'commercial', 'أرض تجارية')).toBe(true);
    expect(matchesPropertyCategory('أرض', 'residential', 'أرض تجارية')).toBe(false);
    expect(matchesPropertyCategory('أرض خام', '', 'أرض')).toBe(true);
  });

  it('filters apartments by room count for both listing types', () => {
    expect(matchesRoomCount('شقة', 3, '3')).toBe(true);
    expect(matchesRoomCount('شقة', 4, '3')).toBe(false);
    expect(matchesRoomCount('شقة', 12, '11+')).toBe(true);
    expect(matchesRoomCount('فيلا', 3, '3')).toBe(false);
    expect(matchesRoomCount('فيلا', 3, 'all')).toBe(true);
  });
});
