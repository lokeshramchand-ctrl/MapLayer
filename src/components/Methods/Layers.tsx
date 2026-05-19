// src/config/layerConfig.ts

import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';

export interface LayerConfig {
  radius: number;
  topic: string;
  service: string;
  layerId: number;
  getUrl: (lon: number, lat: number, radius: number) => string;
  style: Style;
}

const buildUrl =
  (service: string, layerId: number) =>
  (lon: number, lat: number, radius: number) =>
    `${service}/${layerId}/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${radius}&units=esriSRUnit_Meter&outFields=*&returnsGeometry=true&f=geojson`;

// Genuine ArcGIS REST endpoints (Esri Living Atlas, USGS, CA Geoportal, FEMA)
const SERVICES = {
  // Original CA Services
  CA_Parcels: 'https://gis.lcf.ca.gov/arcgis/rest/services/Parcels_Public/FeatureServer',
  CA_Counties: 'https://gis.water.ca.gov/arcgis/rest/services/Boundaries/i03_CaliforniaCounties/FeatureServer',
  CA_CityBoundaries: 'https://services3.arcgis.com/0i8WvfNdfTbWrPkh/arcgis/rest/services/California_City_Boundaries/FeatureServer',
  CA_ZoningSouth: 'https://services8.arcgis.com/Xr1lDrwMv89PhjD9/arcgis/rest/services/California_Statewide_Zoning_South/FeatureServer',
  CA_ZoningNorth: 'https://services8.arcgis.com/Xr1lDrwMv89PhjD9/arcgis/rest/services/California_Statewide_Zoning_North/FeatureServer',
  CA_FireHistory: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_fires_since_2014/FeatureServer',
  CA_FireBoundaries: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Cal_Fire_historical_fire_boundaries/FeatureServer',
  CA_Highways: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Highways/FeatureServer',
  CA_Schools: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_k12_public_schools/FeatureServer',
  CA_Flood: 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer',
  
  // Newly Added Precise Public Services
  USGS_Earthquakes: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USGS_Seismic_Data_v1/FeatureServer',
  NOAA_WeatherWarnings: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer',
  USA_Parks: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Parks/FeatureServer',
  USA_Rivers: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Rivers_and_Streams/FeatureServer',
  USA_Hospitals: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Hospitals/FeatureServer',
  USA_Railroads: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Railroads/FeatureServer',
  USA_Wetlands: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Wetlands/FeatureServer',
  USA_Structures: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Structures/FeatureServer',
  USA_Wildfire_Perimeters: 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Public_Wildfire_Perimeters_View/FeatureServer'
};

const baseConfigs: Omit<LayerConfig, 'getUrl'>[] = [
  // --- PARCELS & ZONING ---
  {
    radius: 5,
    topic: 'CA_Parcels',
    service: SERVICES.CA_Parcels,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#00FF00', width: 2 }),
      fill: new Fill({ color: 'rgba(0,255,0,0.15)' })
    })
  },
  {
    radius: 100,
    topic: 'CA_ZoningSouth',
    service: SERVICES.CA_ZoningSouth,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#FF3333', width: 2 }),
      fill: new Fill({ color: 'rgba(255,51,51,0.1)' })
    })
  },
  {
    radius: 100,
    topic: 'CA_ZoningNorth',
    service: SERVICES.CA_ZoningNorth,
    layerId: 1,
    style: new Style({
      stroke: new Stroke({ color: '#FF6666', width: 2 }),
      fill: new Fill({ color: 'rgba(255,102,102,0.1)' })
    })
  },

  // --- BOUNDARIES ---
  {
    radius: 500000,
    topic: 'CA_Counties',
    service: SERVICES.CA_Counties,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#444444', width: 2 })
    })
  },
  {
    radius: 250000,
    topic: 'CA_CityBoundaries',
    service: SERVICES.CA_CityBoundaries,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#AA00FF', width: 2 }),
      fill: new Fill({ color: 'rgba(170,0,255,0.05)' })
    })
  },

  // --- INFRASTRUCTURE & FACILITIES ---
  {
    radius: 1000,
    topic: 'CA_Highways',
    service: SERVICES.CA_Highways,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#E6B800', width: 3 })
    })
  },
  {
    radius: 500,
    topic: 'USA_Railroads',
    service: SERVICES.USA_Railroads,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#333333', width: 2, lineDash: [4, 4] }) // Dashed line for railroads
    })
  },
  {
    radius: 5000,
    topic: 'CA_Schools',
    service: SERVICES.CA_Schools,
    layerId: 0,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#9900FF' }),
        stroke: new Stroke({ color: '#FFFFFF', width: 1.5 })
      })
    })
  },
  {
    radius: 5000,
    topic: 'USA_Hospitals',
    service: SERVICES.USA_Hospitals,
    layerId: 0,
    style: new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#FF0000' }), // Red dots for hospitals
        stroke: new Stroke({ color: '#FFFFFF', width: 2 })
      })
    })
  },
  {
    radius: 200, // Small radius for specific structures
    topic: 'USA_Structures',
    service: SERVICES.USA_Structures,
    layerId: 0,
    style: new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({ color: '#888888' })
      })
    })
  },

  // --- ENVIRONMENT & NATURAL FEATURES ---
  {
    radius: 100000,
    topic: 'USA_Parks',
    service: SERVICES.USA_Parks,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#228B22', width: 2 }),
      fill: new Fill({ color: 'rgba(34,139,34,0.3)' }) // Forest green
    })
  },
  {
    radius: 10000,
    topic: 'USA_Rivers',
    service: SERVICES.USA_Rivers,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#00BFFF', width: 2 }) // Deep sky blue
    })
  },
  {
    radius: 10000,
    topic: 'USA_Wetlands',
    service: SERVICES.USA_Wetlands,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#20B2AA', width: 1 }),
      fill: new Fill({ color: 'rgba(32,178,170,0.25)' }) // Light sea green
    })
  },

  // --- HAZARDS & EMERGENCIES ---
  {
    radius: 100000,
    topic: 'CA_FireHistory',
    service: SERVICES.CA_FireHistory,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#FF8C00', width: 2 }), // Dark Orange
      fill: new Fill({ color: 'rgba(255,140,0,0.15)' })
    })
  },
  {
    radius: 100000,
    topic: 'CA_FireBoundaries',
    service: SERVICES.CA_FireBoundaries,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#8B0000', width: 2 }), // Dark Red
      fill: new Fill({ color: 'rgba(139,0,0,0.15)' })
    })
  },
  {
    radius: 50000, // Active fires
    topic: 'USA_Wildfire_Perimeters',
    service: SERVICES.USA_Wildfire_Perimeters,
    layerId: 0,
    style: new Style({
      stroke: new Stroke({ color: '#FF0000', width: 3 }), // Bright Red
      fill: new Fill({ color: 'rgba(255,0,0,0.3)' })
    })
  },
  {
    radius: 100000,
    topic: 'CA_Flood',
    service: SERVICES.CA_Flood,
    layerId: 28, // Common layer ID for NFHL flood hazards
    style: new Style({
      stroke: new Stroke({ color: '#3399FF', width: 2 }),
      fill: new Fill({ color: 'rgba(51,153,255,0.20)' }) // Blue fill for flood zones
    })
  },
  {
    radius: 100000,
    topic: 'USGS_Earthquakes',
    service: SERVICES.USGS_Earthquakes,
    layerId: 0, // Layer 0 is typically recent earthquakes
    style: new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: 'rgba(255, 165, 0, 0.8)' }), // Orange points
        stroke: new Stroke({ color: '#CC5500', width: 1.5 })
      })
    })
  },
  {
    radius: 200000, // Large radius for weather warnings
    topic: 'NOAA_WeatherWarnings',
    service: SERVICES.NOAA_WeatherWarnings,
    layerId: 6, // Layer 6 is typically current watches/warnings polygons
    style: new Style({
      stroke: new Stroke({ color: '#FFD700', width: 3 }), // Gold
      fill: new Fill({ color: 'rgba(255,215,0,0.15)' })
    })
  }
];

export const layerConfigs = baseConfigs.map(cfg => ({
  ...cfg,
  getUrl: buildUrl(cfg.service, cfg.layerId)
}));