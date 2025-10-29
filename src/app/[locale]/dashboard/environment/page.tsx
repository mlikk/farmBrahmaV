
"use client"

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/header"
import { Droplets, Sun, Thermometer, Wind, Loader2, Database } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { useLocationContext } from "@/context/LocationContext";
import { getEnvironmentalData } from "@/lib/actions";
import type { EnvironmentalDataOutput } from "@/ai/flows/environmental-data";
import { useLocale, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
    rainfall: {
      label: "Rainfall (mm)",
      color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export default function EnvironmentPage() {
    const t = useTranslations("EnvironmentPage");
    const locale = useLocale();
    const { location, address, isLoading: isLocationLoading } = useLocationContext();
    const [data, setData] = useState<EnvironmentalDataOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        async function fetchData() {
            if (isLocationLoading || !location) {
                setLoading(true);
                return;
            }
            if (!address || address === 'India') {
                setLoading(false);
                setData(null);
                return;
            }

            if (hasFetched.current) return;
            hasFetched.current = true;

            setLoading(true);
            try {
                const result = await getEnvironmentalData({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    language: locale,
                });
                setData(result);
            } catch (error) {
                console.error("Failed to fetch environmental data:", error);
                setData(null);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();

    }, [location, address, locale, isLocationLoading]);

    const SkeletonCard = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-3 w-3/4" />
            </CardContent>
        </Card>
    );

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title={t('title')} description={isLocationLoading ? t('descriptionLoading') : address ? t('description', {address: address}) : ""} />
      <main className="flex-1 p-4 md:p-6 grid gap-6 auto-rows-max">
        {loading ? (
             <div className="grid gap-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4 font-headline">{t('currentWeather')}</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </section>
                 <section>
                    <h2 className="text-xl font-semibold mb-4 font-headline">{t('soilConditions')}</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </section>
                <section>
                    <Card>
                         <CardHeader>
                            <CardTitle>{t('annualRainfall')}</CardTitle>
                            <CardDescription>{t('annualRainfallDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-80 w-full" />
                        </CardContent>
                    </Card>
                </section>
             </div>
        ) : data ? (
            <>
                <section>
                <h2 className="text-xl font-semibold mb-4 font-headline">{t('currentWeather')}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('temperature')}</CardTitle>
                        <Thermometer className="h-5 w-5 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.weather.temperature}</div>
                        <p className="text-xs text-muted-foreground">{t('feelsLike', {value: data.weather.feelsLike})}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('humidity')}</CardTitle>
                        <Droplets className="h-5 w-5 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.weather.humidity}</div>
                        <p className="text-xs text-muted-foreground">{data.weather.humidityDescription}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('windSpeed')}</CardTitle>
                        <Wind className="h-5 w-5 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.weather.windSpeed}</div>
                        <p className="text-xs text-muted-foreground">{data.weather.windDirection}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('uvIndex')}</CardTitle>
                        <Sun className="h-5 w-5 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.weather.uvIndex}</div>
                        <p className="text-xs text-muted-foreground">{data.weather.uvIndexAdvice}</p>
                    </CardContent>
                    </Card>
                </div>
                </section>
                
                <section>
                <h2 className="text-xl font-semibold mb-4 font-headline">{t('soilConditions')}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                    <CardHeader>
                        <CardTitle>{t('soilMoisture')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.soil.moisture}</div>
                        <p className="text-xs text-muted-foreground">{data.soil.moistureAdvice}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>{t('soilPh')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.soil.ph}</div>
                        <p className="text-xs text-muted-foreground">{data.soil.phAdvice}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>{t('nitrogen')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.soil.nitrogen}</div>
                        <p className="text-xs text-muted-foreground">{data.soil.nitrogenAdvice}</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>{t('potassium')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.soil.potassium}</div>
                        <p className="text-xs text-muted-foreground">{data.soil.potassiumAdvice}</p>
                    </CardContent>
                    </Card>
                </div>
                </section>

                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('annualRainfall')}</CardTitle>
                            <CardDescription>{t('annualRainfallDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-80 w-full">
                                <BarChart data={data.rainfall} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="rainfall" fill="var(--color-rainfall)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4">
                          <div className="font-semibold flex items-center gap-2"><Database size={14} /> {t('dataSourcesTitle')}</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {data.dataSources.map((source, i) => <li key={i}>{source}</li>)}
                          </ul>
                        </CardFooter>
                    </Card>
                </section>
            </>
        ) : (
             <div className="text-center text-muted-foreground py-10">{t('noData')}</div>
        )}
      </main>
    </div>
  )
}
