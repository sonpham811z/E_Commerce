import React, { useEffect, useRef } from "react";

const MapPopup = ({ map, mapRef }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!map || !mapRef.current) return;

    const container = document.createElement("div");
    container.className =
      "ol-popup bg-white p-3 rounded-md shadow-lg border border-gray-200";
    container.style.position = "absolute";
    container.style.bottom = "12px";
    container.style.left = "-50px";
    container.style.minWidth = "200px";
    container.style.zIndex = "10";
    container.style.display = "none";

    const content = document.createElement("div");
    content.className = "font-medium";
    container.appendChild(content);

    const closer = document.createElement("div");
    closer.className =
      "absolute top-1 right-1 cursor-pointer text-gray-500 hover:text-gray-800";
    closer.innerHTML = "✕";
    container.appendChild(closer);

    mapRef.current.appendChild(container);
    popupRef.current = { container, content };

    closer.addEventListener("click", () => {
      container.style.display = "none";
      return false;
    });

    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );

      if (feature) {
        container.style.display = "block";

        let titleColor = "text-red-600";
        if (feature.get("isDeliveryPoint")) {
          titleColor = "text-blue-600";
        } else if (feature.get("isUserLocation")) {
          titleColor = "text-green-600";
        } else if (feature.get("isHeadquarters")) {
          titleColor = "text-green-600";
        } else if (feature.get("isIpLocation")) {
          titleColor = "text-orange-500";
        }

        content.innerHTML = `
          <div class="font-bold ${titleColor}">${feature.get("name")}</div>
          <div class="text-sm mt-1">${feature.get("address")}</div>
        `;

        container.style.transform = `translate(${evt.pixel[0]}px, ${
          evt.pixel[1] - 30
        }px)`;
      } else {
        container.style.display = "none";
      }
    });

    setTimeout(() => {
      const layers = map.getLayers().getArray();
      const vectorLayer = layers.find(
        (layer) => layer.getSource && layer.getSource().getFeatures
      );

      if (vectorLayer) {
        const features = vectorLayer.getSource().getFeatures();
        const mainFeature =
          features.find((feature) => feature.get("isDeliveryPoint")) ||
          features.find((feature) => feature.get("isHeadquarters"));

        if (mainFeature) {
          const geometry = mainFeature.getGeometry();
          const coordinate = geometry.getCoordinates();

          const pixel = map.getPixelFromCoordinate(coordinate);

          container.style.display = "block";

          const isTitleBlue = mainFeature.get("isDeliveryPoint");
          const isTitleGreen = mainFeature.get("isHeadquarters");
          const titleColor = isTitleBlue
            ? "text-blue-600"
            : isTitleGreen
            ? "text-green-600"
            : "text-red-600";

          content.innerHTML = `
            <div class="font-bold ${titleColor}">${mainFeature.get(
            "name"
          )}</div>
            <div class="text-sm mt-1">${mainFeature.get("address")}</div>
          `;
          container.style.transform = `translate(${pixel[0]}px, ${
            pixel[1] - 30
          }px)`;
        }
      }
    }, 500);

    return () => {
      if (
        mapRef.current &&
        container &&
        container.parentNode === mapRef.current
      ) {
        mapRef.current.removeChild(container);
      }
    };
  }, [map, mapRef]);

  return null;
};

export default MapPopup;
