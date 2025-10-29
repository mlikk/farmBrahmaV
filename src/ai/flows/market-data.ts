
'use server';

/**
 * @fileOverview Provides market data for a given location.
 *
 * - `getMarketData` - A function that fetches live crop prices and trends.
 * - `MarketDataInput` - The input type for the getMarketData function.
 * - `MarketDataOutput` - The return type for the getMarketData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketDataInputSchema = z.object({
  location: z.string().describe('The location of the farm (e.g., "Nashik, Maharashtra").'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi", "Marathi").'),
});
export type MarketDataInput = z.infer<typeof MarketDataInputSchema>;

const CropPriceSchema = z.object({
    crop: z.string().describe("The name of the crop."),
    variety: z.string().describe("A common variety of the crop for the region."),
    market: z.string().describe("The name of a major local market (mandi)."),
    price: z.number().describe("The current market price per quintal in INR."),
});

const PriceTrendSchema = z.object({
    month: z.string().describe("The abbreviated month name (e.g., 'Jan', 'Feb')."),
    price: z.number().describe("The average price for the main crop in that month in INR per quintal."),
});

const MarketDataOutputSchema = z.object({
  cropPrices: z.array(CropPriceSchema).min(8).max(12).describe("A list of 8-12 major crops relevant to the location with their current market prices."),
  mainCrop: z.string().describe("The name of the primary cash crop for the region whose price trend is being shown."),
  priceTrend: z.array(PriceTrendSchema).length(6).describe("An array of 6 months of price data for the region's main crop."),
  dataSources: z.array(z.string()).describe('A list of data sources used for the report (e.g., "Indian commodity market data", "local APMC data").')
});
export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

export async function getMarketData(
  input: MarketDataInput
): Promise<MarketDataOutput> {
  return marketDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketDataPrompt',
  input: {schema: MarketDataInputSchema},
  output: {schema: MarketDataOutputSchema},
  prompt: `You are an expert agricultural market analyst AI for India.

  Based on the provided location, generate a market data report. Use your knowledge of Indian agriculture, local markets (mandis), and current price trends.

  **IMPORTANT: The entire response, including all text and labels, MUST be in the following language: {{{language}}}.**
  For the 'month' field in the price trend data, use the standard 3-letter English abbreviation (Jan, Feb, Mar, etc.) regardless of the language.

  Location: {{{location}}}

  Your Task:
  1.  **Crop Prices**: Provide a list of 8-12 major crops grown in and around the specified location. For each crop, include a common variety, a major local market name, and the current approximate price in INR per quintal.
  2.  **Price Trend**: Identify the single most important cash crop for this region. Provide a 6-month price trend for this crop.
  3.  **Data Sources**: List the types of data sources you used to generate this report.

  **Crucially, format all currency in INR, but only return the number for the price fields, do not include the rupee symbol or commas.**
`,
});

const marketDataFlow = ai.defineFlow(
  {
    name: 'marketDataFlow',
    inputSchema: MarketDataInputSchema,
    outputSchema: MarketDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
