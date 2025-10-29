
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { useTranslations } from "next-intl"

type MarketChartProps = {
    chartData?: { month: string; price: number }[];
    cropName?: string;
}

export function MarketChart({ chartData, cropName }: MarketChartProps) {
  const t = useTranslations("MarketChart");

  const chartConfig = {
    price: {
      label: t('priceLabel'),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  const defaultChartData = [
    { month: "January", price: 1860 },
    { month: "February", price: 2050 },
    { month: "March", price: 2370 },
    { month: "April", price: 2130 },
    { month: "May", price: 2510 },
    { month: "June", price: 2490 },
  ]
  
  const displayData = chartData && chartData.length > 0 ? chartData : defaultChartData;
  const displayCropName = cropName || 'Selected Crop';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('priceTrendTitle', {cropName: displayCropName})}</CardTitle>
        <CardDescription>{t('last6Months')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={displayData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="price" fill="var(--color-price)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
