
"use server";

import { z } from "zod";
import { profitabilityForecast as profitabilityForecastFlow } from "@/ai/flows/profitability-forecast";
import { getPersonalizedRecommendations as getPersonalizedRecommendationsFlow } from "@/ai/flows/personalized-planting-recommendations";
import { getFarmDetailsFromLocation } from "@/ai/flows/farm-details-from-location";
import { getDashboardSummary as getDashboardSummaryFlow, DashboardSummaryInput, DashboardSummaryOutput } from "@/ai/flows/dashboard-summary";
import { getEnvironmentalData as getEnvironmentalDataFlow, EnvironmentalDataInput, EnvironmentalDataOutput } from "@/ai/flows/environmental-data";
import { getMarketData as getMarketDataFlow, MarketDataInput, MarketDataOutput } from "@/ai/flows/market-data";


const profitabilitySchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  location: z.string().min(1, "Location is required."),
  soilType: z.string().min(1, "Soil type is required."),
  farmArea: z.string().min(1, "Farm area is required."),
  waterSource: z.string().optional(),
  historicalData: z.string().optional(),
  language: z.string(),
  farmBoundary: z.string().optional(),
});

export async function getProfitabilityForecast(
    prevState: { result: any, errors: any, pending: boolean }, 
    formData: FormData
) {
  const validatedFields = profitabilitySchema.safeParse({
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    location: formData.get("location"),
    soilType: formData.get("soilType"),
    farmArea: formData.get("farmArea"),
    waterSource: formData.get("waterSource"),
    historicalData: formData.get("historicalData"),
    language: formData.get("language"),
    farmBoundary: formData.get("farmBoundary"),
  });

  if (!validatedFields.success) {
    return {
      result: null,
      pending: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await profitabilityForecastFlow({
      ...validatedFields.data,
      farmArea: validatedFields.data.farmArea.toString(),
      farmBoundary: validatedFields.data.farmBoundary ? JSON.parse(validatedFields.data.farmBoundary) : undefined,
      waterSource: validatedFields.data.waterSource || 'Not provided',
      historicalData: validatedFields.data.historicalData || 'Not provided',
    });
    return { result, errors: null, pending: false };
  } catch (error: any) {
    console.error(error);
    return { result: null, pending: false, errors: error.message || "An unexpected error occurred. Please try again." };
  }
}

const personalizedSchema = z.object({
  latitude: z.coerce.number({required_error: "Latitude is required."}),
  longitude: z.coerce.number({required_error: "Longitude is required."}),
  location: z.string().min(1, "Location is required."),
  soilType: z.string().min(1, "Soil type is required."),
  farmArea: z.string().min(1, "Farm area is required."),
  waterSource: z.string().min(1, "Water source is required."),
  historicalData: z.string().optional(),
  photo: z.preprocess((arg) => (arg instanceof File ? arg : undefined), z.instanceof(File).optional()),
  language: z.string(),
  farmBoundary: z.string().optional(),
});

export async function getPlantingRecommendations(
    prevState: { result: any, errors: any, pending: boolean },
    formData: FormData
) {
  const validatedFields = personalizedSchema.safeParse({
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    location: formData.get("location"),
    soilType: formData.get("soilType"),
    historicalData: formData.get("historicalData"),
    farmArea: formData.get("farmArea"),
    waterSource: formData.get("waterSource"),
    photo: formData.get("photo"),
    language: formData.get("language"),
    farmBoundary: formData.get("farmBoundary"),
  });

  if (!validatedFields.success) {
    return {
      result: null,
      pending: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  let photoDataUri: string | undefined = undefined;
  if (validatedFields.data.photo && validatedFields.data.photo.size > 0) {
    const buffer = Buffer.from(await validatedFields.data.photo.arrayBuffer());
    photoDataUri = `data:${validatedFields.data.photo.type};base64,${buffer.toString('base64')}`;
  }
  
  try {
    const result = await getPersonalizedRecommendationsFlow({
      latitude: validatedFields.data.latitude,
      longitude: validatedFields.data.longitude,
      location: validatedFields.data.location,
      soilType: validatedFields.data.soilType,
      historicalData: validatedFields.data.historicalData || 'Not provided',
      farmArea: validatedFields.data.farmArea.toString(),
      waterSource: validatedFields.data.waterSource,
      photoDataUri,
      language: validatedFields.data.language,
      farmBoundary: validatedFields.data.farmBoundary ? JSON.parse(validatedFields.data.farmBoundary) : undefined,
    });
    return { result, errors: null, pending: false };
  } catch (error: any) {
    console.error(error);
    return { result: null, pending: false, errors: error.message || "An unexpected error occurred. Please try again." };
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
        headers: {
            "User-Agent": "FarmBrahma/1.0 (sheth.bhaskar@gmail.com)"
        }
    });
    if (!response.ok) {
      console.error(`Nominatim API failed with status ${response.status}`);
      return "India";
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || !data.address) {
        return "India";
    }

    const address = data.address;
    // Create a prioritized list of address components
    const locationName = 
        address.village || 
        address.town || 
        address.city_district || 
        address.city || 
        address.county || 
        address.state_district || 
        (data.display_name && typeof data.display_name === 'string' ? data.display_name.split(',')[0] : '');

    const state = address.state || '';

    if (locationName) {
        // If we found a location name, combine it with the state if different
        if (state && locationName !== state) {
            return `${locationName}, ${state}`;
        }
        return locationName;
    }
    // Fallback if no specific location name is found
    return state || "India";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "India";
  }
}


export async function fetchFarmDetails(location: string) {
  if (!location || location === 'India') return null;
  try {
    return await getFarmDetailsFromLocation({ location });
  } catch (error) {
    console.error("Error fetching farm details:", error);
    return null;
  }
}

export async function getDashboardSummary(input: DashboardSummaryInput): Promise<DashboardSummaryOutput | null> {
    try {
        return await getDashboardSummaryFlow(input);
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        return null;
    }
}

export async function getEnvironmentalData(input: EnvironmentalDataInput): Promise<EnvironmentalDataOutput | null> {
    try {
        return await getEnvironmentalDataFlow(input);
    } catch (error) {
        console.error("Error fetching environmental data:", error);
        return null;
    }
}

export async function getMarketData(input: MarketDataInput): Promise<MarketDataOutput | null> {
    try {
        return await getMarketDataFlow(input);
    } catch (error) {
        console.error("Error fetching market data:", error);
        return null;
    }
}

