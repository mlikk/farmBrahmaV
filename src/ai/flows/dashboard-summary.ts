
'use server';

/**
 * @fileOverview Provides a dynamic summary for the main dashboard.
 *
 * - `getDashboardSummary` - A function that generates a location-specific dashboard summary.
 * - `DashboardSummaryInput` - The input type for the getDashboardSummary function.
 * - `DashboardSummaryOutput` - The return type for the getDashboardSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardSummaryInputSchema = z.object({
  latitude: z.number().describe('The latitude of the farm.'),
  longitude: z.number().describe('The longitude of the farm.'),
  location: z.string().describe('The location of the farm (e.g., "Nashik, Maharashtra").'),
  farmArea: z.string().describe('The total area of the farm in acres.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi", "Marathi").'),
});
export type DashboardSummaryInput = z.infer<typeof DashboardSummaryInputSchema>;

const DashboardSummaryOutputSchema = z.object({
  topProfitableCrop: z.object({
    crop: z.string().describe('The most profitable crop suggestion for the area.'),
    reason: z.string().describe('A brief reason why this crop is profitable (e.g., high demand, suitable climate).'),
  }),
  marketTrend: z.object({
    trend: z.string().describe('A key market trend for the region (e.g., "Pulses Up", "Vegetable prices stable").'),
    reason: z.string().describe('A brief explanation of the market trend.'),
  }),
  weatherAlert: z.object({
    alert: z.string().describe('A brief, actionable weather alert (e.g., "Heatwave Expected", "Heavy Rain Forecast").'),
    advice: z.string().describe('A short piece of advice related to the weather alert (e.g., "Next 3 days, take precautions", "Ensure proper drainage").'),
  }),
  marketUpdates: z.array(z.object({
    crop: z.string().describe("Name of the crop."),
    price: z.string().describe("The current market price, formatted as '₹X,XXX/quintal'."),
    change: z.string().describe("The percentage change, formatted as '+X.X%' or '-X.X%'."),
    status: z.enum(["success", "destructive"]).describe("'success' for price up, 'destructive' for price down."),
  })).describe('A list of 4-5 key market price updates for crops relevant to the location.'),
  dataSources: z.array(z.string()).describe('A list of data sources used for the summary (e.g., "Indian commodity market data", "regional weather APIs").')
});
export type DashboardSummaryOutput = z.infer<typeof DashboardSummaryOutputSchema>;

export async function getDashboardSummary(
  input: DashboardSummaryInput
): Promise<DashboardSummaryOutput> {
  return dashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardSummaryPrompt',
  input: {schema: DashboardSummaryInputSchema},
  output: {schema: DashboardSummaryOutputSchema},
  prompt: `You are an expert agricultural AI assistant for India.

  Based on the provided farm location and area, generate a concise summary for a dashboard. Use your knowledge of Indian agriculture, current market conditions, and weather patterns for the given coordinates.

  Farm Location: {{{location}}} (Lat: {{{latitude}}}, Lon: {{{longitude}}})
  Farm Area: {{{farmArea}}} acres

  **IMPORTANT: The entire response, including all text and labels, MUST be in the following language: {{{language}}}.**

  Generate the following information:
  1.  **Top Profitable Crop**: Suggest one crop that would be most profitable. Provide a very short reason.
  2.  **Market Trend**: Identify one significant, current market trend for the region.
  3.  **Weather Alert**: Provide one actionable weather alert based on the forecast for the next 5-7 days.
  4.  **Market Updates**: Provide a list of 4-5 relevant crop market prices for the local area. Determine if the price is generally up or down recently and set the status accordingly.
  5.  **Data Sources**: List the types of data sources you used to generate this summary.

  The response should be brief, punchy, and suitable for display in small dashboard cards. **Crucially, format all currency in INR with the rupee symbol (₹) and use Indian numbering system commas (e.g., ₹1,00,000).**
`,
});

const dashboardSummaryFlow = ai.defineFlow(
  {
    name: 'dashboardSummaryFlow',
    inputSchema: DashboardSummaryInputSchema,
    outputSchema: DashboardSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
