# Map Component System

This folder contains a modular map component system built with OpenLayers. The system is designed to display locations, user position, and provide a rich interactive map experience.

## Components Overview

- **MapComponent**: The main container component that coordinates all map functionality
- **MapPopup**: Handles popup displays when clicking on map markers
- **MapLegend**: Displays the map legend with explanations of different marker types
- **LocationControls**: User interface for location detection and status messages
- **MarkerLayer**: Manages markers/points on the map
- **RouteLayer**: (Placeholder) For displaying routes between locations
- **LocationUtils**: Utility functions for location-related operations

## Usage

### Basic Map Display

```jsx
import MapComponent from '../components/features/map/MapComponent';

// Simple map with GearVN headquarters
<MapComponent height="400px" />

// Map with delivery location
<MapComponent 
  height="500px" 
  deliveryAddress="123 Đường Nguyễn Huệ, Quận 1, TP. HCM" 
/>

// Map with structured address data
<MapComponent 
  addressData={{
    street: "123 Đường Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. HCM"
  }} 
/>
```

### Component Structure

```
MapComponent
├── Map initialization and management
├── MapPopup (popup when clicking markers)
├── LocationControls (location detection UI)
└── MapLegend (map legend display)
```

## Features

- **Location Detection**: Users can detect their precise location using browser geolocation
- **IP-based Rough Location**: Automatically detects user's approximate location based on IP
- **Marker System**: Different marker styles for stores, headquarters, delivery points, and user location
- **Interactive Popups**: Click on any marker to see detailed information
- **Responsive Design**: Works well on all screen sizes

## Future Enhancements

- **Route Display**: Implement the RouteLayer component to show routes between locations
- **Search Integration**: Add search functionality to find locations on the map
- **Clustering**: Group markers when zoomed out for better performance with many locations
- **Custom Controls**: Add additional map controls for zooming, layer toggling, etc. 