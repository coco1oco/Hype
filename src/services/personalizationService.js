/**
 * AI Personalization Service
 * Tracks user interactions and generates personalized event recommendations
 */

const STORAGE_KEY = "hype_user_profile";
const INTERACTION_KEY = "hype_interactions";
const MAX_INTERACTIONS = 100;

/**
 * Initialize or retrieve user profile
 */
export const getUserProfile = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const newProfile = {
    createdAt: new Date().toISOString(),
    categoryScores: {}, // { category: score }
    tagScores: {}, // { tag: score }
    venueTypeScores: {}, // { venueType: score }
    eventInterests: [], // array of event ids user has viewed
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  return newProfile;
};

/**
 * Get user interaction history
 */
export const getInteractionHistory = () => {
  const saved = localStorage.getItem(INTERACTION_KEY);
  return saved ? JSON.parse(saved) : [];
};

/**
 * Record user interaction (view, click, favorite, etc.)
 */
export const recordInteraction = (
  eventId,
  eventData,
  interactionType = "view"
) => {
  const history = getInteractionHistory();

  const interaction = {
    eventId,
    type: interactionType, // 'view', 'favorite', 'purchase', 'click'
    timestamp: new Date().toISOString(),
    category: eventData?.category,
    tags: eventData?.tags || [],
    venueType: eventData?.venueType,
    hypeScore: eventData?.hypeScore,
  };

  history.push(interaction);

  // Keep only last N interactions
  if (history.length > MAX_INTERACTIONS) {
    history.shift();
  }

  localStorage.setItem(INTERACTION_KEY, JSON.stringify(history));

  // Update user profile with weighted scores
  updateUserProfile(interaction);
};

/**
 * Update user profile scores based on interaction
 */
export const updateUserProfile = (interaction) => {
  const profile = getUserProfile();
  const weights = {
    view: 1,
    click: 1.5,
    favorite: 3,
    purchase: 5,
  };

  const weight = weights[interaction.type] || 1;

  // Update category score
  if (interaction.category) {
    profile.categoryScores[interaction.category] =
      (profile.categoryScores[interaction.category] || 0) + weight;
  }

  // Update tag scores
  if (interaction.tags && Array.isArray(interaction.tags)) {
    interaction.tags.forEach((tag) => {
      profile.tagScores[tag] = (profile.tagScores[tag] || 0) + weight * 0.8;
    });
  }

  // Update venue type score
  if (interaction.venueType) {
    profile.venueTypeScores[interaction.venueType] =
      (profile.venueTypeScores[interaction.venueType] || 0) + weight * 0.6;
  }

  // Track event interest
  if (!profile.eventInterests.includes(interaction.eventId)) {
    profile.eventInterests.push(interaction.eventId);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

/**
 * Calculate recommendation score for an event
 */
export const calculateEventScore = (event, profile) => {
  let score = 0;

  // Category match (0-3 points)
  const categoryScore = profile.categoryScores[event.category] || 0;
  score += Math.min(categoryScore * 0.3, 3);

  // Tag matches (0-3 points)
  if (event.tags && Array.isArray(event.tags)) {
    const tagScore = event.tags.reduce((sum, tag) => {
      return sum + (profile.tagScores[tag] || 0);
    }, 0);
    score += Math.min(tagScore * 0.1, 3);
  }

  // Venue type match (0-1 point)
  const venueScore = profile.venueTypeScores[event.venueType] || 0;
  score += Math.min(venueScore * 0.2, 1);

  // Hype score bonus (0-1 point)
  if (event.hypeScore) {
    score += (event.hypeScore / 100) * 1;
  }

  // Recency bonus (0-0.5 points)
  if (event.metrics?.recency) {
    score += event.metrics.recency * 0.5;
  }

  // Penalize already viewed events (slight reduction)
  if (profile.eventInterests.includes(event.id)) {
    score *= 0.7;
  }

  return Math.max(0, score);
};

/**
 * Get personalized recommendations for a user
 */
export const getPersonalizedRecommendations = (allEvents, count = 3) => {
  const profile = getUserProfile();

  // If no profile data yet, return high-hype events
  if (Object.keys(profile.categoryScores).length === 0) {
    return allEvents
      .sort((a, b) => (b.hypeScore || 0) - (a.hypeScore || 0))
      .slice(0, count);
  }

  // Score all events and sort
  const scored = allEvents.map((event) => ({
    event,
    score: calculateEventScore(event, profile),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.event);
};

/**
 * Reset user personalization data (for testing)
 */
export const resetPersonalizationData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(INTERACTION_KEY);
};

/**
 * Get personalization insights for debugging
 */
export const getPersonalizationInsights = () => {
  const profile = getUserProfile();
  const history = getInteractionHistory();

  return {
    profile,
    history,
    topCategories: Object.entries(profile.categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    topTags: Object.entries(profile.tagScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    totalInteractions: history.length,
    viewedEvents: profile.eventInterests.length,
  };
};
