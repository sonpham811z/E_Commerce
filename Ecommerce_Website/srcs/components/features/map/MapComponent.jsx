import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";

import { 
  getLocationFromIP, 
  getStoreLocations,
  createIpLocationFeature 
} from "./LocationUtils";
import MapPopup from "./MapPopup";
import MapLegend from "./MapLegend";
import LocationControls, { handleUserLocationDetection } from "./LocationControls";
import { createLocationFeatures } from "./MarkerLayer";
import RouteLayer, { findShortestRoute, createRouteLayer } from "./RouteLayer";

const GEARVN_HQ = [106.6835, 10.7631]; 

const MapComponent = ({ height = "350px", addressData = null, deliveryAddress = null }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [ipLocationLoading, setIpLocationLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Function to handle browser geolocation detection (precise location)
  const detectUserLocation = () => {
    handleUserLocationDetection(map, setLocationError, setHasLocation);
  };
  
  // Fetch IP-based location when component mounts
  useEffect(() => {
    const fetchIpLocation = async () => {
      setIpLocationLoading(true);
      try {
        const coords = await getLocationFromIP();
        // Only set location if we received valid coordinates
        if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          setIpLocation(coords);
          
          if (map) {
            // Add IP-based location marker
            const ipFeature = createIpLocationFeature(coords);
            
            // Add feature to map
            const layers = map.getLayers().getArray();
            const vectorLayer = layers.find(layer => layer instanceof VectorLayer);
            if (vectorLayer) {
              const source = vectorLayer.getSource();
              // Remove any previous IP location features
              source.getFeatures().forEach(feature => {
                if (feature.get('isIpLocation')) {
                  source.removeFeature(feature);
                }
              });
              source.addFeature(ipFeature);
            }
          }
        } else {
          console.warn("Received invalid coordinates from IP location");
        }
      } catch (error) {
        console.error("Error setting IP location:", error);
      } finally {
        setIpLocationLoading(false);
      }
    };
    
    // Only call if we're not showing headquarters specifically
    if (addressData || deliveryAddress) {
      fetchIpLocation();
    }
  }, [map]);

  useEffect(() => {
    // Get location data - no need to store in state since we're using it immediately
    const locations = getStoreLocations(addressData, deliveryAddress);
    
    // Log delivery location for debugging
    const deliveryPoint = locations.find(loc => loc.isDeliveryPoint);
    if (deliveryPoint) {
      console.log("Delivery point:", deliveryPoint);
      console.log("Delivery coordinates:", deliveryPoint.coordinates);
      console.log("Delivery address:", deliveryPoint.address);
    }
    
    // Create vector source and layer for markers
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const newMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        // Center on the delivery location if available, otherwise use first location
        center: fromLonLat(
          locations[0]?.coordinates || [106.6835, 10.7631]
        ),
        zoom: 14,
      }),
    });
    
    // Add features for all locations - use the standalone function instead
    createLocationFeatures(locations, (feature) => {
      vectorSource.addFeature(feature);
    });
    
    // If we have a delivery point, calculate the shortest route
    if (deliveryPoint) {
      const shortestRoute = findShortestRoute(deliveryPoint.coordinates, locations);
      
      if (shortestRoute) {
        // Save the route information
        setRouteInfo(shortestRoute);
        
        // Create and add the route layer
        const routeLayer = createRouteLayer(
          shortestRoute.start.coordinates, 
          shortestRoute.end.coordinates,
          true // show distance
        );
        
        if (routeLayer) {
          newMap.addLayer(routeLayer);
        }
      }
    }
    
    // Store map in state for later use
    setMap(newMap);

    // Add pulsing effect to user location if needed
    if (hasLocation && mapRef.current) {
      const userMarker = mapRef.current.querySelector('.user-location-pulse');
      if (!userMarker) {
        const pulseDiv = document.createElement('div');
        pulseDiv.className = 'user-location-pulse';
        pulseDiv.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(25, 118, 210, 0.3);
          animation: pulse 1.5s infinite;
          z-index: 100;
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes pulse {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(styleElement);
      }
    }

    return () => {
      newMap.setTarget(null);
      setMap(null);
    };
  }, [addressData, deliveryAddress, height, hasLocation]);

  // Add pulsing effect to user location
  useEffect(() => {
    if (hasLocation && mapRef.current) {
      const userMarker = mapRef.current.querySelector('.user-location-pulse');
      if (!userMarker) {
        const pulseDiv = document.createElement('div');
        pulseDiv.className = 'user-location-pulse';
        pulseDiv.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(25, 118, 210, 0.3);
          animation: pulse 1.5s infinite;
          z-index: 100;
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes pulse {
            0% {
              transform: scale(0.5);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
  }, [hasLocation]);

  return (
    <div className="map-container">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        {deliveryAddress || addressData ? 'Vị trí giao hàng' : 'Trụ sở chính GearVN'}
      </h2>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: height,
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      />
      
      {/* Route Information Display */}
      {routeInfo && (
        <div className="mt-2 p-2 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-200">
          <div className="font-medium">Thông tin vận chuyển:</div>
          <div className="flex justify-between items-center mt-1">
            <div>
              <span className="font-semibold">Từ:</span> {routeInfo.start.name || 'Cửa hàng GearVN'}
            </div>
            <div>
              <span className="font-semibold">Khoảng cách:</span> {routeInfo.distance} km
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            * Đường đi ngắn nhất đã được hiển thị trên bản đồ
          </div>
        </div>
      )}
      
      {/* Map Popup Component */}
      <MapPopup map={map} mapRef={mapRef} />
      
      {/* Location Controls Component */}
      <LocationControls 
        detectUserLocation={detectUserLocation}
        hasLocation={hasLocation}
        locationError={locationError}
        ipLocation={ipLocation}
        ipLocationLoading={ipLocationLoading}
        map={map}
      />
      
      {/* Map Legend Component */}
      <MapLegend 
        ipLocation={ipLocation}
        ipLocationLoading={ipLocationLoading}
        showRoute={!!routeInfo}
      />
    </div>
  );
};

export default MapComponent;
