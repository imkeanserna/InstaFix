"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import type maplibregl from 'maplibre-gl';
import { LoadingSpinnerMore } from '@repo/ui/components/ui/loading-spinner-more';

type LatLng = {
  lat: number;
  lng: number;
};

export type Location = {
  address: string;
  lat: number;
  lng: number;
};

type PhotonProperties = {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
};

type SearchResult = {
  display_name: string;
  lat: number;
  lon: number;
  properties: PhotonProperties;
};

// Declare MapLibre types
declare global {
  interface Window {
    maplibregl: typeof maplibregl;
  }
}

interface LocationNavigationProps {
  selectedLocation: Location | null;
  setSelectedLocation: (value: Location | null) => void;
  maptilerKey?: string;
}

export default function LocationNavigation({
  selectedLocation,
  setSelectedLocation,
  maptilerKey
}: LocationNavigationProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mapLibLoaded, setMapLibLoaded] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const getUserLocation = (): Promise<LatLng> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location permission denied'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const getAddressFromCoords = async (coords: LatLng): Promise<string> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { display_name: string; error?: string } = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data.display_name;
  };

  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    isInitializedRef.current = false;
  }, []);

  const loadMapLibreResources = useCallback(async () => {
    try {
      setIsMapLoading(true);
      // Load CSS
      const cssPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });

      // Load JS
      const scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      await Promise.all([cssPromise, scriptPromise]);
      setMapLibLoaded(true);
    } catch (err) {
      setError('Failed to load map resources. Please refresh the page.');
    }
  }, []);

  const initializeMap = useCallback(async () => {
    if (!window.maplibregl || !mapContainerRef.current || isInitializedRef.current) return;

    destroyMap();

    // Default Location if user does not have a location
    let center: LatLng = { lat: 40.7128, lng: -74.0060 };
    let address = "New York City, New York, USA";

    try {
      center = await getUserLocation();
      try {
        address = await getAddressFromCoords(center);
        setSearchQuery(address);
        setSelectedLocation({
          address: address,
          lat: center.lat,
          lng: center.lng
        });
      } catch (addressError) {
        setSearchQuery(`${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        setSelectedLocation({
          address: `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`,
          lat: center.lat,
          lng: center.lng
        });
      }
    } catch (locationError) {
      setSearchQuery(address);
      setSelectedLocation({
        address: address,
        lat: center.lat,
        lng: center.lng
      });
    }

    const mapStyle = maptilerKey
      ? `https://api.maptiler.com/maps/streets/style.json?key=${maptilerKey}`
      : {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }]
      };

    const map = new window.maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle as any,
      center: [center.lng, center.lat],
      zoom: 13
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      setError('An error occurred with the map');
    });

    map.on('load', () => {
      console.log('Map loaded successfully');
      setIsMapLoading(false);
    });

    map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

    const marker = new window.maplibregl.Marker({
      draggable: true,
      color: '#FF0000'
    })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      updateLocationFromLatLng({ lat: lngLat.lat, lng: lngLat.lng });
    });

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      updateLocationFromLatLng({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
    });

    mapRef.current = map;
    markerRef.current = marker;
    isInitializedRef.current = true;
  }, [destroyMap, setSelectedLocation, maptilerKey]);

  useEffect(() => {
    loadMapLibreResources();
    return () => destroyMap();
  }, [loadMapLibreResources, destroyMap]);

  useEffect(() => {
    if (mapLibLoaded) {
      initializeMap();
    }
  }, [mapLibLoaded, initializeMap]);

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      return (searchTerm: string): Promise<string> => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            resolve(searchTerm);
          }, 300);
        });
      };
    })(),
    []
  );

  const handleSearch = async (value: string): Promise<void> => {
    setSearchQuery(value);

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const debouncedValue = await debouncedSearch(value);

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(debouncedValue)}&limit=5`
      );
      const data: {
        features: any[];
        type: string;
      } = await response.json();

      const transformedResults: SearchResult[] = data.features.map((feature: any) => ({
        display_name: formatAddress(feature.properties),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        properties: feature.properties
      }));

      setSearchResults(transformedResults);
      setError(null);
    } catch (err) {
      setError('Error searching for location');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (properties: PhotonProperties): string => {
    const parts: string[] = [];
    if (properties.name) parts.push(properties.name);
    if (properties.street) parts.push(properties.street);
    if (properties.city) parts.push(properties.city);
    if (properties.state) parts.push(properties.state);
    if (properties.country) parts.push(properties.country);
    return parts.join(', ');
  };

  const updateLocationFromLatLng = async (latlng: LatLng): Promise<void> => {
    if (!markerRef.current || !mapRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
      const data: {
        display_name: string;
        error?: string;
      } = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const location: Location = {
        address: data.display_name,
        lat: latlng.lat,
        lng: latlng.lng
      };

      markerRef.current.setLngLat([location.lng, location.lat]);
      mapRef.current.panTo([location.lng, location.lat]);

      setSelectedLocation(location);
      setSearchQuery(location.address);
      setError(null);
      setSearchResults([]);
    } catch (err) {
      setError('Error getting address');
    }
  };

  const handleSearchSelect = (result: SearchResult): void => {
    if (!markerRef.current || !mapRef.current) return;

    const location: Location = {
      address: result.display_name,
      lat: parseFloat(result.lat.toString()),
      lng: parseFloat(result.lon.toString())
    };

    markerRef.current.setLngLat([location.lng, location.lat]);
    mapRef.current.setCenter([location.lng, location.lat]);
    mapRef.current.setZoom(16);

    setSelectedLocation(location);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
                <Search
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                />
                {isLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                    onClick={() => handleSearchSelect(result)}
                  >
                    <span className="font-medium">{result.display_name}</span>
                    <span className="text-sm text-gray-500">
                      {result.properties?.city && `${result.properties.city}, `}
                      {result.properties?.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500">{error}</div>
          )}

          <div className="relative z-0">
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
                <div className="flex flex-col items-center space-y-2">
                  <LoadingSpinnerMore />
                  <p className="text-gray-600 text-sm">Scanning map...</p>
                </div>
              </div>
            )}
            <div
              ref={mapContainerRef}
              className="w-full h-96 rounded-lg shadow-md"
              style={{ minHeight: '400px' }}
            />
          </div>

          {selectedLocation && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium">Selected Location:</h3>
              <p className="text-gray-600">{selectedLocation.address}</p>
              <p className="text-sm text-gray-500">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
