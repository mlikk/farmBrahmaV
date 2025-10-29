
'use server';

/**
 * @fileOverview Provides environmental data for a given location.
 *
 * - `getEnvironmentalData` - A function that fetches weather and soil conditions.
 * - `EnvironmentalDataInput` - The input type for the getEnvironmentalData function.
 * - `EnvironmentalDataOutput` - The return type for the getEnvironmentalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnvironmentalDataInputSchema = z.object({
  latitude: z.number().describe('The latitude of the farm.'),
  longitude: z.number().describe('The longitude of the farm.'),
  language: z.string().describe('The language for the response (e.g., "English", "Hindi", "Marathi").'),
});
export type EnvironmentalDataInput = z.infer<typeof EnvironmentalDataInputSchema>;

const WeatherDataSchema = z.object({
    temperature: z.string().describe("The current temperature in Celsius (e.g., '32°C')."),
    feelsLike: z.string().describe("The 'feels like' temperature in Celsius (e.g., '35°C')."),
    humidity: z.string().describe("The current humidity percentage (e.g., '65%')."),
    humidityDescription: z.string().describe("A brief description of the humidity (e.g., 'High humidity')."),
    windSpeed: z.string().describe("The current wind speed in km/h (e.g., '12 km/h')."),
    windDirection: z.string().describe("The direction from which the wind is blowing (e.g., 'From South-West')."),
    uvIndex: z.string().describe("The current UV index value and its category (e.g., '9 (Very High)')."),
    uvIndexAdvice: z.string().describe("A short piece of advice related to the UV index (e.g., 'Sun protection needed')."),
});

const SoilConditionSchema = z.object({
    moisture: z.string().describe("The soil moisture percentage (e.g., '45%')."),
    moistureAdvice: z.string().describe("A brief comment on the moisture level (e.g., 'Optimal for current crops')."),
    ph: z.string().describe("The pH level of the soil (e.g., '6.8')."),
    phAdvice: z.string().describe("A brief comment on the pH level (e.g., 'Slightly acidic')."),
    nitrogen: z.string().describe("The nitrogen level in the soil in kg/ha (e.g., '120 kg/ha')."),
    nitrogenAdvice: z.string().describe("A brief comment on the nitrogen level (e.g., 'Sufficient')."),
    potassium: z.string().describe("The potassium level in the soil in kg/ha (e.g., '150 kg/ha')."),
    potassiumAdvice: z.string().describe("A brief comment on the potassium level (e.g., 'Good levels')."),
});

const RainfallDataSchema = z.object({
    month: z.string().describe("The abbreviated month name (e.g., 'Jan', 'Feb')."),
    rainfall: z.number().describe("The average rainfall for that month in millimeters."),
});

const EnvironmentalDataOutputSchema = z.object({
  weather: WeatherDataSchema,
  soil: SoilConditionSchema,
  rainfall: z.array(RainfallDataSchema).length(12).describe("An array of 12 months of average rainfall data for the region."),
  dataSources: z.array(z.string()).describe('A list of data sources used for the report (e.g., "regional weather APIs", "soil databases").')
});
export type EnvironmentalDataOutput = z.infer<typeof EnvironmentalDataOutputSchema>;

export async function getEnvironmentalData(
  input: EnvironmentalDataInput
): Promise<EnvironmentalDataOutput> {
  return environmentalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'environmentalDataPrompt',
  input: {schema: EnvironmentalDataInputSchema},
  output: {schema: EnvironmentalDataOutputSchema},
  prompt: `You are an expert agrometeorologist AI for India.

  Based on the provided geographical coordinates, provide a detailed environmental data report. Use your knowledge base of Indian weather patterns, climate, and soil types for the specific region.

  **IMPORTANT: The entire response, including all text and labels, MUST be in the following language: {{{language}}}.**
  For the 'month' field in the rainfall data, use the standard 3-letter English abbreviation (Jan, Feb, Mar, etc.) regardless of the language.

  Coordinates:
  - Latitude: {{{latitude}}}
  - Longitude: {{{longitude}}}

  Your Task:
  Generate a comprehensive environmental report with the following sections:
  1.  **Current Weather**: Provide the current temperature, 'feels like' temperature, humidity, wind speed, wind direction, and UV index with a brief piece of advice.
  2.  **Soil Conditions**: Provide the typical soil moisture, pH, Nitrogen (N) level, and Potassium (K) level for the area, each with a brief advisory comment.
  3.  **Annual Rainfall**: Provide an array of 12 objects, one for each month (Jan-Dec), showing the typical average monthly rainfall in millimeters.
  4.  **Data Sources**: List the types of data sources you used to generate this report.
  
  The data should be realistic for the given location in India.
`,
});

const environmentalDataFlow = ai.defineFlow(
  {
    name: 'environmentalDataFlow',
    inputSchema: EnvironmentalDataInputSchema,
    outputSchema: EnvironmentalDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
