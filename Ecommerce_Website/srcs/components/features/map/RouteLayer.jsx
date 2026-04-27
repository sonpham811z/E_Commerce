import React from "react";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { LineString } from "ol/geom";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import { getDistance } from "ol/sphere";
import { Style, Stroke, Text, Fill } from "ol/style";

export const calculateDistance = (startCoord, endCoord) => {
  const start = startCoord;
  const end = endCoord;
  
  const distanceInMeters = getDistance(start, end);
  
  return (distanceInMeters / 1000).toFixed(1);
};

export const createRouteLayer = (startCoordinates, endCoordinates, showDistance = true) => {
  if (!startCoordinates || !endCoordinates) return null;

  const distanceKm = calculateDistance(startCoordinates, endCoordinates);

  const lineGeometry = new LineString([
    fromLonLat(startCoordinates),
    fromLonLat(endCoordinates)
  ]);

  const routeFeature = new Feature({
    geometry: lineGeometry,
    name: 'Đường đi',
    distance: distanceKm,
    isRoute: true
  });

  const routeStyle = new Style({
    stroke: new Stroke({
      color: '#0082c8',
      width: 4,
      lineDash: [0.5, 7],
      lineCap: 'round',
    }),
  });

  routeFeature.setStyle(routeStyle);

  let features = [routeFeature];
  
  if (showDistance) {
    const midX = (startCoordinates[0] + endCoordinates[0]) / 2;
    const midY = (startCoordinates[1] + endCoordinates[1]) / 2;
    
    const labelFeature = new Feature({
      geometry: new LineString([
        fromLonLat([midX, midY]),
      ]),
      name: `${distanceKm} km`,
      isRouteLabel: true
    });
    
    labelFeature.setStyle(
      new Style({
        text: new Text({
          text: `${distanceKm} km`,
          font: 'bold 14px Arial',
          fill: new Fill({
            color: '#0055AA'
          }),
          stroke: new Stroke({
            color: 'white',
            width: 3
          }),
          offsetY: -15,
          padding: [5, 5, 5, 5],
          backgroundFill: new Fill({
            color: 'rgba(255,255,255,0.7)'
          }),
          backgroundStroke: new Stroke({
            color: '#0082c8',
            width: 1
          })
        })
      })
    );
    
    features.push(labelFeature);
  }

  const vectorSource = new VectorSource({
    features: features
  });

  return new VectorLayer({
    source: vectorSource,
    zIndex: 2 
  });
};

const RouteLayer = ({ startCoordinates, endCoordinates, onRouteCreated, showDistance = true }) => {
  React.useEffect(() => {
    if (startCoordinates && endCoordinates && onRouteCreated) {
      const routeLayer = createRouteLayer(startCoordinates, endCoordinates, showDistance);
      if (routeLayer) {
        onRouteCreated(routeLayer);
      }
    }
  }, [startCoordinates, endCoordinates, onRouteCreated, showDistance]);

  return null;
};

export const findShortestRoute = (deliveryCoordinates, storeLocations) => {
  if (!deliveryCoordinates || !storeLocations || storeLocations.length === 0) {
    return null;
  }
  
  let shortestDistance = Number.MAX_VALUE;
  let nearestStore = null;
  
  storeLocations.forEach(store => {
    if (!store.isDeliveryPoint) {
      const distance = parseFloat(calculateDistance(deliveryCoordinates, store.coordinates));
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestStore = store;
      }
    }
  });
  
  if (nearestStore) {
    return {
      start: nearestStore,
      end: { coordinates: deliveryCoordinates },
      distance: shortestDistance
    };
  }
  
  return null;
};

// Future enhancement ideas:
// - Integrate with a routing service (like OpenRouteService or OSRM) to get real routes
// - Add distance and duration information
// - Support for waypoints between start and end
// - Different transportation modes (driving, walking, cycling)

export default RouteLayer;
