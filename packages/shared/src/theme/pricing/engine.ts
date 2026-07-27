// These exact modifiers are from your master project specification
export const CONDITION_MODIFIERS: Record<string, Record<string, number>> = {
  screen: { perfect: 0, minor_scratches: -8, cracked: -25 },
  battery: { above90: 0, 80to90: -5, below80: -12 },
  body: { perfect: 0, minor_dents: -5, major_damage: -15 },
  functions: { all_working: 0, minor_issue: -10, major_issue: -25 },
  accessories: { all_included: 2, only_phone: 0, nothing: -3 }
};

export function calculatePrice(
  basePrice: number,
  conditionAnswers: Record<string, string>
): number {
  let finalPrice = basePrice;

  // Loop through each answer the user provided
  for (const [category, answer] of Object.entries(conditionAnswers)) {
    // Look up the percentage modifier (default to 0 if not found)
    const modifierPercentage = CONDITION_MODIFIERS[category]?.[answer] || 0;
    
    // Calculate how much money to add or subtract based on the base price
    const adjustment = basePrice * (modifierPercentage / 100);
    finalPrice += adjustment;
  }

  // Safety floor: Never go below 10% of the basePrice
  const minimumFloor = basePrice * 0.10;

  // Return the highest value between the calculated price and the floor, rounded to nearest Rupee
  return Math.max(Math.round(finalPrice), Math.round(minimumFloor));
}