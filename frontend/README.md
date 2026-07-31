
A lightweight React + GeoJSON based mapping interface designed to visualize, explore, and interact with geospatial datasets using modern web technologies.


## Problem

Geospatial datasets are often difficult to visualize without specialized GIS software. Analysts, developers, and researchers need a simpler, browser-based tool that can:

* Load and display GeoJSON layers dynamically
* Visualize markers, regions, and polygons interactively
* Switch between different map layers and base tiles
* Integrate custom APIs for external data (e.g., legislation, statistics)
* Provide an intuitive UI that works seamlessly without GIS expertise

Traditional tools are either too heavy, too costly, or lack customization options for developers looking to embed maps in their applications.

---

## Solution

MapLayer provides an extensible React-based mapping application built using OpenLayers, capable of:

* Rendering GeoJSON datasets directly inside the browser
* Displaying multiple layers with controls for toggling visibility
* Adding marker overlays with custom interactivity
* Integrating external APIs (e.g., LegiScan API)
* Offering a clean UI for switching maps, searching, and navigating
* Deploying at scale using Docker, Jenkins, and containerized workflows

It enables quick visualization and experimentation with spatial datasets while staying lightweight and developer-friendly.

---

## Features

### Core Features

* Load and visualize GeoJSON datasets with OpenLayers
* Multiple layer rendering (base maps, vector layers, custom overlays)
* Marker placement with custom interaction logic
* Search bar for querying map elements
* Modular component structure for easy extension
* Integration-ready API layer

### UI/UX Features

* Landing page and project-specific information pages
* Clean interactive mapping interface
* Dock-style UI elements for layer controls
* Responsive layouts using modern React patterns

### DevOps Features

* Dockerized build for consistent deployments
* Docker Compose support
* CI/CD automation using Jenkins pipelines
* Production-ready Vite bundling

---



## Folder Structure

```plaintext
maplayer/
└── frontend
    └── public
        ├── vite.svg
    └── src
        └── assets
            ├── Address_Points.geojson
            ├── react.svg
        └── components
            └── Methods
                ├── GeoJson_Load.tsx
                ├── Layers.tsx
                ├── Marker.tsx
            └── UI
                ├── another.tsx
                ├── Dock.css
                ├── Dock.tsx
                ├── Map_page.css
                ├── Map_page.tsx
            ├── LandingPage.tsx
            ├── LegiScanAPI.tsx
            ├── OpenLayerEsri.tsx
            ├── OpenLayerMap.tsx
            ├── Projectpage.tsx
            ├── SearchBar.tsx
        ├── App.css
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
    ├── .gitignore
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── Jenkinsfile
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
├── .gitattributes
├── docker-compose.yaml
├── package-lock.json
└── package.json
```

---

## Tech Stack

### Frontend

* React (TypeScript)
* Vite bundler
* OpenLayers for map rendering
* GeoJSON for dataset representation
* Custom CSS for UI components

### DevOps & Deployment

* Docker for containerization
* Docker Compose for local orchestration
* Jenkins CI/CD pipeline
* Nginx (optional, for serving static builds)

---

## Frontend (React + GeoJSON)

The frontend is built with Vite + React and organized into functional modules:

### Methods

* **GeoJson_Load.tsx**
  Handles loading and parsing of GeoJSON datasets, converting them into OpenLayers vector sources.

* **Layers.tsx**
  Manages creation, toggling, and rendering of OpenLayers map layers.

* **Marker.tsx**
  Adds interactive marker overlays with custom styles.

### Mapping Components

* **OpenLayerMap.tsx**
  Main OpenLayers implementation with map initialization, view configuration, and layer attachment.

* **OpenLayerEsri.tsx**
  Optional integration for ESRI tiles/basemaps.

### UI Components

* **Dock.tsx**
  UI menu for layer switching and actions.

* **Map_page.tsx**
  Primary mapping interface.

* **SearchBar.tsx**
  Search functionality (e.g., filter markers, search dataset, API queries).

### Supporting Pages

* Landing page
* Project information page
* LegiScan API integration page

---

## DevOps & Deployment

MapLayer is designed to be production-ready with minimal configuration.

### Dockerfile

Defines a lightweight Node + Nginx pipeline for building and serving the application.

### docker-compose.yaml

Orchestrates services required to run the project locally, including:

* Frontend container
* Optional reverse proxy container


## Frontend Architecture

MapLayer follows a modular, scalable architecture:

1. **UI Layer**
   Presentation components (Dock, Map Page, Search Bar).

2. **Map Logic Layer**
   OpenLayers configuration (map object, layers, markers).

3. **Data Access Layer**
   GeoJSON loader, external API services (LegiScan API).

4. **Asset Layer**
   GeoJSON files, icons, static resources.

5. **Configuration Layer**
   Vite and TypeScript configs.

This separation makes the project easy to scale and adapt to new features.


## High-Level Architecture Diagram

```plaintext
                   +-------------------------+
                   |       Client (UI)       |
                   | React + OpenLayers      |
                   +-----------+-------------+
                               |
                               v
                   +-------------------------+
                   |   Mapping Engine        |
                   |   OpenLayers Logic      |
                   +-----------+-------------+
                               |
                               v
                   +-------------------------+
                   | GeoJSON Data Layer      |
                   | Local assets or APIs    |
                   +-----------+-------------+
                               |
                               v
                   +-------------------------+
                   | External Services       |
                   | Example: LegiScan API   |
                   +-------------------------+

                   +-------------------------+
                   | Deployment Layer        |
                   | Docker + Jenkins + Nginx|
                   +-------------------------+
```

---

## Key Advantages

* Lightweight and fast due to React + Vite
* Highly customizable OpenLayers engine
* Easy to integrate external APIs
* Full support for GeoJSON datasets
* Completely containerized for reliable deployments
* Modular structure suitable for scaling into a full GIS dashboard
* Developer-friendly with TypeScript, linting, and formatted code


