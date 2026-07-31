// src/config/layerConfig.ts

import { Style, Stroke, Fill } from 'ol/style';

export interface LayerConfig {
  radius: number;
  topic: string;
  getUrl: (lon: number, lat: number, radius: number) => string;
  style: Style;
}

const buildUrl =
  (topic: string) =>
    (lon: number, lat: number, radius: number) =>
      `https://geo.sandag.org/server/rest/services/Hosted/${topic}/FeatureServer/0/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${radius}&units=esriSRUnit_Meter&outFields=*&returnGeometry=true&f=geojson`;

const baseConfigs: Omit<LayerConfig, 'getUrl'>[] = [
  {
    radius: 1,
    topic: 'Parcels',
    style: new Style({
      stroke: new Stroke({ color: '#00FF00', width: 8 }),
      fill: new Fill({ color: 'rgba(0, 255, 0, 0.25)' }),
    }),
  },
  {
    radius: 100,
    topic: 'Sewer_Main_SD',
    style: new Style({
      stroke: new Stroke({ color: '#FF00FF', width: 2 }),
    }),
  },
  {
    radius: 50,
    topic: 'Zoning_Base_SD',
    style: new Style({
      stroke: new Stroke({ color: '#FF3333', width: 1 }),
    }),
  },
  {
    radius: 50,
    topic: 'Water_Main_SD',
    style: new Style({
      stroke: new Stroke({ color: '#0066FF', width: 5 }),
    }),
  },
  {
    radius: 1000,
    topic: 'Sustainable_Development_Areas',
    style: new Style({
      stroke: new Stroke({ color: '#00FF66', width: 3 }),
    }),
  },
  {
    radius: 1000,
    topic: 'Housing_Solution_Areas',
    style: new Style({
      stroke: new Stroke({ color: '#FFD700', width: 2.5 }),
      fill: new Fill({ color: 'rgba(255, 215, 0, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Promise_Zones_SD',
    style: new Style({
      stroke: new Stroke({ color: '#9933FF', width: 2.5 }),
      fill: new Fill({ color: 'rgba(153, 51, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'MHPA_SD',
    style: new Style({
      stroke: new Stroke({ color: '#FF6B6B', width: 2.5 }),
      fill: new Fill({ color: 'rgba(255, 107, 107, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Coastal_Zones',
    style: new Style({
      stroke: new Stroke({ color: '#FF9966', width: 2.5 }),
      fill: new Fill({ color: 'rgba(255, 153, 102, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Community_Plan_Implementation_Overlay_Zone_SD',
    style: new Style({
      stroke: new Stroke({ color: '#4169E1', width: 2.5 }),
      fill: new Fill({ color: 'rgba(65, 105, 225, 0.1)' }),
    }),

  },
    {
    radius: 100000,
    topic: 'Airport_Influence_Area',
    style: new Style({
      stroke: new Stroke({ color: '#FFBB00', width: 2.5 }),
      fill: new Fill({ color: 'rgba(255, 187, 0, 0.1)' }),
    }),

  },
    {
    radius: 100000,
    topic: 'Historic_Districts_SD',
    style: new Style({
      stroke: new Stroke({ color: '#C0C0C0', width: 2.5 }),
      fill: new Fill({ color: 'rgba(192, 192, 192, 0.1)' }),
    }),

  },
      {
    radius: 100000,
    topic: 'HRB_Designated_Resources_SD',
    style: new Style({
      stroke: new Stroke({ color: '#00CC66', width: 2.5 }),
      fill: new Fill({ color: 'rgba(0, 204, 102, 0.1)' }),
    }),

  },
      {
    radius: 100000,
    topic: 'Fire_Hazard_Severity_Zones_SD',
    style: new Style({
      stroke: new Stroke({ color: '#FF6600', width: 1.5 }),
      fill: new Fill({ color: 'rgba(255, 102, 0, 0.1)' }),
    }),

  },

];

export const layerConfigs: LayerConfig[] = baseConfigs.map(cfg => ({
  ...cfg,
  getUrl: buildUrl(cfg.topic),
}));
