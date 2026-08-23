export const portfolioCategories = [
  "Commercials",
  "Real Estate",
  "Documentary",
  "Explainer Videos",
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number];
