// ── Account ──────────────────────────────────────────────────────────────────

export const ACCOUNT_ICONS = [
  'wallet-outline',
  'card-outline',
  'cash-outline',
  'business-outline',
  'server-outline',
  'diamond-outline',
  'home-outline',
  'phone-portrait-outline',
  'globe-outline',
  'briefcase-outline',
  'trending-up-outline',
  'layers-outline',
] as const;

export type AccountIconName = (typeof ACCOUNT_ICONS)[number];

export const ACCOUNT_COLORS = [
  '#00FFAA',
  '#00F0FF',
  '#8B5CF6',
  '#EC4899',
  '#F43F5E',
  '#EAB308',
  '#F97316',
  '#10B981',
  '#3B82F6',
  '#64748B',
  '#14B8A6',
  '#F59E0B',
] as const;

// ── Category ─────────────────────────────────────────────────────────────────

export const CATEGORY_ICONS = [
  'grid-outline',
  'fast-food-outline',
  'cafe-outline',
  'car-outline',
  'bus-outline',
  'airplane-outline',
  'home-outline',
  'medkit-outline',
  'barbell-outline',
  'book-outline',
  'game-controller-outline',
  'gift-outline',
  'heart-outline',
  'star-outline',
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

// Categories share the same colour palette as accounts
export const CATEGORY_COLORS = ACCOUNT_COLORS;
