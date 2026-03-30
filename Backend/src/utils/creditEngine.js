

export const LEVELS = [
  { name: "Legend",   minXP: 6000, badge: "🏆", color: "#FFD700" },
  { name: "Mentor",   minXP: 3500, badge: "🎓", color: "#C084FC" },
  { name: "Pro",      minXP: 2000, badge: "⚡", color: "#60A5FA" },
  { name: "Achiever", minXP: 1000, badge: "🌟", color: "#34D399" },
  { name: "Explorer", minXP: 500,  badge: "🧭", color: "#FB923C" },
  { name: "Learner",  minXP: 200,  badge: "📚", color: "#A78BFA" },
  { name: "Beginner", minXP: 0,    badge: "🌱", color: "#94A3B8" },
];

/**
 * Returns the level object for a given XP amount.
 */
export const getLevelForXP = (xp) => {
  return LEVELS.find((l) => xp >= l.minXP) || LEVELS[LEVELS.length - 1];
};

/**
 * Returns the next level object (or null if already Legend).
 */
export const getNextLevel = (currentLevelName) => {
  const idx = LEVELS.findIndex((l) => l.name === currentLevelName);
  if (idx <= 0) return null;
  return LEVELS[idx - 1];
};

/**
 * Calculates XP earned from a completed session based on rating.
 *
 * Base XP per session  : 50
 * Rating bonus (1-5★)  : rating * 20  → max +100 for 5★
 * Perfect session (5★) : extra 30 bonus
 *
 * Range: 70 (1★) → 200 (5★)
 */
export const calculateSessionXP = (rating) => {
  if (!rating || rating < 1 || rating > 5) return 50;
  const base         = 50;
  const ratingBonus  = Math.round(rating) * 20;
  const perfectBonus = Math.round(rating) === 5 ? 30 : 0;
  return base + ratingBonus + perfectBonus;
};

/**
 * Mutates the user object: adds XP, updates level & badge.
 * Returns { xpAdded, oldLevel, newLevel, leveledUp }
 */
export const addXP = (user, xpToAdd) => {
  const oldLevel    = user.level || "Beginner";
  user.xp           = (user.xp || 0) + xpToAdd;
  const newLevelObj = getLevelForXP(user.xp);
  user.level        = newLevelObj.name;
  user.badge        = newLevelObj.badge;
  user.badgeColor   = newLevelObj.color;

  return {
    xpAdded:   xpToAdd,
    oldLevel,
    newLevel:  newLevelObj.name,
    leveledUp: oldLevel !== newLevelObj.name,
  };
};

/**
 * Returns XP progress info towards next level.
 */
export const getXPProgress = (xp, levelName) => {
  const currentLevelObj =
    LEVELS.find((l) => l.name === levelName) || LEVELS[LEVELS.length - 1];
  const nextLevelObj = getNextLevel(levelName);

  if (!nextLevelObj) {
    return {
      current:    xp,
      required:   currentLevelObj.minXP,
      percentage: 100,
      nextLevel:  null,
    };
  }

  const earned     = xp - currentLevelObj.minXP;
  const needed     = nextLevelObj.minXP - currentLevelObj.minXP;
  const percentage = Math.min(100, Math.round((earned / needed) * 100));

  return {
    current:   earned,
    required:  needed,
    percentage,
    nextLevel: nextLevelObj.name,
    nextBadge: nextLevelObj.badge,
  };
};