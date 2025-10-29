
"use client";

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocationContext } from '@/context/LocationContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '../ui/skeleton';

// Fix for default icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export function FarmMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const { location, farmBoundary, farmArea, isLoading, address } = useLocationContext();

    useEffect(() => {
        if (isLoading || !mapContainerRef.current) return;

        // Initialize map if it doesn't exist
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: false,
                scrollWheelZoom: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
            });

            L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                attribution: 'Tiles &copy; Esri',
            }).addTo(mapRef.current);
            
             L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                pane: 'shadowPane'
            }).addTo(mapRef.current);
        }
        
        const map = mapRef.current;
        map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        if (farmBoundary) {
            const farmLayer = L.geoJSON(farmBoundary, {
                 style: {
                    color: "#fb923c", // Accent color
                    weight: 3,
                    opacity: 0.8,
                    fillOpacity: 0.2
                }
            }).addTo(map);
            map.fitBounds(farmLayer.getBounds(), { padding: [10, 10] });
        } else if (location) {
             // If location is 'India', show a wider view
             if (address === 'India') {
                 map.setView([22, 79], 4);
             } else {
                 map.setView([location.latitude, location.longitude], location.zoom);
             }
        }

    }, [location, farmBoundary, isLoading, address]);
    
    const renderSkeleton = () => (
        <Card className="lg:col-span-4 h-[400px]">
            <CardHeader>
                <CardTitle>Farm Map</CardTitle>
                <CardDescription>
                    {farmArea ? `Your farm area is ${farmArea.toFixed(2)} acres.` : 'Draw your farm boundary by clicking "Change" above.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    return (
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Farm Map</CardTitle>
                <CardDescription>
                    {farmArea ? `Your farm area is ${farmArea.toFixed(2)} acres.` : 'Draw your farm boundary by clicking "Change" above.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div ref={mapContainerRef} className="h-[300px] w-full rounded-md z-20" />
            </CardContent>
        </Card>
    );
}
