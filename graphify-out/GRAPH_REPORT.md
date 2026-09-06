# Graph Report - MapLayer  (2026-09-06)

## Corpus Check
- Corpus is ~10,766 words - fits in a single context window. You may not need a graph.

## Summary
- 225 nodes · 265 edges · 30 communities (9 shown, 16 thin omitted)
- Extraction: 96% EXTRACTED · 3% INFERRED · 1% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.84)
- Token cost: 41,398 input · 0 output

## Community Hubs (Navigation)
- Backend Spatial API
- Frontend Runtime Dependencies
- App Shell & Deployment
- Frontend Lint Tooling
- TypeScript App Config
- TypeScript Node Config
- Map Layer Components
- Landing & Legislative UI
- Frontend Package Scripts
- TypeScript Root Config
- MCP/SSE Backend Deps
- MongoDB Backend Deps
- Deps Package Metadata
- HTTPX Dependency
- Ollama Dependency
- Pydantic Dependency
- PyJWT Dependency
- Milvus Vector DB Dependency
- PyMySQL Dependency
- Python-dotenv Dependency
- Argcomplete Dependency
- CRIU Checkpoint Tool
- Pipx Dependency
- PyCRIU Dependency
- Wheel Dependency

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 16 edges
3. `MapLayer Project` - 14 edges
4. `search_ca_codes()` - 8 edges
5. `OpenLayers` - 7 edges
6. `search_pdf_handbook()` - 6 edges
7. `chat_with_spatial_agent()` - 6 edges
8. `PolygonRequest` - 5 edges
9. `codes_rag_endpoint()` - 5 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `favicon.svg (location pin icon)` --conceptually_related_to--> `MapLayer Project`  [INFERRED]
  frontend/src/assets/favicon.svg → README.md
- `vite.svg (Vite logo icon)` --conceptually_related_to--> `Vite Bundler`  [INFERRED]
  frontend/public/vite.svg → README.md
- `MapLayer Project` --conceptually_related_to--> `fastapi==0.138.2`  [AMBIGUOUS]
  README.md → backend/requirements.txt
- `MapLayer Project` --references--> `MapLayer Frontend`  [INFERRED]
  README.md → frontend/README.md
- `MapLayer Frontend` --references--> `React`  [EXTRACTED]
  frontend/README.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mapping/UI Components Forming Frontend Architecture** — readme_geojson_load_component, readme_layers_component, readme_marker_component, readme_openlayermap_component, readme_openlayeresri_component, readme_dock_component, readme_map_page_component, readme_searchbar_component [EXTRACTED 0.90]
- **DevOps Deployment Stack** — readme_docker, readme_docker_compose, readme_jenkins, readme_nginx [EXTRACTED 0.90]
- **Backend Database/Vector Store Dependencies** — backend_requirements_pymongo, backend_requirements_motor, backend_requirements_pymysql, backend_requirements_pymilvus [INFERRED 0.75]

## Communities (30 total, 16 thin omitted)

### Community 0 - "Backend Spatial API"
Cohesion: 0.15
Nodes (30): AddressRequest, analyze_property_hazards(), chat_with_spatial_agent(), ChatRequest, check_airport_zone(), check_coastal_zone(), check_fire_zone(), CodeEntry (+22 more)

### Community 1 - "Frontend Runtime Dependencies"
Cohesion: 0.06
Nodes (31): framer-motion, dependencies, framer-motion, gsap, leaflet, lucide-react, ol, ol-ext (+23 more)

### Community 2 - "App Shell & Deployment"
Cohesion: 0.10
Nodes (26): fastapi==0.138.2, starlette==1.3.1, uvicorn==0.49.0, vite.svg (Vite logo icon), MapLayer Frontend, favicon.svg (location pin icon), src/main.tsx (entrypoint), Dock.tsx (+18 more)

### Community 3 - "Frontend Lint Tooling"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+17 more)

### Community 4 - "TypeScript App Config"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+15 more)

### Community 5 - "TypeScript Node Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 6 - "Map Layer Components"
Cohesion: 0.20
Nodes (11): loadAndRenderGeoJsonLayer(), baseConfigs, buildUrl(), LayerConfig, layerConfigs, addMarker(), ChatMessage, extractColorFromStyle() (+3 more)

### Community 7 - "Landing & Legislative UI"
Cohesion: 0.22
Nodes (8): App(), LandingPage(), LandingPageProps, getBills(), LegiScanAPI(), fillColors, OpenLayerEsri(), style

### Community 8 - "Frontend Package Scripts"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

## Ambiguous Edges - Review These
- `MapLayer Project` → `fastapi==0.138.2`  [AMBIGUOUS]
  backend/requirements.txt · relation: conceptually_related_to
- `LegiScan API` → `SearchBar.tsx`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **105 isolated node(s):** `type`, `name`, `private`, `version`, `type` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `MapLayer Project` and `fastapi==0.138.2`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `LegiScan API` and `SearchBar.tsx`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Frontend Runtime Dependencies` to `Frontend Package Scripts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Frontend Lint Tooling` to `Frontend Package Scripts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `MapLayer Project` (e.g. with `favicon.svg (location pin icon)` and `MapLayer Frontend`) actually correct?**
  _`MapLayer Project` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `type`, `name`, `private` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._