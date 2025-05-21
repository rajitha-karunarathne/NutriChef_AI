import React, { useState, useCallback } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { DishCountInput } from './components/DishCountInput';
import { RecipeDisplay } from './components/RecipeDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { analyzeFoodImage } from './services/geminiService';
import type { RecipeDetails } from './types';

const App: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [numberOfDishes, setNumberOfDishes] = useState<number>(1);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Get base64 part
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setRecipeDetails(null); // Clear previous results
    setError(null); // Clear previous errors
    try {
      const base64 = await convertFileToBase64(file);
      setImageBase64(base64);
    } catch (err) {
      console.error("Error converting file to base64:", err);
      setError("Failed to process image. Please try another one.");
      setImageBase64(null);
      setImagePreviewUrl(null);
      setUploadedFile(null);
    }
  }, []);

  const handleDishCountChange = useCallback((count: number) => {
    setNumberOfDishes(Math.max(1, count)); // Ensure count is at least 1
  }, []);

  const handleSubmit = async () => {
    if (!uploadedFile || !imageBase64) {
      setError("Please upload an image first.");
      return;
    }
    if (numberOfDishes < 1) {
        setError("Number of dishes must be at least 1.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setRecipeDetails(null);

    try {
      const result = await analyzeFoodImage(imageBase64, uploadedFile.type, numberOfDishes);
      setRecipeDetails(result);
    } catch (err) {
      console.error("Error analyzing food image:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
      setRecipeDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-primary to-primaryDarker py-8 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          NutriChef <span className="text-accent">AI</span>
        </h1>
        <p className="mt-3 text-xl text-blue-100 max-w-2xl mx-auto">
          Upload a food image, tell us how many servings, and get instant nutritional insights and recipes!
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-card shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-3xl font-semibold text-textPrimary mb-6 border-b-2 border-primary pb-2">Analyze Your Meal</h2>
          <ImageUpload onImageUpload={handleImageUpload} previewUrl={imagePreviewUrl} />
          {imagePreviewUrl && (
            <DishCountInput value={numberOfDishes} onChange={handleDishCountChange} />
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !uploadedFile}
            className="w-full bg-primary hover:bg-primaryDarker text-white font-semibold py-3 px-6 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner /> : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Analyze Food
              </>
            )}
          </button>
          {error && !isLoading && <ErrorMessage message={error} />}
        </div>

        {/* Output Section */}
        <div className="bg-card shadow-xl rounded-2xl p-6 sm:p-8 lg:col-span-1">
          {isLoading && !recipeDetails && (
             <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <LoadingSpinner size="lg" color="text-primary"/>
                <p className="text-textSecondary mt-4 text-lg">Analyzing your image... This may take a moment.</p>
             </div>
          )}
          {!isLoading && !recipeDetails && !error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v11.494m0 0A7.5 7.5 0 1012 6.253zM21.75 12H2.25" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21.75A7.5 7.5 0 0012 12m0 0C6.75 12 2.25 16.5 2.25 21.75M16.5 2.25A7.5 7.5 0 0012 12m0 0c5.25 0 9.75-4.5 9.75-9.75" />
              </svg>
              <h3 className="text-2xl font-semibold text-textPrimary">Your Culinary Insights Await</h3>
              <p className="text-textSecondary mt-2">Upload an image and set servings to get started.</p>
            </div>
          )}
          {recipeDetails && <RecipeDisplay details={recipeDetails} />}
        </div>
      </main>
      <footer className="text-center mt-12 pb-8">
        <p className="text-blue-100 text-sm">
          Powered by AI. Nutritional information is an estimate.
        </p>
      </footer>
    </div>
  );
};

export default App;