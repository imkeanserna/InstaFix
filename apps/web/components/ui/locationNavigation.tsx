"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@repo/ui/components/ui/input';
import type maplibregl from 'maplibre-gl';
import { LoadingSpinnerMore } from '@repo/ui/components/ui/loading-spinner-more';
import { getStoredLocation } from '@/lib/sessionUtils';

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
  setIsMapInteracting?: (value: boolean) => void;
}

export default function LocationNavigation({
  selectedLocation,
  setSelectedLocation,
  maptilerKey,
  setIsMapInteracting
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

    const container = mapContainerRef.current;
    if (!(container instanceof HTMLElement)) {
      setError('Map container not found');
      return;
    }

    destroyMap();

    try {
      // Default Location if user does not have a location
      const storedLocation = getStoredLocation();
      let center: LatLng;
      let address: string;

      if (storedLocation) {
        center = { lat: storedLocation.lat, lng: storedLocation.lng };
        address = storedLocation.address;
      } else {
        try {
          const position = await getUserLocation();
          center = { lat: position.lat, lng: position.lng };
          address = await getAddressFromCoords(center);
        } catch (locationError) {
          center = { lat: 40.7128, lng: -74.0060 };
          address = "New York City, New York, USA";
        }
      }

      setSearchQuery(address);
      setSelectedLocation({
        address: address,
        lat: center.lat,
        lng: center.lng
      });

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
        container,
        style: mapStyle as maplibregl.StyleSpecification,
        center: [center.lng, center.lat],
        zoom: 13
      });

      // Wait for the map to load before adding controls and markers
      map.on('load', () => {
        // Add controls after map is loaded
        map.addControl(new window.maplibregl.FullscreenControl({
          container
        }), 'top-right');

        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

        // Add marker after map is loaded
        const marker = new window.maplibregl.Marker({
          draggable: true,
          color: '#FF0000'
        })
          .setLngLat([center.lng, center.lat])
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          updateLocationFromLatLng({ lat: lngLat.lat, lng: lngLat.lng });
          if (setIsMapInteracting) setIsMapInteracting(false);
        });

        markerRef.current = marker;
        setIsMapLoading(false);
      });

      map.on('click', (e: maplibregl.MapMouseEvent) => {
        if (markerRef.current) {
          updateLocationFromLatLng({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          markerRef.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      map.on("mousedown", () => {
        if (setIsMapInteracting) setIsMapInteracting(true);
      });

      map.on("mouseup", () => {
        if (setIsMapInteracting) setIsMapInteracting(false);
      });

      map.on('error', (e) => {
        setError('An error occurred with the map');
      });

      mapRef.current = map;
      isInitializedRef.current = true;

    } catch (err) {
      setError('Failed to initialize map');
      setIsMapLoading(false);
    }
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

  // Cleanup for fullscreen mode change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    <div className="w-full">
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <div className={`space-y-4 ${isFullscreen ? 'h-full relative' : ''}`}>
          <div className={`relative ${isFullscreen ? 'absolute top-0 left-0 right-0 z-10 px-4' : ''}`}>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="p-8 pl-10 bg-white/90 backdrop-blur-sm rounded-lg"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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

          {/* Error Message */}
          {error && (
            <div className={`text-red-500 ${isFullscreen ? 'absolute top-16 left-4 right-4 z-10' : ''}`}>
              {error}
            </div>
          )}

          {/* Map Container */}
          <div className={`relative z-0 ${isFullscreen ? 'h-full' : ''}`}>
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
              className={`w-full rounded-lg shadow-md ${isFullscreen ? 'h-full' : 'h-[600px]'}`}
            />
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className={`p-4 bg-white/90 backdrop-blur-sm rounded-md ${isFullscreen ? 'absolute bottom-4 left-4 right-4 z-10' : ''
              }`}>
              <h3 className="font-medium">Selected Location:</h3>
              <div className='flex items-center space-x-1 text-gray-600'>
                <MapPin className='h-6 w-6 sm:h-4 sm:w-4' />
                <p >{selectedLocation.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
