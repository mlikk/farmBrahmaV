
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { getProfitabilityForecast, getPlantingRecommendations, reverseGeocode, fetchFarmDetails } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, ButtonProps } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Loader2, AlertCircle, ShieldCheck, ChevronsRight, ShoppingCart, Target, Database, CheckCircle, Search } from "lucide-react";
import { ProfitabilityForecastOutput } from "@/ai/flows/profitability-forecast";
import { PersonalizedRecommendationsOutput } from "@/ai/flows/personalized-planting-recommendations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useLocationContext } from "@/context/LocationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import type { GeoJsonObject } from 'geojson';


const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
});

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-primary/5 mt-6">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {children}
      </CardContent>
    </Card>
  );
}

type LocationDialogProps = {
  triggerButtonVariant?: ButtonProps['variant'];
  triggerButtonText?: string;
};

export function LocationDialog({ triggerButtonVariant = "outline", triggerButtonText }: LocationDialogProps) {
  const t = useTranslations("LocationDialog");
  const { setLocation, setAddress, setFarmArea, setFarmDetails, setFarmBoundary } = useLocationContext();
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [pickedLocation, setPickedLocation] = useState<{lat: number, lng: number, zoom: number} | null>(null);
  const [pickedBoundary, setPickedBoundary] = useState<GeoJsonObject | null>(null);
  const [pickedArea, setPickedArea] = useState<number>(0);

  const handleFinalize = async () => {
    if (!pickedLocation) return;
    
    setIsGeocoding(true);
    try {
      const addressString = await reverseGeocode(pickedLocation.lat, pickedLocation.lng);
      const finalAddress = addressString || "India";
      
      setLocation({ latitude: pickedLocation.lat, longitude: pickedLocation.lng, zoom: pickedLocation.zoom });
      setAddress(finalAddress);
      setFarmBoundary(pickedBoundary);
      setFarmArea(pickedArea > 0 ? pickedArea : null);

      if (finalAddress !== 'India') {
        const farmDetails = await fetchFarmDetails(finalAddress);
        setFarmDetails(farmDetails);
      } else {
        setFarmDetails(null);
      }

    } catch (error) {
      console.error("Geocoding or farm detail fetching failed", error);
      // In case of error, still update the core location info
      setLocation({ latitude: pickedLocation.lat, longitude: pickedLocation.lng, zoom: pickedLocation.zoom });
      setAddress("India");
      setFarmBoundary(pickedBoundary);
      setFarmArea(pickedArea > 0 ? pickedArea : null);
      setFarmDetails(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButtonText ? (
          <Button variant={triggerButtonVariant}>{triggerButtonText}</Button>
        ) : (
          <Button variant={triggerButtonVariant} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl z-[200] max-h-[90vh] flex flex-col overflow-x-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="relative overflow-y-auto -mx-6 px-6 flex-1">
           <LocationPicker 
             onPickerLocationChange={setPickedLocation}
             onPickerBoundaryChange={setPickedBoundary}
             onPickerAreaChange={setPickedArea}
           />
           {isGeocoding && (
             <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">{t('geocodingMessage')}</p>
             </div>
           )}
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button onClick={handleFinalize} disabled={isGeocoding || !pickedLocation}><CheckCircle className="mr-2 h-4 w-4" /> Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RiskBadge = ({ rating }: { rating: "Low" | "Medium" | "High" }) => {
  const t = useTranslations("PlantingForm");
  return (
    <Badge variant={rating === "Low" ? "default" : rating === "Medium" ? "secondary" : "destructive"}
      className={cn({
        "bg-green-600 hover:bg-green-700": rating === "Low",
        "bg-amber-500 hover:bg-amber-600": rating === "Medium",
        "bg-red-600 hover:bg-red-700": rating === "High",
      })}
    >
      {t('riskRating', {rating})}
    </Badge>
  );
};

const ProfitabilitySkeleton = () => {
    return (
    <Card className="bg-primary/5 mt-6">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot /> <Skeleton className="h-6 w-72" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="border-b">
                    <div className="py-4 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-4 w-20 mt-1" />
                            </div>
                        </div>
                         <Skeleton className="h-4 w-4" />
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
    )
};

export function ProfitabilityForm() {
  const t = useTranslations("ProfitabilityForm");
  const tErrors = useTranslations("Errors");
  const tWater = useTranslations("WaterSources");
  const locale = useLocale();

  const { toast } = useToast();

  const { location: contextLocation, address: contextAddress, farmArea: contextFarmArea, farmDetails: contextFarmDetails, farmBoundary: contextFarmBoundary } = useLocationContext();
  
  const [location, setLocalLocation] = useState(contextAddress || '');
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [farmArea, setLocalFarmArea] = useState('');
  const [historicalData, setHistoricalData] = useState('');
  
  const [result, setResult] = useState<ProfitabilityForecastOutput | null>(null);
  const [errors, setErrors] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);


  useEffect(() => {
    setLocalLocation(contextAddress || '');
    setLocalFarmArea(contextFarmArea ? contextFarmArea.toString() : '');
    if (contextFarmDetails) {
        setSoilType(contextFarmDetails.soilType || '');
        setWaterSource(contextFarmDetails.waterSource || '');
    } else {
        setSoilType('');
        setWaterSource('');
    }
  }, [contextAddress, contextFarmArea, contextFarmDetails]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsPending(true);
      setErrors(null);
      setResult(null);

      const formData = new FormData(event.currentTarget);
      
      if (contextLocation) {
        formData.set('latitude', contextLocation.latitude.toString());
        formData.set('longitude', contextLocation.longitude.toString());
      }
      if (contextFarmBoundary) {
        formData.set('farmBoundary', JSON.stringify(contextFarmBoundary));
      }
      formData.set('language', locale);
      formData.set('location', location); // Ensure location is in form data

      const response = await getProfitabilityForecast({ result: null, errors: null, pending: false }, formData);

      if (response.errors) {
          setErrors(response.errors);
      } else {
          setResult(response.result);
      }
      setIsPending(false);
  }

  useEffect(() => {
    if (errors && typeof errors === 'string') {
      toast({
        variant: "destructive",
        title: "Error",
        description: errors,
      });
    }
  }, [errors, toast, tErrors]);

  const finalResult = result as ProfitabilityForecastOutput | null;
  const fieldErrors = (errors && typeof errors !== 'string') ? errors : null;
  const coordinates = contextLocation ? `(${contextLocation.latitude.toFixed(4)}, ${contextLocation.longitude.toFixed(4)})` : '';


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="location-profit">{t('locationLabel')}</Label>
                  <div className="flex gap-2">
                      <Input id="location-profit" name="location" placeholder={t('locationPlaceholder')} value={location && location !== 'India' ? `${location} ${coordinates}` : ''} readOnly className="bg-muted cursor-not-allowed" />
                      <LocationDialog />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="soilType-profit">{t('soilTypeLabel')}</Label>
                  <Input id="soilType-profit" name="soilType" placeholder={t('soilTypePlaceholder')} value={soilType} onChange={e => setSoilType(e.target.value)}/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="farmArea-profit">{t('farmAreaLabel')}</Label>
                  <Input id="farmArea-profit" name="farmArea" type="number" placeholder={t('farmAreaPlaceholder')} value={farmArea} onChange={e => setLocalFarmArea(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="waterSource-profit">{t('waterSourceLabel')}</Label>
                  <Select name="waterSource" value={waterSource} onValueChange={setWaterSource}>
                      <SelectTrigger id="waterSource-profit">
                          <SelectValue placeholder={t('waterSourcePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Rain-fed">{tWater('Rain-fed')}</SelectItem>
                          <SelectItem value="Canal">{tWater('Canal')}</SelectItem>
                          <SelectItem value="Borewell/Tubewell">{tWater('Borewell/Tubewell')}</SelectItem>
                          <SelectItem value="River/Lift Irrigation">{tWater('River/Lift Irrigation')}</SelectItem>
                          <SelectItem value="Pond/Tank">{tWater('Pond/Tank')}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="historicalData-profit">{t('historicalDataLabel')}</Label>
                  <Textarea id="historicalData-profit" name="historicalData" placeholder={t('historicalDataPlaceholder')} value={historicalData} onChange={e => setHistoricalData(e.target.value)} />
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                {t('submitButton')}
            </Button>
          </CardFooter>
        </Card>
      </form>
      {isPending && <ProfitabilitySkeleton />}
      {fieldErrors && (
         <Card className="mt-4 bg-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive text-base">Errors</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-sm text-destructive">
                    {Object.entries(fieldErrors).map(([key, value]) => (
                        <li key={key}>{(value as string[]).join(", ")}</li>
                    ))}
                </ul>
            </CardContent>
         </Card>
      )}
      {!isPending && finalResult && (
        <ResultCard title={t('resultTitle')}>
          <p className="text-muted-foreground -mt-2">{finalResult.reasoning}</p>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {finalResult.recommendations.map((rec, index) => (
               <AccordionItem value={`item-${index}`} key={index}>
                 <AccordionTrigger className="font-bold text-lg hover:no-underline">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
                    <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm flex-shrink-0">{index + 1}</span>
                    <div>
                      {rec.crop}
                      <p className="text-sm font-normal text-green-600">{rec.estimatedProfit}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                 <AccordionContent className="pl-4 border-l-2 ml-4 border-primary/20 space-y-4">
                    <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2"><Target size={16} /> {t('marketingStrategies')}</h4>
                      <ul className="mt-1 ml-4 list-disc text-muted-foreground space-y-1">
                        {rec.marketingStrategies.map((strategy, sIndex) => <li key={sIndex}>{strategy}</li>)}
                      </ul>
                    </div>
                     <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2"><ShoppingCart size={16} /> {t('marketOptions')}</h4>
                       <ul className="mt-1 ml-4 list-disc text-muted-foreground space-y-1">
                        {rec.marketOptions.map((option, oIndex) => <li key={oIndex}>{option}</li>)}
                      </ul>
                    </div>
                 </AccordionContent>
               </AccordionItem>
            ))}
          </Accordion>
           <div className="pt-4 mt-4 border-t">
              <h4 className="font-semibold text-primary flex items-center gap-2"><Database size={16} /> {t('dataSourcesTitle')}</h4>
              <ul className="mt-1 ml-4 list-disc text-muted-foreground text-xs space-y-1">
                {finalResult.dataSources.map((source, sIndex) => <li key={sIndex}>{source}</li>)}
              </ul>
            </div>
        </ResultCard>
      )}
    </div>
  );
}

const PlantingSkeleton = () => {
    return (
    <Card className="bg-primary/5 mt-6">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot /> <Skeleton className="h-6 w-72" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="border-b">
                    <div className="py-4 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24 mt-1" />
                            </div>
                        </div>
                         <Skeleton className="h-4 w-4" />
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
    )
};

export function PlantingForm() {
  const t = useTranslations("PlantingForm");
  const tErrors = useTranslations("Errors");
  const tWater = useTranslations("WaterSources");
  const locale = useLocale();

  const { toast } = useToast();
  
  const { location: contextLocation, address: contextAddress, farmArea: contextFarmArea, farmDetails: contextFarmDetails, farmBoundary: contextFarmBoundary } = useLocationContext();

  const [location, setLocalLocation] = useState(contextAddress || '');
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [farmArea, setLocalFarmArea] = useState('');
  const [historicalData, setHistoricalData] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [result, setResult] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [errors, setErrors] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setLocalLocation(contextAddress || '');
    setLocalFarmArea(contextFarmArea ? contextFarmArea.toString() : '');
    if (contextFarmDetails) {
        setSoilType(contextFarmDetails.soilType || '');
        setWaterSource(contextFarmDetails.waterSource || '');
    } else {
        setSoilType('');
        setWaterSource('');
    }
  }, [contextAddress, contextFarmArea, contextFarmDetails]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsPending(true);
      setErrors(null);
      setResult(null);

      const formData = new FormData();
      formData.set('location', location);
      formData.set('soilType', soilType);
      formData.set('farmArea', farmArea);
      formData.set('waterSource', waterSource);
      formData.set('historicalData', historicalData);
      if (photo) {
        formData.set('photo', photo);
      }
      if (contextLocation) {
        formData.set('latitude', contextLocation.latitude.toString());
        formData.set('longitude', contextLocation.longitude.toString());
      }
      if (contextFarmBoundary) {
        formData.set('farmBoundary', JSON.stringify(contextFarmBoundary));
      }
      formData.set('language', locale);

      const response = await getPlantingRecommendations({ result: null, errors: null, pending: false }, formData);
      if (response.errors) {
          setErrors(response.errors);
      } else {
          setResult(response.result);
      }
      setIsPending(false);
  }
  
  useEffect(() => {
    if (errors && typeof errors === 'string') {
      toast({
        variant: "destructive",
        title: "Error",
        description: errors,
      });
    }
  }, [errors, toast, tErrors]);

  const finalResult = result as PersonalizedRecommendationsOutput | null;
  const fieldErrors = (errors && typeof errors !== 'string') ? errors : null;
  const coordinates = contextLocation ? `(${contextLocation.latitude.toFixed(4)}, ${contextLocation.longitude.toFixed(4)})` : '';
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location-plant">{t('locationLabel')}</Label>
                    <div className="flex gap-2">
                        <Input id="location-plant" name="location" placeholder={t('locationPlaceholder')} value={location && location !== 'India' ? `${location} ${coordinates}` : ''} readOnly className="bg-muted cursor-not-allowed"/>
                        <LocationDialog />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="soilType-plant">{t('soilTypeLabel')}</Label>
                    <Input id="soilType-plant" name="soilType" placeholder={t('soilTypePlaceholder')} value={soilType} onChange={e => setSoilType(e.target.value)}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="farmArea-plant">{t('farmAreaLabel')}</Label>
                    <Input id="farmArea-plant" name="farmArea" type="number" placeholder={t('farmAreaPlaceholder')} value={farmArea} onChange={e => setLocalFarmArea(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="waterSource-plant">{t('waterSourceLabel')}</Label>
                    <Select name="waterSource" value={waterSource} onValueChange={setWaterSource}>
                        <SelectTrigger id="waterSource-plant">
                        <SelectValue placeholder={t('waterSourcePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Rain-fed">{tWater('Rain-fed')}</SelectItem>
                        <SelectItem value="Canal">{tWater('Canal')}</SelectItem>
                        <SelectItem value="Borewell/Tubewell">{tWater('Borewell/Tubewell')}</SelectItem>
                        <SelectItem value="River/Lift Irrigation">{tWater('River/Lift Irrigation')}</SelectItem>
                        <SelectItem value="Pond/Tank">{tWater('Pond/Tank')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="photo">{t('photoLabel')}</Label>
                    <Input id="photo" name="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="historicalData-plant">{t('historicalDataLabel')}</Label>
                    <Textarea id="historicalData-plant" name="historicalData" placeholder={t('historicalDataPlaceholder')} value={historicalData} onChange={(e) => setHistoricalData(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    {t('submitButton')}
                </Button>
            </CardFooter>
        </Card>
      </form>
       {isPending && <PlantingSkeleton />}
       {fieldErrors && (
         <Card className="mt-4 bg-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive text-base">Errors</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-sm text-destructive">
                    {Object.entries(fieldErrors).map(([key, value]) => (
                        <li key={key}>{(value as string[]).join(", ")}</li>
                    ))}
                </ul>
            </CardContent>
         </Card>
      )}
      {!isPending && finalResult && (
        <ResultCard title={t('resultTitle')}>
          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {finalResult.recommendations.map((rec, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="font-bold text-lg hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                    <span className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm flex-shrink-0">{index + 1}</span>
                    <div>
                      {rec.crop} <span className="text-primary/90">({rec.variety})</span>
                      <p className="text-sm font-normal text-muted-foreground">{t('recommendedArea', {area: rec.area})}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4 border-l-2 ml-4 border-primary/20">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2"><ShieldCheck size={16} /> {t('reasoning')}</h4>
                      <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{rec.reasoning}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-destructive flex items-center gap-2"><AlertCircle size={16} /> {t('riskAnalysis')}</h4>
                      <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center justify-between p-2 rounded-md bg-background">
                            <span className="font-medium">{t('climatic')}</span>
                            <RiskBadge rating={rec.riskAnalysis.climatic.rating} />
                        </div>
                        <p className="text-muted-foreground md:col-span-2 text-xs pl-2 border-l-2 ml-2.5">
                            <ChevronsRight className="inline h-3 w-3 -ml-1" /> {rec.riskAnalysis.climatic.remarks}
                        </p>

                        <div className="flex items-center justify-between p-2 rounded-md bg-background">
                            <span className="font-medium">{t('soil')}</span>
                             <RiskBadge rating={rec.riskAnalysis.soil.rating} />
                        </div>
                         <p className="text-muted-foreground md:col-span-2 text-xs pl-2 border-l-2 ml-2.5">
                           <ChevronsRight className="inline h-3 w-3 -ml-1" /> {rec.riskAnalysis.soil.remarks}
                        </p>

                        <div className="flex items-center justify-between p-2 rounded-md bg-background">
                            <span className="font-medium">{t('biological')}</span>
                             <RiskBadge rating={rec.riskAnalysis.biological.rating} />
                        </div>
                         <p className="text-muted-foreground md:col-span-2 text-xs pl-2 border-l-2 ml-2.5">
                            <ChevronsRight className="inline h-3 w-3 -ml-1" /> {rec.riskAnalysis.biological.remarks}
                        </p>

                         <div className="flex items-center justify-between p-2 rounded-md bg-background">
                            <span className="font-medium">{t('agronomic')}</span>
                             <RiskBadge rating={rec.riskAnalysis.agronomic.rating} />
                        </div>
                         <p className="text-muted-foreground md:col-span-2 text-xs pl-2 border-l-2 ml-2.5">
                           <ChevronsRight className="inline h-3 w-3 -ml-1" /> {rec.riskAnalysis.agronomic.remarks}
                        </p>

                        <div className="flex items-center justify-between p-2 rounded-md bg-background">
                            <span className="font-medium">{t('socioEconomic')}</span>
                             <RiskBadge rating={rec.riskAnalysis.socioEconomic.rating} />
                        </div>
                        <p className="text-muted-foreground md:col-span-2 text-xs pl-2 border-l-2 ml-2.5">
                            <ChevronsRight className="inline h-3 w-3 -ml-1" /> {rec.riskAnalysis.socioEconomic.remarks}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
           <div className="pt-4 mt-4 border-t">
              <h4 className="font-semibold text-primary flex items-center gap-2"><Database size={16} /> {t('dataSourcesTitle')}</h4>
              <ul className="mt-1 ml-4 list-disc text-muted-foreground text-xs space-y-1">
                {finalResult.dataSources.map((source, sIndex) => <li key={sIndex}>{source}</li>)}
              </ul>
            </div>
        </ResultCard>
      )}
    </div>
  );
}

