import React from "react";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon, Circle, Fill, Stroke } from "ol/style";
import { fromLonLat } from "ol/proj";
import { markerUrls } from "./LocationUtils";

export const createLocationFeatures = (locations, onFeatureCreated = () => {}) => {
  return locations.map((location) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat(location.coordinates)),
      name: location.name,
      address: location.address,
      isDeliveryPoint: location.isDeliveryPoint || false,
      isHeadquarters: location.isHeadquarters || false,
      isUserLocation: location.isUserLocation || false,
      isIpLocation: location.isIpLocation || false
    });

    if (location.isUserLocation) {
      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({
              color: 'rgba(0, 128, 255, 0.7)'
            }),
            stroke: new Stroke({
              color: 'white',
              width: 2
            })
          })
        })
      );
    } else if (location.isIpLocation) {
      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: 'rgba(255, 165, 0, 0.7)'
            }),
            stroke: new Stroke({
              color: 'white',
              width: 1.5
            })
          })
        })
      );
    } else {
      feature.setStyle(
        new Style({
          image: new Icon({
            src: location.isDeliveryPoint 
              ? markerUrls.delivery 
              : location.isHeadquarters 
                ? markerUrls.headquarters 
                : markerUrls.default,
            scale: location.isDeliveryPoint || location.isHeadquarters ? 1 : 0.8, 
            anchor: [0.5, 1],
          }),
        })
      );
    }

    onFeatureCreated(feature);
    
    return feature;
  });
};

const MarkerLayer = ({ locations, onFeatureCreated = () => {} }) => {
  React.useEffect(() => {
    createLocationFeatures(locations, onFeatureCreated);
  }, [locations, onFeatureCreated]);

  return null;
};

export const createUserLocationFeature = (coordinates) => {
  const feature = new Feature({
    geometry: new Point(fromLonLat(coordinates)),
    name: "Vị trí chính xác của bạn",
    address: "Vị trí hiện tại của bạn (GPS)",
    isUserLocation: true
  });

  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(0, 128, 255, 0.7)'
        }),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      })
    })
  );

  return feature;
};

export const createIpLocationFeature = (coordinates) => {
  const feature = new Feature({
    geometry: new Point(fromLonLat(coordinates)),
    name: "Vị trí khu vực của bạn",
    address: "Vị trí dựa trên IP của bạn",
    isIpLocation: true
  });
  
  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgba(255, 165, 0, 0.7)'
        }),
        stroke: new Stroke({
          color: 'white',
          width: 1.5
        })
      })
    })
  );

  return feature;
};

export default MarkerLayer; 