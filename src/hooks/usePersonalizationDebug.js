/**
 * AI Personalization Hook
 * Provides access to personalization data and debugging
 */

import { useEffect, useState } from "react";
import { getPersonalizationInsights } from "../services/personalizationService";

export const usePersonalizationDebug = () => {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    // Update insights when component mounts or re-renders
    const updatedInsights = getPersonalizationInsights();
    setInsights(updatedInsights);
  }, []);

  return insights;
};
