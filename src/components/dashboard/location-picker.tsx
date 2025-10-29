
"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Map, Layer } from "leaflet";
import L from "leaflet";
import "leaflet-draw";
import area from "@turf/area";
import tokml from "tokml";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { useLocationContext } from "@/context/LocationContext";
import { useTranslations } from "next-intl";
import type { GeoJsonObject } from 'geojson';
import { Download } from "lucide-react";


// Fix for default icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Type guard to check if an object is a GeoJSON Feature with geometry
function isFeature(obj: any): obj is GeoJSON.Feature {
    return obj && obj.type === 'Feature' && obj.hasOwnProperty('geometry');
}


interface LocationPickerProps {
  onPickerLocationChange: (location: {lat: number, lng: number, zoom: number}) => void;
  onPickerBoundaryChange: (boundary: GeoJsonObject | null) => void;
  onPickerAreaChange: (area: number) => void;
}

export default function LocationPicker({ onPickerLocationChange, onPickerBoundaryChange, onPickerAreaChange }: LocationPickerProps) {
  const t = useTranslations("LocationPicker");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  
  const { location, farmArea, farmBoundary } = useLocationContext();
  const [calculatedArea, setCalculatedArea] = useState<number | null>(farmArea);
  const [isDownloadable, setIsDownloadable] = useState(false);

  const handleLocateMe = useCallback(() => {
    mapRef.current?.locate();
  }, []);
  
  const processLayer = useCallback((layer: Layer) => {
      const geojson = (layer as L.GeoJSON).toGeoJSON() as any;
      onPickerBoundaryChange(geojson);
      
      let center;
      if (layer instanceof L.Marker) {
          center = layer.getLatLng();
          setCalculatedArea(null);
          onPickerAreaChange(0);
          setIsDownloadable(false);
      } else {
          const turfArea = area(geojson);
          const areaInAcres = turfArea * 0.000247105;
          setCalculatedArea(areaInAcres);
          onPickerAreaChange(areaInAcres);
          setIsDownloadable(true);
          center = (layer as L.Polygon).getBounds().getCenter();
      }
      
      if(mapRef.current) {
        onPickerLocationChange({lat: center.lat, lng: center.lng, zoom: mapRef.current.getZoom()});
      }
  }, [onPickerBoundaryChange, onPickerAreaChange, onPickerLocationChange]);


  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialPosition: [number, number] = location ? [location.latitude, location.longitude] : [20.5937, 78.9629];
      const initialZoom = location ? location.zoom : 5;

      const map = L.map(mapContainerRef.current).setView(initialPosition, initialZoom);
      mapRef.current = map;

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        pane: 'shadowPane'
      }).addTo(map);
      
      const drawnItems = new L.FeatureGroup();
      drawnItemsRef.current = drawnItems;
      map.addLayer(drawnItems);
      
      // Load existing farm boundary
      if (farmBoundary) {
        const farmLayer = L.geoJSON(farmBoundary);
        const layers = farmLayer.getLayers();
        if(layers.length > 0) {
          const layer = layers[0];
          drawnItems.addLayer(layer);
          processLayer(layer);
          map.fitBounds((layer as L.Polygon).getBounds());
          
          let isPolygonOrRect = false;
          if (isFeature(farmBoundary)) {
              if (farmBoundary.geometry && farmBoundary.geometry.type !== 'Point') {
                  isPolygonOrRect = true;
              }
          } else if (farmBoundary.type !== 'Point' && farmBoundary.type !== 'GeometryCollection') {
              isPolygonOrRect = true;
          }

          if (isPolygonOrRect) {
             setIsDownloadable(true);
          }
        }
      }
      
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
          polyline: false,
          rectangle: { showArea: true },
          circle: false,
          marker: {},
          circlemarker: false,
        },
      });
      map.addControl(drawControl);
      
      const handleDrawCreate = (event: any) => {
        const layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        processLayer(layer);
      }
       const handleDrawEdited = (event: any) => {
        event.layers.eachLayer((layer: any) => processLayer(layer));
      }
       const handleDrawDeleted = () => {
        onPickerBoundaryChange(null);
        onPickerAreaChange(0);
        setCalculatedArea(null);
        setIsDownloadable(false);
      }

      map.on(L.Draw.Event.CREATED, handleDrawCreate);
      map.on(L.Draw.Event.EDITED, handleDrawEdited);
      map.on(L.Draw.Event.DELETED, handleDrawDeleted);
      
      map.on('locationfound', (e) => {
          map.flyTo(e.latlng, 13);
          const marker = L.marker(e.latlng);
          drawnItems.clearLayers();
          drawnItems.addLayer(marker);
          processLayer(marker);
      });
    }
  }, [farmBoundary, processLayer, location, onPickerAreaChange, onPickerBoundaryChange]);

  const handleDownload = (format: 'geojson' | 'kml') => {
      if (!drawnItemsRef.current) return;

      const layers = drawnItemsRef.current.getLayers();
      if (layers.length === 0) {
          alert("No farm boundary to download. Please draw a polygon or rectangle first.");
          return;
      }
      
      if (layers[0] instanceof L.Marker) {
           alert("Cannot download a single point. Please draw a polygon or rectangle.");
           return;
      }
      
      const geojson = (layers[0] as L.GeoJSON).toGeoJSON();

      let dataStr: string;
      let fileName: string;
      
      if (format === 'geojson') {
          dataStr = JSON.stringify(geojson, null, 2);
          fileName = 'farm_boundary.geojson';
      } else { // kml
          dataStr = tokml(geojson as any, { name: 'Farm Boundary' });
          fileName = 'farm_boundary.kml';
      }

      const blob = new Blob([dataStr], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-2">
                <Button onClick={handleLocateMe} variant="outline">{t('locateMe')}</Button>
                {isDownloadable && (
                  <>
                    <Button variant="secondary" onClick={() => handleDownload('geojson')}>
                      <Download className="mr-2 h-4 w-4" /> GeoJSON
                    </Button>
                    <Button variant="secondary" onClick={() => handleDownload('kml')}>
                      <Download className="mr-2 h-4 w-4" /> KML
                    </Button>
                  </>
                )}
                {calculatedArea && calculatedArea > 0 && (
                    <div className="text-sm text-center font-medium border rounded-md px-3 py-2 bg-muted h-10 flex items-center">
                        {t('area', {area: calculatedArea.toFixed(2)})}
                    </div>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapContainerRef} className="h-[500px] w-full" />
      </CardContent>
    </Card>
  );
}
