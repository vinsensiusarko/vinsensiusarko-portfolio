export const SEASONS = {
  spring: {
    id: 'spring',
    labelId: 'Semi',
    labelEn: 'Spring',
    emoji: '🌸',
    badgeText: '🌸 Spring Edition',
    description: 'Sakura Petals',
    colors: ['#f9a8d4', '#f472b6', '#fbcfe8'],
    particleCountDesktop: 35,
    particleCountMobile: 16
  },
  summer: {
    id: 'summer',
    labelId: 'Panas',
    labelEn: 'Summer',
    emoji: '☀️',
    badgeText: '☀️ Summer Edition',
    description: 'Golden Sunbeams & Fireflies',
    colors: ['#fde047', '#f59e0b', '#fef08a'],
    particleCountDesktop: 30,
    particleCountMobile: 15
  },
  autumn: {
    id: 'autumn',
    labelId: 'Gugur',
    labelEn: 'Autumn',
    emoji: '🍂',
    badgeText: '🍂 Autumn Edition',
    description: 'Falling Maple Leaves',
    colors: ['#ea580c', '#d97706', '#b45309', '#dc2626'],
    particleCountDesktop: 32,
    particleCountMobile: 15
  },
  winter: {
    id: 'winter',
    labelId: 'Dingin',
    labelEn: 'Winter',
    emoji: '❄️',
    badgeText: '❄️ Winter Edition',
    description: 'Soft Snowflakes',
    colors: ['#bae6fd', '#7dd3fc', '#e0f2fe', '#ffffff'],
    particleCountDesktop: 42,
    particleCountMobile: 20
  }
};

export const VALID_SEASON_IDS = Object.keys(SEASONS);

export function detectSeasonByMonth(monthIndex = new Date().getMonth()) {
  if (monthIndex >= 2 && monthIndex <= 4) return 'spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'summer';
  if (monthIndex >= 8 && monthIndex <= 10) return 'autumn';
  return 'winter';
}
