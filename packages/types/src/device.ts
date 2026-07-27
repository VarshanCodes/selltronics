export interface ConditionFactor {
  conditionId: string;
  label: string;
  percentageModifier: number; // e.g., -8 for minor scratches, 0 for perfect
}

export interface Model {
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  conditionFactors?: Record<string, ConditionFactor[]>;
}

export interface Brand {
  name: string;
  slug: string;
  models: Model[];
}

export interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
  brands: Brand[];
}