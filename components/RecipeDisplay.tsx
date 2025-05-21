import React from 'react';
import type { RecipeDetails, NutrientInfo, Ingredient } from '../types';

interface NutrientCardProps {
  nutrient: NutrientInfo;
}

const NutrientCard: React.FC<NutrientCardProps> = ({ nutrient }) => (
  <div className="bg-primary/10 p-4 rounded-xl shadow text-center">
    <p className="text-sm font-medium text-primary">{nutrient.name}</p>
    <p className="text-xl font-semibold text-textPrimary">
      {nutrient.amount}{nutrient.unit}
    </p>
    {nutrient.percentDailyValue && (
      <p className="text-xs text-textSecondary">{nutrient.percentDailyValue}% DV</p>
    )}
  </div>
);

interface RecipeDisplayProps {
  details: RecipeDetails;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ details }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="pb-4 border-b-2 border-primary">
        <h2 className="text-4xl font-bold text-primary tracking-tight">{details.dishName}</h2>
        {details.description && (
          <p className="mt-2 text-textSecondary text-lg">{details.description}</p>
        )}
      </header>

      {/* Quick Info Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-background p-3 rounded-lg shadow-sm">
          <p className="text-xs text-textSecondary uppercase font-semibold">Servings</p>
          <p className="text-lg font-bold text-primary">{details.servings}</p>
        </div>
        <div className="bg-background p-3 rounded-lg shadow-sm">
          <p className="text-xs text-textSecondary uppercase font-semibold">Prep Time</p>
          <p className="text-lg font-bold text-primary">{details.preparationTime || 'N/A'}</p>
        </div>
        <div className="bg-background p-3 rounded-lg shadow-sm">
          <p className="text-xs text-textSecondary uppercase font-semibold">Cook Time</p>
          <p className="text-lg font-bold text-primary">{details.cookingTime || 'N/A'}</p>
        </div>
        <div className="bg-background p-3 rounded-lg shadow-sm">
          <p className="text-xs text-textSecondary uppercase font-semibold">Calories/Serving</p>
          <p className="text-lg font-bold text-primary">{details.caloriesPerServing || 'N/A'}</p>
        </div>
      </div>
      
      {details.totalCalories && (
        <div className="text-center mt-2">
            <p className="text-sm text-textSecondary">Total Calories for {details.servings} servings: <span className="font-bold text-primary">{details.totalCalories}</span></p>
        </div>
      )}

      {/* Nutrients Section */}
      <section>
        <h3 className="text-2xl font-semibold text-textPrimary mb-4">Nutritional Information <span className="text-sm text-textSecondary">(per serving)</span></h3>
        {details.nutrientsPerServing && details.nutrientsPerServing.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {details.nutrientsPerServing.map((nutrient) => (
              <NutrientCard key={nutrient.name} nutrient={nutrient} />
            ))}
          </div>
        ) : (
          <p className="text-textSecondary">No detailed nutrient information available.</p>
        )}
      </section>

      {/* Ingredients Section */}
      <section>
        <h3 className="text-2xl font-semibold text-textPrimary mb-4">Ingredients <span className="text-sm text-textSecondary">(for {details.servings} servings)</span></h3>
        {details.ingredients && details.ingredients.length > 0 ? (
          <ul className="space-y-2 list-disc list-inside pl-2 bg-primary/5 p-4 rounded-lg">
            {details.ingredients.map((ingredient: Ingredient, index: number) => (
              <li key={index} className="text-textPrimary">
                <span className="font-medium">{ingredient.name}:</span> {ingredient.quantity} {ingredient.unit}
                {ingredient.notes && <span className="text-sm text-textSecondary italic"> ({ingredient.notes})</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-textSecondary">No ingredients list available.</p>
        )}
      </section>

      {/* Preparation Steps Section */}
      <section>
        <h3 className="text-2xl font-semibold text-textPrimary mb-4">Preparation Steps</h3>
        {details.preparationSteps && details.preparationSteps.length > 0 ? (
          <ol className="space-y-3 list-decimal list-outside pl-6 bg-primary/5 p-4 rounded-lg">
            {details.preparationSteps.map((step: string, index: number) => (
              <li key={index} className="text-textPrimary leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-textSecondary">No preparation steps available.</p>
        )}
      </section>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}
      </style>
    </div>
  );
};