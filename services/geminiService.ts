
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { RecipeDetails, GeminiRecipeResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  // In a real app, you might throw an error or handle this more gracefully.
  // For this example, we'll let the app attempt to run, but API calls will fail.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion as API_KEY is checked (or should be available in runtime)

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const analyzeFoodImage = async (
  imageBase64: string,
  mimeType: string,
  numberOfDishes: number
): Promise<RecipeDetails> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  }

  const prompt = `
You are an expert food analyst and recipe generator named NutriChef AI.
Analyze the provided food image. Based on the image and the specified number of servings (${numberOfDishes}), provide the following information strictly in JSON format.
The JSON object should conform to the following TypeScript interface:

interface NutrientInfo {
  name: string; // e.g., "Protein", "Total Carbohydrates", "Total Fat", "Saturated Fat", "Trans Fat", "Cholesterol", "Sodium", "Dietary Fiber", "Total Sugars", "Vitamin D", "Calcium", "Iron", "Potassium"
  amount: string; // e.g., "10.5"
  unit: string; // e.g., "g", "mg", "%"
  percentDailyValue?: string; // Optional, e.g., "20" (representing 20%)
}

interface Ingredient {
  name: string; // e.g., "Chicken Breast"
  quantity: string; // Calculated quantity FOR THE SPECIFIED ${numberOfDishes} SERVINGS, e.g., "200" if 100g per serving and ${numberOfDishes} is 2. DO NOT include formulas.
  unit: string; // e.g., "g", "ml", "pieces", "tbsp"
  notes?: string; // Optional, e.g., "skinless, boneless", "finely chopped"
}

interface RecipeDetails {
  dishName: string; // Identified dish name, e.g., "Spaghetti Carbonara"
  description?: string; // A brief, appetizing description of the dish.
  servings: number; // Echo back the number of servings: ${numberOfDishes}
  caloriesPerServing: string; // Estimated calories PER SERVING (numeric string, e.g., "450").
  totalCalories?: string; // Estimated TOTAL calories for ALL ${numberOfDishes} servings (numeric string, e.g., "900" if caloriesPerServing is 450 and ${numberOfDishes} is 2).
  nutrientsPerServing: NutrientInfo[]; // Array of key nutrients PER SERVING.
  ingredients: Ingredient[]; // Array of ingredients. Quantities MUST be calculated for ${numberOfDishes} servings.
  preparationSteps: string[]; // Step-by-step preparation guide.
  preparationTime?: string; // Estimated preparation time, e.g., "20 minutes".
  cookingTime?: string; // Estimated cooking time, e.g., "30 minutes".
}

Instructions for generating the JSON:
1.  Identify the main dish in the image. If unclear or not a food item, set dishName to "Unknown Dish" or "Not a food item" and provide a suitable description.
2.  All quantities for ingredients MUST be adjusted for ${numberOfDishes} servings. For example, if 1 serving needs 1 apple, and ${numberOfDishes} is 3, the ingredient should be { "name": "Apple", "quantity": "3", "unit": "medium" }.
3.  Provide a comprehensive list of common nutrients if possible.
4.  Ensure preparation steps are clear and easy to follow.
5.  The entire response MUST be a single JSON object matching the RecipeDetails interface. Do not include any text outside this JSON object.
`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: imageBase64,
    },
  };

  const textPart = { text: prompt };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        // Add temperature or other configs if needed for creativity/precision balance
        // temperature: 0.7 
      },
    });
    
    let jsonStr = response.text.trim();
    
    // Remove potential markdown fences (```json ... ```)
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr) as GeminiRecipeResponse;
      
      // Basic validation or transformation if needed
      if (typeof parsedData.servings !== 'number') {
        parsedData.servings = Number(parsedData.servings) || numberOfDishes;
      }
      if (parsedData.servings !== numberOfDishes) {
        console.warn(`Gemini returned servings ${parsedData.servings}, expected ${numberOfDishes}. Adjusting locally if possible or use Gemini's value.`);
        // Optionally, you could try to re-calculate if Gemini didn't adjust quantities properly,
        // but the prompt strongly asks Gemini to do this. For now, trust Gemini's output or log warning.
      }

      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError, "Raw text:", response.text);
      throw new Error("The AI's response was not in the expected recipe format. Please try again or rephrase your request if the image is complex. Raw response: " + response.text.substring(0, 200) + "...");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
        throw new Error("The Gemini API key is invalid or missing. Please check your configuration.");
    }
    throw new Error("Failed to get analysis from AI. Please check your connection or API key and try again.");
  }
  // Fix: Ensure all paths explicitly throw or return.
  // This line should be unreachable if the try/catch logic above is complete,
  // but adding it satisfies the compiler's control flow analysis.
  throw new Error("Internal error: Should not be reached in analyzeFoodImage.");
};
