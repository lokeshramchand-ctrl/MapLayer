// src/config/layerConfig.ts

import { Style, Stroke, Fill } from 'ol/style';

export interface LayerConfig {
  radius: number;
  topic: string;
  style: Style;
}

// ✅ These are the same — only difference: no getUrl, no buildUrl
export const layerConfigs: LayerConfig[] = [
  {
    radius: 1,
    topic: 'Parcels',
    style: new Style({
      stroke: new Stroke({ color: 'green', width: 1.5 }),
      fill: new Fill({ color: 'rgba(0, 255, 0, 0.1)' }),
    }),
  },
  {
    radius: 100,
    topic: 'Sewer_Main_SD',
    style: new Style({
      stroke: new Stroke({ color: 'purple', width: 2 }),
    }),
  },
  {
    radius: 50,
    topic: 'Zoning_Base_SD',
    style: new Style({
      stroke: new Stroke({ color: 'red', width: 1 }),
    }),
  },
  {
    radius: 50,
    topic: 'Water_Main_SD',
    style: new Style({
      stroke: new Stroke({ color: 'blue', width: 5 }),
    }),
  },
  {
    radius: 1000,
    topic: 'Sustainable_Development_Areas',
    style: new Style({
      stroke: new Stroke({ color: 'green', width: 3 }),
    }),
  },
  {
    radius: 1000,
    topic: 'Housing_Solution_Areas',
    style: new Style({
      stroke: new Stroke({ color: 'black', width: 2.5 }),
      fill: new Fill({ color: 'rgba(255, 200, 0, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Promise_Zones_SD',
    style: new Style({
      stroke: new Stroke({ color: 'black', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'MHPA_SD',
    style: new Style({
      stroke: new Stroke({ color: 'orange', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Coastal_Zones',
    style: new Style({
      stroke: new Stroke({ color: 'skin', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Community_Plan_Implementation_Overlay_Zone_SD',
    style: new Style({
      stroke: new Stroke({ color: 'darkblue', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Parks',
    style: new Style({
      stroke: new Stroke({ color: 'green', width: 2.5 }),
      fill: new Fill({ color: 'rgba(3, 255, 16, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Transit_Stops_GTFS',
    style: new Style({
      stroke: new Stroke({ color: 'green', width: 2.5 }),
      fill: new Fill({ color: 'rgba(3, 255, 16, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Airport_Influence_Area',
    style: new Style({
      stroke: new Stroke({ color: 'darkyellow', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Historic_Districts_SD',
    style: new Style({
      stroke: new Stroke({ color: 'white', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'HRB_Designated_Resources_SD',
    style: new Style({
      stroke: new Stroke({ color: 'darkgreen', width: 2.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
  {
    radius: 100000,
    topic: 'Fire_Hazard_Severity_Zones_SD',
    style: new Style({
      stroke: new Stroke({ color: 'yellow', width: 1.5 }),
      fill: new Fill({ color: 'rgba(116, 3, 255, 0.1)' }),
    }),
  },
];
