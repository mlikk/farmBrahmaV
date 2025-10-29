
'use server';

/**
 * @fileOverview Infers farm details like soil type and water source from a location.
 *
 * - getFarmDetailsFromLocation - A function that infers farm details from a location.
 * - FarmDetailsInput - The input type for the getFarmDetailsFromLocation function.
 * - FarmDetailsOutput - The return type for the getFarmDetailsFromLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmDetailsInputSchema = z.object({
  location: z.string().describe('The city and state of the farm in India. e.g., "Nashik, Maharashtra"'),
});
export type FarmDetailsInput = z.infer<typeof FarmDetailsInputSchema>;

const FarmDetailsOutputSchema = z.object({
  soilType: z.string().describe('The most common soil type in the given location.'),
  waterSource: z.string().describe('The most common primary water source for agriculture in the given location (e.g., Rain-fed, Canal, Borewell).'),
});
export type FarmDetailsOutput = z.infer<typeof FarmDetailsOutputSchema>;


export async function getFarmDetailsFromLocation(
  input: FarmDetailsInput
): Promise<FarmDetailsOutput> {
  return farmDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmDetailsPrompt',
  input: {schema: FarmDetailsInputSchema},
  output: {schema: FarmDetailsOutputSchema},
  prompt: `You are an expert agricultural researcher for India.

  Based on the provided location, identify the most common soil type and the most common primary water source for farms in that area.

  Location: {{{location}}}

  Provide only the most common soil type and water source. For water source, choose one from: Rain-fed, Canal, Borewell/Tubewell, River/Lift Irrigation, Pond/Tank.
`,
});

const farmDetailsFlow = ai.defineFlow(
  {
    name: 'farmDetailsFlow',
    inputSchema: FarmDetailsInputSchema,
    outputSchema: FarmDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
