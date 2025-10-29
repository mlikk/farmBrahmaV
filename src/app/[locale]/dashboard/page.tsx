
"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/header"
import { ArrowUpRight, DollarSign, Leaf, TrendingUp, Loader2, Database } from "lucide-react"
import { Link } from "@/navigation"
import { useLocationContext } from "@/context/LocationContext";
import { getDashboardSummary } from "@/lib/actions";
import { DashboardSummaryOutput } from "@/ai/flows/dashboard-summary";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const FarmMap = dynamic(
  () => import("@/components/dashboard/farm-map").then((mod) => mod.FarmMap),
  {
    ssr: false,
    loading: () => (
      <Card className="lg:col-span-4">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    ),
  }
);


export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const locale = useLocale();
  const { location, farmArea, address, isLoading: isLocationLoading } = useLocationContext();
  const [summary, setSummary] = useState<DashboardSummaryOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchSummary() {
      if (isLocationLoading || !location || !address || address === 'India') {
        setLoading(address === 'India' || !location ? false : true);
        setSummary(null);
        return;
      }
      
      if (hasFetched.current && address === (summary as any)?.location) return;
      hasFetched.current = true;

      setLoading(true);
      try {
        const result = await getDashboardSummary({
          latitude: location.latitude,
          longitude: location.longitude,
          location: address,
          farmArea: farmArea ? farmArea.toString() : "10", // Default to 10 acres if not set
          language: locale,
        });
        if (result) {
          setSummary(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSummary();
  }, [location, address, locale, isLocationLoading, farmArea]);

  const SummaryCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-full mt-1" />
      </CardContent>
    </Card>
  );

  const MarketUpdatesSkeleton = () => (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{t('liveMarketUpdates')}</CardTitle>
        <CardDescription>{t('mandiUpdates')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('crop')}</TableHead>
              <TableHead className="text-right">{t('price')}</TableHead>
              <TableHead className="text-right">{t('change')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <>
      <DashboardHeader 
        title={t('title')} 
        description={isLocationLoading ? t('descriptionLoading') : address && address !== 'India' ? t('description') : ""}
      />
      <main className="flex-1 p-4 md:p-6 grid gap-6 auto-rows-max">
        {isLocationLoading ? (
           <div className="flex items-center justify-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : address && address !== 'India' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {loading || !summary ? (
                <>
                  <SummaryCardSkeleton />
                  <SummaryCardSkeleton />
                  <SummaryCardSkeleton />
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('topProfitableCrop')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.topProfitableCrop.crop}</div>
                      <p className="text-xs text-muted-foreground">
                        {summary.topProfitableCrop.reason}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('marketTrend')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.marketTrend.trend}</div>
                      <p className="text-xs text-muted-foreground">
                        {summary.marketTrend.reason}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('weatherAlert')}</CardTitle>
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.weatherAlert.alert}</div>
                      <p className="text-xs text-muted-foreground">
                        {summary.weatherAlert.advice}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('aiRecommendations')}</CardTitle>
                  <Link href="/dashboard/recommendations">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <Button asChild>
                    <Link href="/dashboard/recommendations">{t('getPlantingAdvice')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-7">
              <FarmMap />
              {loading || !summary ? (
                <MarketUpdatesSkeleton />
              ) : (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>{t('liveMarketUpdates')}</CardTitle>
                    <CardDescription>{t('mandiUpdates')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('crop')}</TableHead>
                          <TableHead className="text-right">{t('price')}</TableHead>
                          <TableHead className="text-right">{t('change')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.marketUpdates.map((update) => (
                          <TableRow key={update.crop}>
                            <TableCell className="font-medium">{update.crop}</TableCell>
                            <TableCell className="text-right">{update.price}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={update.status === "success" ? "default" : "destructive"} className={cn(update.status === 'success' ? 'bg-green-600' : 'bg-red-600', 'text-white')}>
                                {update.change}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
            {summary && (
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Database size={16} /> {t('dataSourcesTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {summary.dataSources.map((source, i) => <li key={i}>{source}</li>)}
                    </ul>
                  </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground -m-6">
            <div>
                <h3 className="text-lg font-semibold">{t('welcomeTitle')}</h3>
                <p className="mt-2">{t('welcomeMessage')}</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
