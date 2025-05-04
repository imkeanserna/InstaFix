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
      // Set to default Location if user does not have a location
      const storedLocation = getStoredLocation();
      let center: LatLng;
      let address: string;

      if (storedLocation) {
        center = { lat: selectedLocation?.lat || storedLocation.lat, lng: selectedLocation?.lng || storedLocation.lng };
        address = selectedLocation?.address || storedLocation.address;
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
        // Added controls after map is loaded
        map.addControl(new window.maplibregl.FullscreenControl({
          container
        }), 'top-right');

        map.addControl(new window.maplibregl.NavigationControl(), 'top-right');

        // Added marker after map is loaded
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
            <div className={`p-0 md:p-4 bg-white/90 backdrop-blur-sm rounded-md ${isFullscreen ? 'absolute bottom-4 left-4 right-4 z-10' : ''
              }`}>
              <h3 className="text-sm md:text-base font-medium text-start">Selected Location:</h3>
              <div className='flex items-start md:items-center space-x-1 text-gray-600 text-sm'>
                <MapPin className='h-6 w-6 sm:h-4 sm:w-4' />
                <p>{selectedLocation.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LocationDisplayProps {
  freelancerName: string;
  freelancerImage: string;
  location: Location;
  maptilerKey?: string;
}

export function LocationDisplay({ freelancerName, freelancerImage, location, maptilerKey }: LocationDisplayProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [mapLibLoaded, setMapLibLoaded] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const destroyMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    isInitializedRef.current = false;
  };

  const loadMapLibreResources = async () => {
    try {
      setIsMapLoading(true);
      const cssPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });

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
  };

  const createCustomMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    // Marker content with the text label, user image and corner icon
    el.innerHTML = `
      <div class="relative">
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
          <div class="bg-white/90 backdrop-blur-sm capitalize px-3 py-1.5 rounded-2xl shadow-lg text-sm font-medium text-gray-700 relative border border-gray-100">
            <span class="mr-1">👋</span> Hey, I'm ${freelancerName}
            <div class="absolute h-2.5 w-2.5 bg-white rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5 border-b border-r border-gray-100"></div>
          </div>
        </div>
        <div class="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg relative border border-gray-100">
          <img 
            src=${freelancerImage}
            alt="Freelancer Image" 
            class="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 ring-offset-2"
          />
          <div class="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-1.5 shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div class="absolute h-3 w-3 bg-white rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5 border-b border-r border-gray-100"></div>
        </div>
      </div>
    `;
    return el;
  };

  const initializeMap = () => {
    if (!window.maplibregl || !mapContainerRef.current || isInitializedRef.current) return;

    const container = mapContainerRef.current;
    if (!(container instanceof HTMLElement)) {
      setError('Map container not found');
      return;
    }

    destroyMap();

    try {
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
        center: [location.lng, location.lat],
        zoom: 13,
        dragPan: true,
        dragRotate: false,
        scrollZoom: true,
        doubleClickZoom: true
      });

      map.on('load', () => {
        // Navigation control
        map.addControl(new window.maplibregl.NavigationControl({
          showCompass: false
        }), 'top-right');

        // Fullscreen control
        map.addControl(new window.maplibregl.FullscreenControl(), 'top-right');

        // Custom marker
        const marker = new window.maplibregl.Marker({
          element: createCustomMarkerElement(),
          draggable: false
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map);

        markerRef.current = marker;
        setIsMapLoading(false);
      });

      map.on('error', () => {
        setError('An error occurred with the map');
      });

      mapRef.current = map;
      isInitializedRef.current = true;

    } catch (err) {
      setError('Failed to initialize map');
      setIsMapLoading(false);
    }
  };

  useEffect(() => {
    loadMapLibreResources();
    return () => destroyMap();
  }, []);

  useEffect(() => {
    if (mapLibLoaded) {
      initializeMap();
    }
  }, [mapLibLoaded]);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([location.lng, location.lat]);
      markerRef.current.setLngLat([location.lng, location.lat]);
    }
  }, [location]);

  return (
    <div className="w-full">
      <div className="relative space-y-8">
        {isMapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-3xl z-10">
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinnerMore />
              <p className="text-gray-600 text-sm">Loading map...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 mb-2">
            {error}
          </div>
        )}
        <div className='space-y-4'>
          <h3 className="text-2xl font-medium">Service Location</h3>
          <p className='text-gray-800 font-medium'>{location.address}</p>
        </div>
        <div
          ref={mapContainerRef}
          className="w-full h-[500px] rounded-3xl shadow-md"
        />

        <style jsx global>{`
          .maplibregl-ctrl button {
            background-color: #FBBF24 !important;
            color: white !important;
          }
          .maplibregl-ctrl button:hover {
            background-color: #F59E0B !important;
          }
          .maplibregl-ctrl button span {
            filter: brightness(0) invert(1);
          }
          .maplibregl-ctrl {
            border-radius: 0.5rem;
            overflow: hidden;
          }
          .custom-marker {
            transform: translate(-50%, -50%);
          }
          .custom-marker:hover {
            transform: translate(-50%, -50%) scale(1.1);
            transition: transform 0.2s;
          }
          .maplibregl-ctrl-fullscreen {
            background-image: none !important;
          }
          .maplibregl-map.maplibregl-canvas-container {
            border-radius: 1.5rem;
          }
        `}</style>
      </div>
    </div>
  );
}
