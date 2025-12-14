// src/components/map/MapIcons.ts
// version: 1.0.0
// UTILITY: centralized SVG definitions and Leaflet Icon generators.

import L from 'leaflet';

// --- SVG Shapes & Icons ---
const getBedIconSvg = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path>
  <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
  <path d="M12 4v6"></path>
  <path d="M2 18h20"></path>
</svg>`;

const getCameraIconSvg = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
  <circle cx="12" cy="13" r="3"></circle>
</svg>`;

const getSquareShapeSvg = (color: string) => `
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="40" height="40" rx="8" fill="${color}" stroke="white" stroke-width="2.5"/>
</svg>`;

const getCircleShapeSvg = (color: string) => `
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="20" fill="${color}" stroke="white" stroke-width="2.5"/>
</svg>`;

// --- Generator Function ---
const createCustomMarker = (shapeSvg: string, iconSvg: string, size: number) => {
    const shapeUri = `data:image/svg+xml;utf8,${encodeURIComponent(shapeSvg)}`;
    const iconUri = `data:image/svg+xml;utf8,${encodeURIComponent(iconSvg)}`;
    const iconSize = size * 0.45;

    const html = `
        <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; justify-content: center; align-items: center;">
            <div style="position: absolute; width: ${size * 0.8}px; height: ${size * 0.8}px; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.3); top: 2px;"></div>
            <img src="${shapeUri}" style="width: ${size}px; height: ${size}px; position: absolute; z-index: 1;" />
            <img src="${iconUri}" style="width: ${iconSize}px; height: ${iconSize}px; position: absolute; z-index: 2;" />
        </div>
    `;

    return new L.DivIcon({
        html: html,
        className: 'custom-geo-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2)]
    });
};

// --- Exports ---
export const MARKER_SIZE = 38;
export const hotelIcon = createCustomMarker(getSquareShapeSvg('#3b82f6'), getBedIconSvg(), MARKER_SIZE);
export const attractionIcon = createCustomMarker(getCircleShapeSvg('#f97316'), getCameraIconSvg(), MARKER_SIZE);
