
'use server';

/**
 * @fileOverview Provides planting recommendations based on market trends, social data, and environmental factors.
 *
 * - profitabilityForecast - A function that generates planting recommendations for farmers.
 * - ProfitabilityForecastInput - The input type for the profitabilityForecast function.
 * - ProfitabilityForecastOutput - The return type for the profitabilityForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfitabilityForecastInputSchema = z.object({
  latitude: z.number().optional().describe('The latitude of the farm.'),
  longitude: z.number().optional().describe('The longitude of the farm.'),
  location: z.string().describe('The location of the farm.'),
  soilType: z.string().describe('The type of soil on the farm.'),
  farmArea: z.string().describe('The total area of the farm in acres.'),
  waterSource: z.string().describe('The primary source of water for the farm.'),
  historicalData: z.string().optional().describe('Historical planting and profit data for the farm, if available.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi", "Marathi").'),
  farmBoundary: z.any().optional().describe('A GeoJSON object representing the farm boundary.'),
});
export type ProfitabilityForecastInput = z.infer<typeof ProfitabilityForecastInputSchema>;

const ProfitabilityForecastOutputSchema = z.object({
  recommendations: z.array(z.object({
      crop: z.string().describe('The recommended crop to plant.'),
      estimatedProfit: z.string().describe('The estimated profit from this crop in INR, formatted as "₹X,XX,XXX".'),
      marketingStrategies: z.array(z.string()).describe('A list of 2-3 actionable marketing strategies to achieve the estimated profit.'),
      marketOptions: z.array(z.string()).describe('A list of 2-3 potential market options, like local companies, export markets, or government schemes.'),
    })).describe('A list of planting recommendations with profit estimates, marketing strategies, and market options.'),
  reasoning: z.string().describe('A summary rationale for the overall recommendations.'),
  dataSources: z.array(z.string()).describe('A list of data sources used for the forecast.'),
});
export type ProfitabilityForecastOutput = z.infer<typeof ProfitabilityForecastOutputSchema>;

export async function profitabilityForecast(input: ProfitabilityForecastInput): Promise<ProfitabilityForecastOutput>
{
  return profitabilityForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profitabilityForecastPrompt',
  input: {schema: ProfitabilityForecastInputSchema},
  output: {schema: ProfitabilityForecastOutputSchema},
  prompt: `You are an expert agricultural and marketing advisor in India. Based on the following farm details, provide 2-3 planting recommendations and their estimated profits, along with actionable advice on how to sell the produce.

  **Farm Details:**
  - Location: {{{location}}}
  - Soil Type: {{{soilType}}}
  - Farm Area: {{{farmArea}}} acres
  - Water Source: {{{waterSource}}}

  **IMPORTANT: The entire response, including all text and labels, MUST be in the following language: {{{language}}}.**

  **Farm Coordinates (if provided):**
  {{#if latitude}}
  - Latitude: {{{latitude}}}
  - Longitude: {{{longitude}}}
  Use these precise coordinates to infer detailed local conditions like climate, proximity to markets, and regional economic trends to improve the accuracy of your forecast and marketing advice.
  {{/if}}

  {{#if farmBoundary}}
  **Farm Boundary:**
  - {{{farmBoundary}}}
  Use the precise farm boundary GeoJSON for more accurate spatial analysis of the area.
  {{/if}}

  {{#if historicalData}}
  **Historical Data:**
  - {{{historicalData}}}
  {{/if}}

  Your Task:
  1.  Generate 2-3 crop recommendations suitable for the given details.
  2.  For each recommendation, provide:
      a.  An estimated potential profit in Indian Rupees (INR).
      b.  A list of 2-3 specific, actionable 'marketingStrategies' (e.g., "Tie-up with local hotels", "Focus on organic certification and export").
      c.  A list of 2-3 'marketOptions' which are potential sales channels (e.g., "Local APMC Mandi", "Reliance Fresh", "ITC e-Choupal", "Direct export to Middle East").
  3.  Provide a concise 'reasoning' for your overall recommendations.
  4.  Provide a 'dataSources' list of the types of data you used for this analysis (e.g., "Indian commodity market data", "regional agricultural advisories", "soil and climate databases").

  Consider all factors, especially current market demand, supply chain, and value-addition opportunities. **Crucially, format all currency in INR with the rupee symbol (₹) and use the Indian numbering system for commas (e.g., ₹1,00,000).**
`,
});

const profitabilityForecastFlow = ai.defineFlow(
  {
    name: 'profitabilityForecastFlow',
    inputSchema: ProfitabilityForecastInputSchema,
    outputSchema: ProfitabilityForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
