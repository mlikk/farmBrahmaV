
// src/ai/flows/personalized-planting-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized planting recommendations based on location and a comprehensive analysis of various agricultural parameters.
 *
 * - `getPersonalizedRecommendations` -  A function that retrieves tailored planting recommendations with risk analysis.
 * - `PersonalizedRecommendationsInput` - The input type for the `getPersonalizedRecommendations` function.
 * - `PersonalizedRecommendationsOutput` - The return type for the `getPersonalizedRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the farm.'),
  longitude: z.number().describe('The longitude of the farm.'),
  location: z.string().describe('The location of the farm.'),
  soilType: z.string().describe('The type of soil on the farm.'),
  farmArea: z.string().describe('The total area of the farm in acres.'),
  waterSource: z.string().describe('The primary source of water for the farm.'),
  historicalData: z.string().optional().describe('Optional historical data of crops planted and yields.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a plant or farm site, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi", "Marathi").'),
  farmBoundary: z.any().optional().describe('A GeoJSON object representing the farm boundary.'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const RiskAnalysisSchema = z.object({
    rating: z.enum(["Low", "Medium", "High"]).describe("The overall risk rating for this category."),
    remarks: z.string().describe("Brief remarks explaining the risk rating."),
});

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.object({
    crop: z.string().describe('The recommended crop to plant.'),
    variety: z.string().describe('The suggested variety of the crop.'),
    area: z.string().describe('The recommended area to allocate for this crop in acres.'),
    reasoning: z.string().describe('A summary explaining why this crop is a strong recommendation for the given conditions.'),
    riskAnalysis: z.object({
        climatic: RiskAnalysisSchema.describe("Risk analysis based on climatic factors like temperature, rainfall, light, and wind."),
        soil: RiskAnalysisSchema.describe("Risk analysis based on soil factors like type, fertility, pH, and drainage."),
        biological: RiskAnalysisSchema.describe("Risk analysis based on biological factors like common pests, weeds, and diseases in the region."),
        agronomic: RiskAnalysisSchema.describe("Risk analysis based on agronomic factors like sowing time, irrigation needs, and crop rotation benefits."),
        socioEconomic: RiskAnalysisSchema.describe("Risk analysis based on socio-economic factors like market prices, labor availability, and government policies.")
    })
  })).describe('A list of personalized planting recommendations with detailed risk analysis.'),
  dataSources: z.array(z.string()).describe('A list of data sources used for the recommendations and risk analysis.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedPlantingRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedPlantingRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a world-class agricultural AI advisor for farmers in India. Your goal is to provide highly specific, actionable planting recommendations based on a holistic analysis of the provided farm data.

  **Farm Coordinates:**
  - Latitude: {{{latitude}}}
  - Longitude: {{{longitude}}}

  **Farm Details:**
  - Location: {{{location}}}
  - Soil Type: {{{soilType}}}
  - Farm Area: {{{farmArea}}} acres
  - Water Source: {{{waterSource}}}
  - Historical Data: {{{historicalData}}}
  {{#if photoDataUri}}- Photo of the site: {{media url=photoDataUri}}{{/if}}
  
  {{#if farmBoundary}}
  **Farm Boundary:**
  - {{{farmBoundary}}}
  Use the precise farm boundary GeoJSON for more accurate spatial analysis of the area.
  {{/if}}

  **IMPORTANT: The entire response, including all text and labels, MUST be in the following language: {{{language}}}.**

  **Your Task:**
  Based **only** on the coordinates and farm details, generate 2-3 crop recommendations. For each recommendation, you must perform a comprehensive risk analysis across several categories. Use your extensive knowledge base to infer the conditions for the given coordinates.

  **Analysis Parameters (to be inferred by you from the coordinates):**
  1.  **Climatic:** Analyze temperature, rainfall patterns, sunlight hours, and wind conditions.
  2.  **Soil:** Based on the given soil type, infer typical fertility, pH, and drainage characteristics for the region.
  3.  **Biological:** Identify common pests, weeds, and diseases prevalent in this specific geographic area.
  4.  **Agronomic:** Consider optimal sowing times, typical irrigation requirements, fertilization needs, and crop rotation benefits.
  5.  **Socio-economic/Policy:** Factor in current market demand and price trends, labor availability, relevant government subsidies or schemes, and potential impacts of climate change for that region.

  **Output Format:**
  For each recommended crop, provide:
  - The crop name and a suitable variety.
  - The recommended planting area in acres (the total should not exceed the farm area).
  - A summary 'reasoning' for the recommendation.
  - A 'riskAnalysis' object containing a risk rating ("Low", "Medium", "High") and brief 'remarks' for each of the five parameter categories (climatic, soil, biological, agronomic, socioEconomic).
  - A 'dataSources' list of the types of data you used for this analysis (e.g., "Indian commodity market data", "regional agricultural advisories", "soil and climate databases").

  The final output must be in the specified JSON format. Be thorough, precise, and practical in your analysis.
`,
});

const personalizedPlantingRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedPlantingRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    // These values are now inferred by the AI based on coordinates, so we pass placeholders.
    const augmentedInput = {
      ...input,
      marketData: 'inferred by AI',
      socialData: 'inferred by AI',
      environmentalData: 'inferred by AI',
    };
    const {output} = await prompt(augmentedInput);
    return output!;
  }
);
