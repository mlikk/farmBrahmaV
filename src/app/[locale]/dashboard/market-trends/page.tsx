
"use client"

import { useState, useEffect, useRef } from "react"
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
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard/header"
import { MarketChart } from "@/components/dashboard/market-chart"
import { useLocationContext } from "@/context/LocationContext"
import { getMarketData } from "@/lib/actions"
import type { MarketDataOutput } from "@/ai/flows/market-data"
import { Loader2, Database } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

export default function MarketTrendsPage() {
  const t = useTranslations("MarketTrendsPage");
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState("")
  const { address, isLoading: isLocationLoading } = useLocationContext()
  const [data, setData] = useState<MarketDataOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false);

  useEffect(() => {
    async function fetchData() {
        if (isLocationLoading) {
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
            const result = await getMarketData({ location: address, language: locale });
            setData(result);
        } catch (error) {
            console.error("Failed to fetch market data:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [address, locale, isLocationLoading]);

  const filteredMarketData = data?.cropPrices.filter((item) =>
    item.crop.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const MarketDataSkeleton = () => (
     <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>{t('cropPrices')}</CardTitle>
                    <Skeleton className="h-4 w-48 mt-1" />
                </div>
                <div className="w-full md:w-64">
                    <Input placeholder={t('searchPlaceholder')} disabled />
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('tableCrop')}</TableHead>
                            <TableHead className="hidden sm:table-cell">{t('tableVariety')}</TableHead>
                            <TableHead className="hidden md:table-cell">{t('tableMarket')}</TableHead>
                            <TableHead className="text-right">{t('tablePrice')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(8)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-80 w-full" />
                    </CardContent>
                </Card>
            </div>
        </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title={t('title')} description={isLocationLoading ? t('descriptionLoading') : (!address || address === 'India') ? t('descriptionNoLocation') : t('description', {address})} />
      <main className="flex-1 p-4 md:p-6 grid gap-6 auto-rows-max">
        {loading ? (
            <MarketDataSkeleton />
        ) : data && filteredMarketData ? (
        <div className="grid gap-6">
            <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>{t('cropPrices')}</CardTitle>
                        <CardDescription>{t('priceUnit', {address})}</CardDescription>
                    </div>
                    <div className="w-full md:w-64">
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('tableCrop')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('tableVariety')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('tableMarket')}</TableHead>
                        <TableHead className="text-right">{t('tablePrice')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMarketData.map((item) => (
                        <TableRow key={`${item.crop}-${item.market}`}>
                            <TableCell className="font-medium">{item.crop}</TableCell>
                            <TableCell className="hidden sm:table-cell">{item.variety}</TableCell>
                            <TableCell className="hidden md:table-cell">{item.market}</TableCell>
                            <TableCell className="text-right font-semibold">₹{item.price.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                <div className="lg:col-span-2">
                    <MarketChart chartData={data.priceTrend} cropName={data.mainCrop} />
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4">
                <div className="font-semibold flex items-center gap-2"><Database size={14} /> {t('dataSourcesTitle')}</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                {data.dataSources.map((source, i) => <li key={i}>{source}</li>)}
                </ul>
            </CardFooter>
            </Card>
        </div>
        ) : (
            <div className="text-center text-muted-foreground py-10">{t('noData')}</div>
        )}
      </main>
    </div>
  )
}
