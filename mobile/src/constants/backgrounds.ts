// Background definitions for iOS 26 Liquid Glass design
// 50+ backgrounds organized by category

export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'animated';

export type PatternType =
  | 'noise-grain'
  | 'hexagons'
  | 'blobs'
  | 'topographic'
  | 'waves'
  | 'dots-grid'
  | 'circuit-board'
  | 'mesh-gradient'
  | 'bokeh'
  | 'crystals'
  | 'marble'
  | 'water-ripples'
  | 'fabric-weave'
  | 'starfield'
  | 'aurora-bands'
  | 'leopard'
  | 'cheetah'
  | 'festive-pattern'
  | 'hearts'
  | 'leaves'
  | 'snowflakes'
  | 'pumpkins'
  | 'fireworks'
  | 'eggs'
  | 'pinatas'
  | 'geometric-abstract'
  | 'organic-flow';

export type BackgroundCategory =
  | 'default'
  | 'patterns'
  | 'animal-prints'
  | 'holiday'
  | 'abstract'
  | 'nature'
  | 'weather';

export interface Background {
  id: string;
  name: string;
  description: string;
  type: BackgroundType;
  colors: {
    light: readonly string[];
    dark: readonly string[];
  };
  patternType?: PatternType;
  category: BackgroundCategory;
  premium?: boolean;
}

export type BackgroundId = typeof BACKGROUNDS[number]['id'];

export const BACKGROUNDS = [
  // ========== DEFAULT ==========
  {
    id: 'default',
    name: 'Default',
    description: 'Clean solid background',
    type: 'solid' as BackgroundType,
    colors: {
      light: ['#f8fafc'],
      dark: ['#0a0a0a'],
    },
    category: 'default' as BackgroundCategory,
  },

  // ========== PATTERNS (15) ==========
  {
    id: 'noise-grain',
    name: 'Noise Grain',
    description: 'Subtle textured noise pattern',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f1f5f9', '#e2e8f0'],
      dark: ['#1a1a2e', '#16213e'],
    },
    patternType: 'noise-grain' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'hexagons',
    name: 'Hexagons',
    description: 'Modern honeycomb pattern',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#e0e7ff', '#c7d2fe'],
      dark: ['#1e1b4b', '#312e81'],
    },
    patternType: 'hexagons' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'blobs',
    name: 'Organic Blobs',
    description: 'Soft organic shapes',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fce7f3', '#fbcfe8'],
      dark: ['#4a1942', '#831843'],
    },
    patternType: 'blobs' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'topographic',
    name: 'Topographic',
    description: 'Contour map lines',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#d1fae5', '#a7f3d0'],
      dark: ['#064e3b', '#065f46'],
    },
    patternType: 'topographic' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'waves',
    name: 'Waves',
    description: 'Flowing wave lines',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#dbeafe', '#bfdbfe'],
      dark: ['#1e3a5f', '#1e40af'],
    },
    patternType: 'waves' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'dots-grid',
    name: 'Dots Grid',
    description: 'Minimalist dot matrix',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f5f5f5', '#e5e5e5'],
      dark: ['#171717', '#262626'],
    },
    patternType: 'dots-grid' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'Tech-inspired paths',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#ecfccb', '#d9f99d'],
      dark: ['#1a2e05', '#365314'],
    },
    patternType: 'circuit-board' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'mesh-gradient',
    name: 'Mesh Gradient',
    description: 'Smooth color mesh',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#fde68a', '#fcd34d'],
      dark: ['#451a03', '#78350f', '#92400e'],
    },
    patternType: 'mesh-gradient' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'bokeh',
    name: 'Bokeh',
    description: 'Soft light circles',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fdf4ff', '#fae8ff'],
      dark: ['#2e1065', '#4c1d95'],
    },
    patternType: 'bokeh' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'crystals',
    name: 'Crystals',
    description: 'Geometric crystal shards',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#e0f2fe', '#bae6fd'],
      dark: ['#0c4a6e', '#075985'],
    },
    patternType: 'crystals' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'marble',
    name: 'Marble',
    description: 'Elegant marble texture',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fafafa', '#f5f5f5', '#e5e5e5'],
      dark: ['#18181b', '#27272a', '#3f3f46'],
    },
    patternType: 'marble' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'water-ripples',
    name: 'Water Ripples',
    description: 'Concentric water rings',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#cffafe', '#a5f3fc'],
      dark: ['#083344', '#0e7490'],
    },
    patternType: 'water-ripples' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'fabric-weave',
    name: 'Fabric Weave',
    description: 'Woven textile pattern',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f5f5f4', '#e7e5e4'],
      dark: ['#1c1917', '#292524'],
    },
    patternType: 'fabric-weave' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'starfield',
    name: 'Starfield',
    description: 'Deep space stars',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#e0e7ff', '#c7d2fe'],
      dark: ['#020617', '#0f172a'],
    },
    patternType: 'starfield' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },
  {
    id: 'aurora-bands',
    name: 'Aurora Bands',
    description: 'Northern lights waves',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#d1fae5', '#a7f3d0', '#6ee7b7'],
      dark: ['#022c22', '#064e3b', '#047857'],
    },
    patternType: 'aurora-bands' as PatternType,
    category: 'patterns' as BackgroundCategory,
  },

  // ========== ANIMAL PRINTS (6) ==========
  {
    id: 'midnight-gold-leopard',
    name: 'Midnight Gold Leopard',
    description: 'Luxurious gold on black',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#fbbf24', '#1f2937'],
      dark: ['#0a0a0a', '#fbbf24', '#d97706'],
    },
    patternType: 'leopard' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
    premium: true,
  },
  {
    id: 'classic-safari-leopard',
    name: 'Classic Safari',
    description: 'Traditional leopard print',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef9c3', '#ca8a04', '#451a03'],
      dark: ['#78350f', '#ca8a04', '#1c1917'],
    },
    patternType: 'leopard' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
  },
  {
    id: 'snow-leopard-frost',
    name: 'Snow Leopard',
    description: 'Icy white leopard',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f8fafc', '#94a3b8', '#475569'],
      dark: ['#1e293b', '#64748b', '#334155'],
    },
    patternType: 'leopard' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
  },
  {
    id: 'rose-gold-leopard',
    name: 'Rose Gold Leopard',
    description: 'Elegant rose gold spots',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fff1f2', '#fda4af', '#9f1239'],
      dark: ['#1f1315', '#be123c', '#881337'],
    },
    patternType: 'leopard' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
    premium: true,
  },
  {
    id: 'obsidian-leopard',
    name: 'Obsidian Leopard',
    description: 'Dark monochrome spots',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#d4d4d4', '#525252', '#171717'],
      dark: ['#0a0a0a', '#404040', '#262626'],
    },
    patternType: 'leopard' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
  },
  {
    id: 'cheetah-luxe',
    name: 'Cheetah Luxe',
    description: 'Sleek cheetah dots',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#92400e', '#1c1917'],
      dark: ['#451a03', '#d97706', '#0a0a0a'],
    },
    patternType: 'cheetah' as PatternType,
    category: 'animal-prints' as BackgroundCategory,
  },

  // ========== HOLIDAY (7) ==========
  {
    id: 'christmas-festive',
    name: 'Christmas Festive',
    description: 'Classic red and green',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef2f2', '#dc2626', '#166534'],
      dark: ['#1c1917', '#991b1b', '#14532d'],
    },
    patternType: 'festive-pattern' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'halloween-spooky',
    name: 'Halloween Spooky',
    description: 'Orange and purple night',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#f97316', '#7c3aed'],
      dark: ['#0c0a09', '#ea580c', '#6d28d9'],
    },
    patternType: 'pumpkins' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'thanksgiving-harvest',
    name: 'Thanksgiving Harvest',
    description: 'Warm autumn tones',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#d97706', '#92400e'],
      dark: ['#1c1917', '#b45309', '#78350f'],
    },
    patternType: 'leaves' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'fourth-of-july',
    name: 'Fourth of July',
    description: 'Patriotic celebration',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#eff6ff', '#dc2626', '#1d4ed8'],
      dark: ['#0f172a', '#b91c1c', '#1e40af'],
    },
    patternType: 'fireworks' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'valentines-hearts',
    name: "Valentine's Hearts",
    description: 'Romantic pink hearts',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fff1f2', '#fb7185', '#e11d48'],
      dark: ['#1f1315', '#be123c', '#9f1239'],
    },
    patternType: 'hearts' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'easter-spring',
    name: 'Easter Spring',
    description: 'Pastel spring colors',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fdf4ff', '#86efac', '#fef08a'],
      dark: ['#1e1b2e', '#166534', '#a16207'],
    },
    patternType: 'eggs' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },
  {
    id: 'cinco-de-mayo',
    name: 'Cinco de Mayo',
    description: 'Vibrant fiesta colors',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#16a34a', '#dc2626'],
      dark: ['#1c1917', '#15803d', '#b91c1c'],
    },
    patternType: 'pinatas' as PatternType,
    category: 'holiday' as BackgroundCategory,
  },

  // ========== ABSTRACT (6) ==========
  {
    id: 'wellness-gradient',
    name: 'Wellness Gradient',
    description: 'Calm purple to pink',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#f5f3ff', '#fce7f3', '#fff1f2'],
      dark: ['#2e1065', '#831843', '#9f1239'],
    },
    category: 'abstract' as BackgroundCategory,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Northern lights glow',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#d1fae5', '#a5f3fc', '#e0e7ff'],
      dark: ['#022c22', '#083344', '#1e1b4b'],
    },
    category: 'abstract' as BackgroundCategory,
  },
  {
    id: 'organic-blobs-abstract',
    name: 'Organic Flow',
    description: 'Flowing organic shapes',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#fce7f3', '#e0f2fe'],
      dark: ['#451a03', '#831843', '#0c4a6e'],
    },
    patternType: 'organic-flow' as PatternType,
    category: 'abstract' as BackgroundCategory,
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Sharp angular shapes',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f5f5f5', '#d4d4d4', '#a3a3a3'],
      dark: ['#171717', '#262626', '#404040'],
    },
    patternType: 'geometric-abstract' as PatternType,
    category: 'abstract' as BackgroundCategory,
  },
  {
    id: 'noise-texture',
    name: 'Noise Texture',
    description: 'Film grain overlay',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#fafafa', '#f5f5f5'],
      dark: ['#0a0a0a', '#171717'],
    },
    patternType: 'noise-grain' as PatternType,
    category: 'abstract' as BackgroundCategory,
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    description: 'Animated gradient',
    type: 'animated' as BackgroundType,
    colors: {
      light: ['#dbeafe', '#e0e7ff', '#fce7f3'],
      dark: ['#1e3a5f', '#2e1065', '#831843'],
    },
    category: 'abstract' as BackgroundCategory,
    premium: true,
  },

  // ========== NATURE (10) ==========
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Deep forest greens',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#d1fae5', '#a7f3d0', '#86efac'],
      dark: ['#022c22', '#064e3b', '#065f46'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep sea blues',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
      dark: ['#082f49', '#0c4a6e', '#075985'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    description: 'Warm sand tones',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#fde68a', '#fcd34d'],
      dark: ['#451a03', '#78350f', '#92400e'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'mountain-mist',
    name: 'Mountain Mist',
    description: 'Misty mountain blues',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#f1f5f9', '#e2e8f0', '#cbd5e1'],
      dark: ['#0f172a', '#1e293b', '#334155'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Vibrant tropical hues',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#ccfbf1', '#99f6e4', '#5eead4'],
      dark: ['#042f2e', '#115e59', '#0f766e'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pink petals',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#fdf2f8', '#fce7f3', '#fbcfe8'],
      dark: ['#500724', '#831843', '#9d174d'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    description: 'Fall foliage colors',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#fef3c7', '#fed7aa', '#fdba74'],
      dark: ['#431407', '#7c2d12', '#9a3412'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    description: 'Soft purple meadow',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#f5f3ff', '#ede9fe', '#ddd6fe'],
      dark: ['#2e1065', '#4c1d95', '#5b21b6'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'moss-garden',
    name: 'Moss Garden',
    description: 'Zen garden greens',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#ecfccb', '#d9f99d', '#bef264'],
      dark: ['#1a2e05', '#365314', '#3f6212'],
    },
    category: 'nature' as BackgroundCategory,
  },
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    description: 'Warm sunset glow',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#fff7ed', '#ffedd5', '#fed7aa'],
      dark: ['#431407', '#7c2d12', '#c2410c'],
    },
    category: 'nature' as BackgroundCategory,
  },

  // ========== WEATHER (5) ==========
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    description: 'Calm rain clouds',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#f1f5f9', '#e2e8f0', '#94a3b8'],
      dark: ['#0f172a', '#1e293b', '#475569'],
    },
    category: 'weather' as BackgroundCategory,
  },
  {
    id: 'snow-fall',
    name: 'Snow Fall',
    description: 'Winter wonderland',
    type: 'pattern' as BackgroundType,
    colors: {
      light: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
      dark: ['#0f172a', '#1e293b', '#334155'],
    },
    patternType: 'snowflakes' as PatternType,
    category: 'weather' as BackgroundCategory,
  },
  {
    id: 'foggy-morning',
    name: 'Foggy Morning',
    description: 'Soft morning mist',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#fafafa', '#f5f5f5', '#e5e5e5'],
      dark: ['#171717', '#262626', '#404040'],
    },
    category: 'weather' as BackgroundCategory,
  },
  {
    id: 'storm-clouds',
    name: 'Storm Clouds',
    description: 'Dramatic storm sky',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#e2e8f0', '#94a3b8', '#64748b'],
      dark: ['#0f172a', '#334155', '#475569'],
    },
    category: 'weather' as BackgroundCategory,
  },
  {
    id: 'clear-sky',
    name: 'Clear Sky',
    description: 'Perfect blue sky',
    type: 'gradient' as BackgroundType,
    colors: {
      light: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
      dark: ['#0c4a6e', '#0284c7', '#0ea5e9'],
    },
    category: 'weather' as BackgroundCategory,
  },
] as const;

// Category display names and order
export const BACKGROUND_CATEGORIES: Record<BackgroundCategory, { name: string; order: number }> = {
  default: { name: 'Default', order: 0 },
  patterns: { name: 'Patterns', order: 1 },
  'animal-prints': { name: 'Animal Prints', order: 2 },
  abstract: { name: 'Abstract', order: 3 },
  nature: { name: 'Nature', order: 4 },
  weather: { name: 'Weather', order: 5 },
  holiday: { name: 'Holiday', order: 6 },
};

// Helper to get backgrounds by category
export function getBackgroundsByCategory(category: BackgroundCategory): Background[] {
  return BACKGROUNDS.filter((bg) => bg.category === category) as unknown as Background[];
}

// Helper to get background by ID
export function getBackgroundById(id: string): Background | undefined {
  return BACKGROUNDS.find((bg) => bg.id === id) as Background | undefined;
}

// Default background
export const DEFAULT_BACKGROUND_ID = 'default';
