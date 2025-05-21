
export interface NutrientInfo {
  name: string;
  amount: string;
  unit: string;
  percentDailyValue?: string; // Optional: if API provides it
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string; // Optional: e.g., "finely chopped"
}

export interface RecipeDetails {
  dishName: string;
  description?: string;
  servings: number;
  caloriesPerServing: string; 
  totalCalories?: string;
  nutrientsPerServing: NutrientInfo[];
  ingredients: Ingredient[];
  preparationSteps: string[];
  preparationTime?: string;
  cookingTime?: string;
}

// To be used by Gemini Service for its expected JSON output structure
export interface GeminiRecipeResponse extends RecipeDetails {}
