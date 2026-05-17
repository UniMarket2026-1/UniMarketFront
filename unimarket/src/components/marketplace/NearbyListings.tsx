"use client";

import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { MarkerClusterer, GridAlgorithm } from "@googlemaps/markerclusterer";
import { Product } from "@/lib/types";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import Link from "next/link";
import { useLang } from "@/i18n/LanguageContext";
import { MapPin, Loader } from "lucide-react";

interface NearbyListingsProps {
  products: Product[];
}

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.5rem",
};

const MAP_LIBRARIES: ("places")[] = ["places"];

// Default to Bogotá, Colombia as the center (Universidad de los Andes approximate location)
const defaultCenter = {
  lat: 4.602,
  lng: -74.0655,
};

export function NearbyListings({ products }: NearbyListingsProps) {
  const { t } = useLang();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAP_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Filter products that have coordinates
  const productsWithCoords = products.filter((p) => p.latitude && p.longitude && p.active);

  useEffect(() => {
    if (!isLoaded || !map || productsWithCoords.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    const markers = productsWithCoords.map((product) => {
      const marker = new google.maps.Marker({
        position: {
          lat: Number(product.latitude),
          lng: Number(product.longitude),
        },
        title: product.name,
        map: map,
      });

      marker.addListener("click", () => {
        setSelectedProduct(product);
      });

      return marker;
    });

    markersRef.current = markers;

    // Add clustering if markers exist
    if (markers.length > 0) {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
        algorithm: new GridAlgorithm({ maxZoom: 15 }),
      });
    }

    // Auto-fit bounds if products exist
    if (productsWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      productsWithCoords.forEach((product) => {
        bounds.extend({
          lat: Number(product.latitude),
          lng: Number(product.longitude),
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, isLoaded, productsWithCoords]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold">Cerca de ti</h2>
        <span className="text-sm text-gray-600">({productsWithCoords.length} productos)</span>
      </div>

      {productsWithCoords.length === 0 ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              No hay productos con ubicación disponible
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={13} onLoad={setMap}>
            {selectedProduct && (
              <InfoWindow
                position={{
                  lat: Number(selectedProduct.latitude),
                  lng: Number(selectedProduct.longitude),
                }}
                onCloseClick={() => setSelectedProduct(null)}
              >
                <div className="w-64 max-h-96 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <ImageWithFallback
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/product/${selectedProduct.id}`}
                        className="font-semibold text-blue-600 hover:underline block mb-1 truncate"
                      >
                        {selectedProduct.name}
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        ${Number(selectedProduct.price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        📍 {selectedProduct.meetingPoint}
                      </p>
                      <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                        {selectedProduct.condition}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
}
