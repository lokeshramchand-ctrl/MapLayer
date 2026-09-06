# SITEPILOT
## California Development Acquisition Intelligence Platform
### Product, UX, Technical Architecture, Data, AI, Security, Roadmap & Implementation Specification

**Document status:** Product/technical master specification  
**Target market:** San Diego, California first; California expansion thereafter  
**Primary customer:** Real-estate developers and acquisition teams  
**Core promise:** **Know what you can build before you buy.**

---

# 1. Executive Summary

SitePilot is a B2B SaaS platform that helps real-estate developers evaluate land and property before committing acquisition capital.

The core workflow is:

> **Property → Development Intent → Spatial + Regulatory Intelligence → Feasibility → Risks → Evidence → Acquisition Decision**

A user enters an address/APN and describes a proposed project such as:

- 8 townhomes
- 20-unit multifamily
- ADU/lot development
- mixed-use building
- small commercial project
- warehouse
- senior housing

SitePilot analyzes the property against applicable spatial, zoning, regulatory, environmental, hazard, infrastructure and development constraints, then produces an evidence-backed preliminary feasibility assessment.

The product must not behave like a generic GIS viewer or a generic AI chatbot. The primary output is a **decision**.

### Primary decision

> **PURSUE / INVESTIGATE / PASS**

supported by:

- development potential
- constraints
- risks
- likely approval pathway
- applicable regulations
- unresolved questions
- source evidence
- confidence
- assumptions
- data freshness

The product should initially be extremely deep in San Diego rather than shallow across the United States.

---

# 2. Product Thesis

## 2.1 The problem

Real-estate development begins with a deceptively simple question:

> **What can I realistically build on this property?**

The answer is fragmented across:

- zoning maps
- development regulations
- parcel records
- overlays
- municipal codes
- planning documents
- environmental constraints
- hazard maps
- transportation requirements
- fire requirements
- housing legislation
- local amendments
- project-specific conditions

Developers currently spend substantial time coordinating information across public websites, GIS systems, consultants, architects, planners, engineers and attorneys.

The product opportunity is to create a structured intelligence layer between:

> **Property discovery**

and

> **Professional due diligence / acquisition decision**

---

# 3. Product Positioning

## 3.1 One-line positioning

> **SitePilot tells California developers what they can potentially build, what could block the project, what approvals may be required, and whether a property is worth pursuing.**

## 3.2 Tagline

> **Know what you can build before you buy.**

## 3.3 Category

**Development Acquisition Intelligence**

Do not position primarily as:

- GIS software
- AI zoning chatbot
- property search
- permitting software
- generic real-estate analytics

Those are implementation categories.

The customer-facing category should communicate the business outcome.

---

# 4. Target Users

## 4.1 Primary ICP

Small and mid-sized real-estate developers in San Diego.

Highest-priority segments:

1. Infill residential developers
2. Multifamily developers
3. Townhome developers
4. ADU/lot development specialists
5. Small commercial developers
6. Land acquisition teams

## 4.2 Secondary users

### Property owner

Question:

> What can I do with my property?

### Architect

Question:

> What constraints should I account for before designing?

### Land-use consultant

Question:

> Give me a structured research starting point.

### Attorney

Question:

> Show me the regulatory evidence and unresolved issues.

### Broker

Question:

> Help me communicate development potential.

### Investor/lender

Question:

> Show me the acquisition and entitlement risk.

---

# 5. Product Modes

The product should have three modes.

## 5.1 Explore

For property owners and early-stage users.

> “What could I potentially do with this property?”

## 5.2 Evaluate

The primary professional workflow.

> “Should I pursue this acquisition?”

## 5.3 Monitor

For saved properties and portfolios.

> “Did anything change that affects this opportunity?”

---

# 6. Core Product Loop

```text
DISCOVER
   ↓
SELECT PROPERTY
   ↓
DEFINE PROJECT
   ↓
ANALYZE SITE
   ↓
ANALYZE REGULATIONS
   ↓
CALCULATE FEASIBILITY
   ↓
IDENTIFY RISKS
   ↓
SHOW EVIDENCE
   ↓
PURSUE / INVESTIGATE / PASS
   ↓
SAVE TO PIPELINE
   ↓
MONITOR CHANGES
```

---

# 7. Information Architecture

The application should use a professional SaaS shell.

```text
┌─────────────────────────────────────────────────────────────┐
│ SitePilot       Search       + New Analysis      User       │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│ Dashboard     │                 Main Workspace              │
│ Properties    │                                             │
│ Opportunities │                                             │
│ Analyses      │                                             │
│ Map           │                                             │
│ Reports       │                                             │
│ Monitoring    │                                             │
│ Regulations   │                                             │
│ Team          │                                             │
│ Settings      │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

# 8. Complete Screen Inventory

## Public / Marketing

1. Landing Page
2. Product Overview
3. How It Works
4. Example Analysis
5. Pricing
6. Security / Trust
7. Login
8. Sign Up
9. Forgot Password

## Onboarding

10. Welcome
11. Organization Setup
12. User Role
13. Primary Market
14. Development Types
15. First Property

## Core Application

16. Dashboard
17. Property Search
18. Map Explorer
19. New Analysis Wizard
20. Property Overview
21. Project Definition
22. Site Intelligence
23. Zoning Intelligence
24. Regulatory Intelligence
25. Constraint Analysis
26. Feasibility Dashboard
27. Risk Register
28. Evidence Explorer
29. AI Analyst
30. Scenario Builder
31. Property Comparison
32. Acquisition Pipeline
33. Saved Properties
34. Analysis History
35. Reports
36. Report Viewer
37. Report Export
38. Monitoring Dashboard
39. Property Monitoring Detail
40. Regulatory Change Feed
41. Team Workspace
42. Activity Log
43. Billing
44. Organization Settings
45. Data Source Administration
46. Admin QA Console

---

# 9. Screen Specifications

# 9.1 Landing Page

Purpose:

Convert a developer from visitor to first property analysis.

Hero:

> **Know what you can build before you buy.**

Supporting statement:

> Analyze a California property against zoning, development standards, site constraints and regulatory requirements before you commit acquisition capital.

Primary CTA:

> **Analyze a Property**

Secondary CTA:

> **See Example Analysis**

Sections:

- problem
- workflow
- example report
- evidence/provenance
- developer use cases
- jurisdiction coverage
- pricing
- trust/disclaimer
- CTA

Do not make the landing page look like a generic AI startup.

---

# 9.2 Dashboard

Primary developer command center.

Cards:

- Active opportunities
- Properties under evaluation
- High-risk sites
- Analyses completed
- Regulatory changes
- Reports generated

Main table:

| Property | Project | Feasibility | Risk | Status | Last Updated |
|---|---|---:|---:|---|---|
| Site A | 12 units | 82 | Medium | Pursue | Today |
| Site B | 8 units | 61 | High | Investigate | Yesterday |

Actions:

- New Analysis
- Add Property
- Compare
- Generate Report
- Review Changes

---

# 9.3 New Analysis Wizard

This is one of the most important screens.

### Step 1 — Property

Input:

- address
- APN
- map selection
- parcel upload

Resolve:

- latitude/longitude
- parcel geometry
- jurisdiction
- parcel identifier

### Step 2 — Development Intent

Ask:

**What are you trying to build?**

Templates:

- ADU
- Single-family
- Duplex
- Townhomes
- Multifamily
- Mixed-use
- Retail
- Office
- Industrial
- Custom

Fields:

- target units
- stories
- approximate building area
- parking assumptions
- lot split/subdivision intent
- affordable housing component
- development timeline
- optional target purchase price

### Step 3 — Analysis Depth

- Quick Screen
- Standard Feasibility
- Acquisition Diligence

### Step 4 — Analyze

Show transparent progress:

```text
Resolving parcel                  ✓
Determining jurisdiction          ✓
Loading zoning                    ✓
Checking overlays                 ✓
Analyzing hazards                 ✓
Searching regulations             ✓
Evaluating development standards  …
Calculating feasibility            …
Building evidence graph            …
```

---

# 9.4 Property Overview

Header:

> 123 Main Street, San Diego, CA

Metadata:

- APN
- jurisdiction
- parcel area
- coordinates
- zoning
- analysis date
- data freshness

Actions:

- Analyze
- Compare
- Save
- Export
- Monitor

Map:

- parcel boundary
- satellite/base map
- selected overlays
- surrounding context

---

# 9.5 Site Intelligence

The map becomes the main analytical workspace.

Left panel:

- parcel
- zoning
- fire
- coastal
- airport
- flood
- environmental
- slope/topography
- infrastructure
- transit
- historical
- other jurisdiction-specific layers

Right panel:

**Site Findings**

Each finding:

```text
FIRE ACCESS
Medium Risk

Potential fire-access constraint detected.

Why it matters:
May affect site layout and approval requirements.

Evidence:
[View source] [View map]
```

The map is not the product.

The map is evidence supporting the decision.

---

# 9.6 Zoning Intelligence

Show:

### Base Zone

Example:

> RM-2-5

### Permitted Uses

- permitted
- conditionally permitted
- prohibited
- unclear

### Development Standards

- density
- FAR
- height
- setbacks
- lot coverage
- parking
- open space
- landscaping

### Applicability

Every rule should display:

- applicable / potentially applicable / not applicable
- reason
- source
- effective date
- confidence

---

# 9.7 Regulatory Intelligence

Searchable regulatory workspace.

User can ask:

> “What regulations affect this site?”

The system returns structured answers.

Example:

```text
Question:
Can this property qualify for a streamlined housing pathway?

Answer:
Potentially. Two eligibility conditions require verification.

Evidence:
California source
Municipal source
Local development regulation

Confidence:
Medium

Open questions:
- Confirm jurisdiction compliance
- Confirm project eligibility
```

Never return unsupported certainty.

---

# 9.8 Feasibility Dashboard

This is the flagship screen.

Header:

# Preliminary Feasibility

### Overall

**82 / 100**

### Recommendation

**PURSUE — WITH CONDITIONS**

Then score dimensions:

```text
Development Capacity        88
Regulatory Compatibility    91
Site Constraints            72
Approval Complexity         69
Environmental Risk          78
Fire / Safety               64
Data Confidence             87
```

Important:

The score must be explainable.

Clicking a score opens contributing factors.

---

# 9.9 Decision Summary

The top of the report should answer the developer's question immediately.

```text
RECOMMENDATION

PURSUE WITH CONDITIONS

Why:
• Proposed use appears compatible
• Development capacity appears promising
• No fatal constraint identified
• Coastal review requires confirmation
• Fire access requires further diligence
```

Then:

### Deal Killers

Issues that could make the project uneconomic or infeasible.

### Deal Risks

Important but potentially manageable issues.

### Opportunities

Rules/programs that may improve development potential.

### Unknowns

Information that the system could not verify.

---

# 9.10 Risk Register

Every risk should have:

- category
- severity
- probability
- impact
- evidence
- recommended action
- owner
- status

Example:

| Risk | Severity | Action |
|---|---|---|
| Coastal applicability | High | Confirm overlay |
| Fire access | Medium | Consult fire requirements |
| Parking | Medium | Test layouts |
| Environmental | Low | Verify dataset |

Statuses:

- Open
- Investigating
- Resolved
- Accepted

---

# 9.11 Evidence Explorer

This is a critical trust feature.

Every AI-generated conclusion should have an evidence chain.

```text
CONCLUSION
“Coastal review may apply.”

↓
SPATIAL EVIDENCE
Parcel intersects coastal-related boundary.

↓
REGULATORY SOURCE
Municipal regulation

↓
DOCUMENT
Section / page / paragraph

↓
EFFECTIVE DATE
YYYY-MM-DD

↓
CONFIDENCE
High
```

Users should be able to inspect the source material.

Evidence types:

- municipal code
- state statute
- planning document
- GIS layer
- parcel record
- official bulletin
- official dataset
- handbook
- user-provided document

---

# 9.12 AI Analyst

Do not make this a generic chat window.

It should be a **context-aware development analyst**.

Suggested questions:

- What can I build here?
- What is the biggest risk?
- Why is the feasibility score 72?
- What regulation caused this constraint?
- What would change if I built 8 instead of 12 units?
- Which approvals might be required?
- What should I ask the city?
- What should my architect investigate?
- Compare this site with Site B.

Responses must cite evidence.

---

# 9.13 Scenario Builder

This becomes a high-value feature.

Users can create:

### Scenario A

12 townhomes

### Scenario B

16 apartments

### Scenario C

8 townhomes + ADUs

Compare:

- development capacity
- constraints
- parking
- approval complexity
- estimated risk
- regulatory pathways

Example:

| Metric | Scenario A | Scenario B |
|---|---:|---:|
| Units | 12 | 16 |
| Feasibility | 82 | 67 |
| Risk | Medium | High |
| Approval Complexity | Medium | High |

---

# 9.14 Property Comparison

Side-by-side acquisition analysis.

```text
PROPERTY A
Score: 84
12 units
Medium risk

PROPERTY B
Score: 76
16 units
High risk

PROPERTY C
Score: 91
14 units
Low risk
```

Allow sorting by:

- feasibility
- risk
- estimated capacity
- jurisdiction
- project type
- status

---

# 9.15 Acquisition Pipeline

Treat properties like opportunities.

Stages:

```text
DISCOVERED
   ↓
SCREENING
   ↓
UNDER REVIEW
   ↓
DUE DILIGENCE
   ↓
OFFER
   ↓
UNDER CONTRACT
   ↓
CLOSED
   ↓
PASSED
```

Each property has:

- project concept
- feasibility score
- target price
- estimated development value
- risk
- next action
- owner
- notes
- documents
- activity

---

# 9.16 Monitoring Dashboard

This creates recurring SaaS value.

Show:

> **7 monitored properties**

> **2 material changes this week**

Categories:

- zoning changes
- municipal code changes
- housing legislation
- overlays
- hazard datasets
- planning changes
- development standards
- source updates

Example:

```text
PROPERTY 17

Material regulatory change detected.

Potential impact:
Development standards may have changed.

Old:
X

New:
Y

Recommended action:
Re-run feasibility analysis.
```

---

# 9.17 Regulatory Change Feed

Chronological feed.

Each change:

- jurisdiction
- effective date
- source
- affected topic
- affected geography
- impacted saved properties
- impact assessment

Filter:

- San Diego
- zoning
- housing
- fire
- coastal
- parking
- development standards

---

# 9.18 Reports

Generate a professional PDF-style report.

Report sections:

1. Executive Summary
2. Property
3. Proposed Development
4. Feasibility Score
5. Development Capacity
6. Zoning
7. Development Standards
8. Spatial Constraints
9. Regulatory Analysis
10. Entitlement / Approval Considerations
11. Risks
12. Opportunities
13. Unknowns
14. Recommended Next Steps
15. Evidence & Sources
16. Disclaimers

The report should be usable in:

- acquisition meetings
- investment committee meetings
- architect discussions
- consultant discussions
- internal underwriting

---

# 10. Flagship User Journey

A first-time developer should be able to go from zero to report in minutes.

```text
Landing Page
    ↓
Analyze Property
    ↓
Enter Address
    ↓
Parcel Identified
    ↓
Choose “Multifamily”
    ↓
Enter “20 units”
    ↓
Analyze
    ↓
SitePilot evaluates
    ↓
Feasibility Score
    ↓
Risks
    ↓
Evidence
    ↓
Recommendation
    ↓
Generate Report
    ↓
Save Property
    ↓
Monitor
```

---

# 11. Product Data Model

Core entities:

```text
Organization
User
Team
Property
Parcel
Jurisdiction
Project
Scenario
Analysis
Finding
Risk
Regulation
RegulatoryDocument
SpatialLayer
SpatialFeature
Evidence
Source
DataVersion
Report
MonitoringSubscription
ChangeEvent
Activity
BillingAccount
```

Relationships:

```text
Organization
 ├── Users
 ├── Projects
 ├── Properties
 └── Reports

Property
 ├── Parcel
 ├── Jurisdiction
 ├── Spatial Features
 ├── Projects
 └── Analyses

Project
 ├── Scenarios
 ├── Analyses
 ├── Risks
 └── Reports

Analysis
 ├── Findings
 ├── Evidence
 ├── Score
 ├── Recommendation
 └── Data Versions
```

---

# 12. Analysis Engine

The analysis engine should be deterministic where possible.

Do not ask an LLM to calculate everything.

Architecture:

```text
Property
   ↓
Parcel Resolution
   ↓
Jurisdiction Resolution
   ↓
Spatial Intersection Engine
   ↓
Regulatory Applicability Engine
   ↓
Rule Evaluation Engine
   ↓
Constraint Engine
   ↓
Scenario Engine
   ↓
Evidence Graph
   ↓
Scoring Engine
   ↓
LLM Explanation Layer
   ↓
Feasibility Result
```

## Principle

**Rules calculate.**

**AI explains, retrieves and synthesizes.**

This separation is essential for trust.

---

# 13. Spatial Analysis Engine

Input:

- point
- parcel polygon
- project geometry

Operations:

- intersects
- contains
- within
- distance
- buffer
- overlap
- proximity
- spatial join
- area calculation

Example:

```text
parcel
  ∩
coastal_zone
  =
coastal_applicability
```

Another:

```text
parcel
  ∩
fire_zone
  =
fire_constraint
```

The engine should preserve:

- dataset version
- source
- geometry version
- query timestamp

---

# 14. Regulatory Engine

The regulatory engine must determine:

> Which rules actually apply to this property and project?

Inputs:

- jurisdiction
- zone
- project type
- project size
- overlays
- geography
- effective date

Output:

```json
{
  "rule": "example_rule",
  "status": "potentially_applicable",
  "reason": "...",
  "source_id": "...",
  "effective_date": "...",
  "confidence": 0.91
}
```

---

# 15. RAG Architecture

The current code already contains California-code and handbook search functionality plus retrieved-code/chunk structures, and the search path uses embeddings and Milvus. fileciteturn2file0L15-L72 fileciteturn2file5L487-L520

Retain that foundation, but redesign it into a production evidence system.

## Pipeline

```text
Official Source
      ↓
Document Ingestion
      ↓
Normalization
      ↓
Chunking
      ↓
Metadata Extraction
      ↓
Embedding
      ↓
Vector Store
      ↓
Hybrid Retrieval
      ↓
Jurisdiction Filter
      ↓
Effective-Date Filter
      ↓
Reranking
      ↓
LLM Synthesis
      ↓
Evidence-Linked Answer
```

Metadata should include:

- jurisdiction
- document type
- source authority
- effective date
- publication date
- topic
- zone
- geography
- section
- URL
- version
- superseded status

---

# 16. Evidence Architecture

Create an explicit evidence graph.

```text
Finding
  ↓
Evidence
  ↓
Source
  ↓
Document
  ↓
Section
  ↓
Effective Version
```

Every material conclusion should have:

- source
- source authority
- retrieval timestamp
- document version
- exact section/page where available
- spatial evidence if relevant
- confidence
- applicability reasoning

This is potentially one of the strongest defensibility features.

---

# 17. Confidence System

Do not use one vague “AI confidence.”

Use multiple dimensions.

### Data confidence

How trustworthy/fresh is the source?

### Applicability confidence

How confidently does the rule apply to the property?

### Calculation confidence

How deterministic is the result?

### Interpretation confidence

How much expert interpretation is involved?

Overall:

```text
Confidence =
weighted(Data,
Applicability,
Calculation,
Interpretation)
```

Display:

- High
- Medium
- Low
- Unknown

---

# 18. Feasibility Scoring

The score should be configurable and explainable.

Possible model:

```text
Development Potential        25%
Regulatory Compatibility     20%
Site Constraints             20%
Approval Complexity          15%
Environmental / Hazard       10%
Data Confidence              10%
```

Do not present the score as an objective legal truth.

It is a decision-support index.

---

# 19. Recommendation Engine

Three primary outcomes:

## PURSUE

No material fatal issue identified.

## INVESTIGATE

Potentially viable but material uncertainties remain.

## PASS

Major constraint or economics/risk signal makes pursuit unattractive.

The recommendation must include reasons.

Never output:

> “This property is definitely buildable.”

Instead:

> “Preliminary analysis indicates the proposed concept may be feasible, subject to the following conditions.”

---

# 20. Data Architecture

Recommended production architecture:

```text
                  ┌───────────────────────┐
                  │ Official Data Sources │
                  └───────────┬───────────┘
                              ↓
                    ┌─────────────────┐
                    │ Ingestion Layer │
                    └────────┬────────┘
                             ↓
               ┌───────────────────────────┐
               │ Canonical Data Platform   │
               ├───────────────────────────┤
               │ Parcel DB                 │
               │ Regulatory DB             │
               │ Spatial DB                │
               │ Source Registry            │
               │ Version Registry            │
               └─────────────┬─────────────┘
                             ↓
                  ┌─────────────────────┐
                  │ Analysis Engine     │
                  └─────────┬───────────┘
                            ↓
               ┌─────────────────────────┐
               │ Evidence / AI Layer     │
               └────────────┬────────────┘
                            ↓
                 ┌────────────────────┐
                 │ Product APIs       │
                 └─────────┬──────────┘
                           ↓
                 ┌────────────────────┐
                 │ React Application  │
                 └────────────────────┘
```

---

# 21. Recommended Backend Architecture

Current project has a Python backend in `backend/app.py` with spatial analysis, parcel/geocoding, regulatory endpoints and the spatial agent. fileciteturn2file0L1-L84

Do not keep growing one monolithic `app.py`.

Refactor toward:

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── properties.py
│   │   ├── analyses.py
│   │   ├── scenarios.py
│   │   ├── reports.py
│   │   ├── monitoring.py
│   │   ├── regulations.py
│   │   └── auth.py
│   │
│   ├── domain/
│   │   ├── property.py
│   │   ├── project.py
│   │   ├── analysis.py
│   │   ├── risk.py
│   │   └── evidence.py
│   │
│   ├── services/
│   │   ├── parcel_service.py
│   │   ├── zoning_service.py
│   │   ├── spatial_service.py
│   │   ├── regulatory_service.py
│   │   ├── feasibility_service.py
│   │   ├── report_service.py
│   │   └── monitoring_service.py
│   │
│   ├── rules/
│   │   ├── zoning_rules.py
│   │   ├── density_rules.py
│   │   ├── parking_rules.py
│   │   └── jurisdiction_rules.py
│   │
│   ├── ai/
│   │   ├── retrieval.py
│   │   ├── reranking.py
│   │   ├── analyst.py
│   │   └── citations.py
│   │
│   ├── data/
│   │   ├── ingestion/
│   │   ├── connectors/
│   │   ├── normalization/
│   │   └── versioning/
│   │
│   └── workers/
│       ├── analysis_worker.py
│       ├── ingestion_worker.py
│       └── monitoring_worker.py
│
└── tests/
```

---

# 22. Database Architecture

For production, strongly consider a relational geospatial core.

Recommended:

**PostgreSQL + PostGIS**

Use it for:

- organizations
- users
- properties
- parcels
- projects
- analyses
- spatial features
- rules
- evidence
- versions

Use a vector database for semantic retrieval where appropriate.

The current project has MongoDB/Motor, MySQL and Milvus dependencies. fileciteturn2file1L164-L175

Do not preserve multiple databases merely because they exist today.

Choose storage based on domain responsibility.

---

# 23. Suggested Storage Responsibilities

### PostgreSQL/PostGIS

System of record.

### Object storage

Documents, PDFs, report artifacts.

### Vector database

Semantic document retrieval.

### Redis

Caching, queues, ephemeral state.

### Search engine

Optional later for full-text/global search.

---

# 24. API Design

Use versioned APIs.

```text
/api/v1/properties
/api/v1/parcels
/api/v1/analyses
/api/v1/scenarios
/api/v1/feasibility
/api/v1/regulations
/api/v1/evidence
/api/v1/reports
/api/v1/monitoring
/api/v1/organizations
```

Example:

```http
POST /api/v1/analyses
```

Request:

```json
{
  "property_id": "...",
  "project": {
    "type": "multifamily",
    "target_units": 20,
    "stories": 3
  }
}
```

Response:

```json
{
  "analysis_id": "...",
  "status": "processing"
}
```

Analysis should be asynchronous.

---

# 25. Async Analysis Architecture

Large analyses should not block HTTP requests.

```text
POST Analysis
      ↓
Create Analysis Job
      ↓
Queue
      ↓
Worker
 ├── Parcel
 ├── Spatial
 ├── Regulations
 ├── Rules
 ├── RAG
 ├── Evidence
 └── Scoring
      ↓
Persist Results
      ↓
WebSocket/SSE
      ↓
Frontend Updates
```

---

# 26. Frontend Architecture

The current frontend already contains OpenLayers/GeoJSON/layer/marker/map components and map/chat structures. fileciteturn2file2L234-L266 fileciteturn2file4L386-L417

Refactor toward domain-driven components:

```text
frontend/src/
├── app/
├── routes/
├── components/
│   ├── ui/
│   ├── map/
│   ├── property/
│   ├── analysis/
│   ├── feasibility/
│   ├── evidence/
│   ├── reports/
│   └── monitoring/
│
├── features/
│   ├── properties/
│   ├── analyses/
│   ├── scenarios/
│   ├── pipeline/
│   ├── regulations/
│   └── monitoring/
│
├── services/
│   ├── api/
│   └── maps/
│
├── state/
└── types/
```

---

# 27. Map Architecture

The map should support:

- parcel selection
- drawing
- layer toggles
- feature inspection
- spatial highlighting
- evidence overlays
- scenario footprints
- risk heatmaps
- comparison mode

Existing layer configuration and GeoJSON-loading infrastructure can be retained as the base. fileciteturn2file6L621-L650

But the map UX should be redesigned around analysis rather than layer exploration.

---

# 28. Design System

Visual direction:

**Professional real-estate intelligence platform.**

Avoid:

- excessive gradients
- gimmicky AI animations
- overly futuristic dashboards
- cluttered GIS interfaces

Use:

- strong typography
- neutral backgrounds
- restrained accent color
- high information density
- clear hierarchy
- cards only where useful
- maps as analytical surfaces
- status colors used semantically

Key status language:

- Pursue
- Investigate
- Pass
- High Risk
- Medium Risk
- Low Risk
- Verified
- Needs Review
- Unknown

---

# 29. AI System Design

AI responsibilities:

### Retrieval

Find relevant regulations.

### Classification

Classify project/property context.

### Synthesis

Combine retrieved evidence.

### Explanation

Explain findings in developer language.

### Question generation

Identify missing information.

### Report generation

Convert structured analysis into readable reports.

AI should NOT independently invent:

- zoning
- parcel facts
- numerical development standards
- legal requirements
- approval guarantees

---

# 30. AI Agent Tools

Possible tools:

```text
get_property()
get_parcel()
get_jurisdiction()
get_zoning()
get_spatial_constraints()
search_regulations()
search_handbooks()
get_source_document()
get_rule()
calculate_density()
calculate_parking()
calculate_area()
compare_scenarios()
get_evidence()
```

Agent flow:

```text
User Question
    ↓
Intent Classification
    ↓
Determine Required Tools
    ↓
Run Deterministic Spatial Tools
    ↓
Retrieve Regulations
    ↓
Build Evidence Set
    ↓
Synthesize
    ↓
Validate Claims
    ↓
Answer
```

---

# 31. Claim Validation Layer

Before an AI answer reaches the user:

1. Extract factual claims.
2. Match each claim to evidence.
3. Reject unsupported material claims.
4. Attach citations.
5. Assign confidence.
6. Flag unresolved claims.

Example:

```text
Claim:
Maximum height is 30 feet.

Evidence:
Rule XYZ, Section 123.

Status:
SUPPORTED

Confidence:
HIGH
```

If unsupported:

```text
Status:
UNVERIFIED

Do not present as fact.
```

---

# 32. Data Freshness

Every dataset must have:

- last checked
- effective date
- source
- version
- status

Statuses:

- Current
- Stale
- Superseded
- Unknown

For regulations, versioning is mandatory.

A developer must be able to understand:

> “Which version of the rule produced this analysis?”

---

# 33. Source Registry

Create an internal source registry.

```text
Source
├── source_id
├── authority
├── jurisdiction
├── source_type
├── url
├── update_frequency
├── last_checked
├── last_success
├── parser
├── reliability
└── status
```

This becomes a core data-operations system.

---

# 34. Data Ingestion

Ingestion jobs:

```text
Fetch
 ↓
Validate
 ↓
Detect Change
 ↓
Normalize
 ↓
Version
 ↓
Index
 ↓
Run Impact Analysis
```

If a regulation changes:

```text
Regulation Change
 ↓
Identify affected geography/rules
 ↓
Find saved properties
 ↓
Calculate potential impact
 ↓
Create ChangeEvent
 ↓
Notify affected users
```

---

# 35. Monitoring Engine

For each saved property:

```text
Property
 ↓
Relevant Rules
 ↓
Relevant Spatial Layers
 ↓
Relevant Jurisdiction
 ↓
Relevant Documents
```

When any dependency changes:

```text
Change
 ↓
Impact Detection
 ↓
Impact Classification
 ↓
Notification
```

Notifications:

- email
- in-app
- optional webhook later

---

# 36. Report Generation

Report should be deterministic from structured analysis data.

Do not ask an LLM to invent the report from scratch.

Pipeline:

```text
Analysis JSON
 ↓
Report Template
 ↓
Evidence References
 ↓
LLM Narrative
 ↓
Validation
 ↓
PDF
```

Every report should contain:

> **Preliminary / informational only. Professional verification required.**

---

# 37. Authentication & Authorization

Roles:

```text
Owner
Admin
Analyst
Viewer
```

Organization-level permissions.

Users should only access organization-owned data.

Implement:

- session/JWT authentication
- MFA for professional tiers later
- RBAC
- audit logs
- organization isolation

---

# 38. Security

Minimum production requirements:

- HTTPS
- encrypted secrets
- encrypted data at rest
- secure authentication
- RBAC
- tenant isolation
- audit logs
- rate limiting
- input validation
- API authorization
- dependency scanning
- backups
- disaster recovery

Never expose:

- API keys
- internal prompts
- private source credentials
- database credentials

---

# 39. Legal / Product Safety

The product must clearly state:

> SitePilot provides preliminary informational analysis and does not constitute legal, architectural, engineering, planning, surveying, environmental or other professional advice.

The system should encourage professional verification for high-impact decisions.

Avoid absolute statements.

Bad:

> “You can build 20 units.”

Good:

> “The available data indicates that a 20-unit concept may be feasible, subject to verification of the conditions listed below.”

---

# 40. Billing

Initial product model:

### Free

- basic property lookup
- limited analyses
- sample reports

### Pro

Approximately $99–199/property or similar usage-based pricing to test willingness to pay.

### Developer

Approximately $499–999/month hypothesis.

Features:

- analysis credits
- saved properties
- comparison
- reports
- monitoring

### Team

$2K+/month hypothesis.

Features:

- multiple users
- portfolio
- collaboration
- API
- advanced monitoring
- exports
- admin

Pricing must be validated with actual customers.

---

# 41. MVP Definition

The MVP is NOT the whole platform.

MVP must do one thing exceptionally well:

> **Analyze a San Diego property for one development scenario and produce a trustworthy preliminary feasibility report.**

MVP inputs:

- address
- project type
- target units/size

MVP outputs:

- parcel
- zoning
- key development standards
- major spatial constraints
- regulatory findings
- risks
- recommendation
- evidence
- report

---

# 42. MVP Screens

Only build these initially:

1. Landing
2. Sign Up / Login
3. Dashboard
4. New Analysis
5. Property + Map
6. Project Intent
7. Analysis Progress
8. Feasibility Dashboard
9. Evidence Explorer
10. Risk Register
11. AI Analyst
12. Report Viewer
13. Saved Properties

Everything else can wait.

---

# 43. MVP Feature Priority

## P0 — Must Have

- San Diego property lookup
- parcel resolution
- zoning identification
- core spatial constraints
- regulatory retrieval
- evidence
- feasibility score
- recommendation
- report
- save analysis

## P1

- scenarios
- comparison
- acquisition pipeline
- monitoring
- team collaboration

## P2

- underwriting
- broker tools
- API
- integrations
- advanced economics
- automated site discovery

---

# 44. Acquisition Intelligence — V2

After feasibility is trusted:

User uploads a list of properties.

SitePilot processes them.

Output:

```text
100 PROPERTIES
      ↓
SCREEN
      ↓
25 PROMISING
      ↓
10 ANALYZE
      ↓
5 HIGH-POTENTIAL
      ↓
3 ACQUISITION TARGETS
```

This is the transition from:

**feasibility tool**

to:

**acquisition intelligence platform.**

---

# 45. Site Discovery — V3

User defines:

> Find properties in San Diego where I can potentially develop 15–30 units with low entitlement complexity.

Filters:

- geography
- parcel size
- zoning
- development type
- unit capacity
- risk
- proximity to transit
- price
- ownership
- other available data

System produces ranked opportunities.

---

# 46. Development Economics — V4

Eventually add:

- purchase price
- estimated construction cost
- soft costs
- entitlement costs
- financing assumptions
- expected rents/sales
- development timeline
- contingency
- estimated ROI
- residual land value

Output:

> **Regulatory Feasibility + Development Economics**

This is significantly more valuable than zoning alone.

---

# 47. Acquisition Decision Engine — V5

Ultimate workflow:

```text
PROPERTY
 ↓
WHAT CAN I BUILD?
 ↓
HOW HARD IS IT?
 ↓
HOW LONG MIGHT IT TAKE?
 ↓
WHAT WILL IT COST?
 ↓
WHAT COULD GO WRONG?
 ↓
WHAT IS THE POTENTIAL VALUE?
 ↓
SHOULD I BUY IT?
```

This is the long-term product vision.

---

# 48. Technical Roadmap

## Phase 0 — Validation

Duration: 2–4 weeks.

Do not optimize architecture yet.

Goals:

- interview 10–20 developers
- obtain real properties
- manually validate outputs
- determine willingness to pay
- identify most valuable report fields

Success condition:

At least several users say:

> “I would use this on my next deal.”

Better:

> “Can I run another property?”

Best:

> “How much does it cost?”

---

# 49. Phase 1 — MVP

Duration: 6–10 weeks.

Build:

- authentication
- organization
- property creation
- parcel lookup
- map
- zoning
- core spatial checks
- regulatory retrieval
- evidence
- feasibility engine
- report
- saved analyses

Focus entirely on San Diego.

---

# 50. Phase 2 — Paid Pilot

Target:

10–30 developers.

Measure:

- analyses/user
- repeat usage
- report downloads
- time saved
- recommendation usefulness
- correction rate
- unsupported claim rate
- conversion to paid
- retention

---

# 51. Phase 3 — Acquisition Workflow

Build:

- pipeline
- comparison
- scenario analysis
- bulk property screening
- portfolio
- monitoring

---

# 52. Phase 4 — California Expansion

Expand jurisdiction-by-jurisdiction.

Suggested approach:

```text
San Diego City
 ↓
San Diego County
 ↓
Orange County
 ↓
Los Angeles
 ↓
Bay Area
 ↓
California
```

Do not claim statewide coverage until data quality supports it.

---

# 53. Quality Assurance

This product needs stronger testing than a typical SaaS.

Create a gold-standard property test set.

For each property:

- expected zoning
- expected overlays
- expected constraints
- expected regulatory sources
- expected outcome
- expert-reviewed answer

Run regression tests whenever:

- data changes
- rules change
- prompts change
- models change
- code changes

---

# 54. AI Evaluation

Metrics:

### Retrieval recall

Did we retrieve the right source?

### Citation accuracy

Does citation actually support claim?

### Applicability accuracy

Does the rule actually apply?

### Hallucination rate

How many material unsupported claims?

### Recommendation consistency

Does the same input produce materially consistent output?

### Expert agreement

How often do experts agree with the analysis?

---

# 55. Critical Product Metrics

## North-star metric

> **Qualified acquisition decisions accelerated**

Potential proxy:

> Number of property evaluations resulting in a confident Pursue / Investigate / Pass decision.

Other metrics:

- Time to first analysis
- Analysis completion rate
- Repeat analyses
- Properties saved
- Reports generated
- Reports shared
- Monitoring subscriptions
- Paid conversion
- Monthly retained developers

---

# 56. The Most Important KPI

Do not optimize for:

> Number of AI messages.

Do not optimize for:

> Map interactions.

Do not optimize for:

> Time spent in app.

Optimize for:

> **Developers using SitePilot to make real acquisition decisions.**

---

# 57. Product Moat

The moat should NOT be:

> LLM access.

The moat should be:

## 1. Jurisdiction-specific data

Deep, maintained knowledge.

## 2. Evidence graph

Traceable regulatory reasoning.

## 3. Historical versions

Understand what changed and when.

## 4. Property intelligence

Historical analyses and findings.

## 5. Developer workflow

Pipeline, scenarios, reports and monitoring.

## 6. Feedback loop

Human corrections improve rules and retrieval.

---

# 58. Feedback Loop

```text
Analysis
 ↓
Developer reviews
 ↓
Developer corrects
 ↓
Correction stored
 ↓
Rule/data quality improves
 ↓
Future analyses improve
```

Create explicit:

> **“Report an issue”**

on every finding.

Possible reasons:

- wrong data
- wrong regulation
- outdated source
- wrong applicability
- missing information
- calculation issue

---

# 59. Human-in-the-Loop

For high-risk findings:

```text
AI detects issue
 ↓
Confidence below threshold
 ↓
Needs Review
 ↓
Human/domain reviewer
 ↓
Verified finding
```

Later this could become a paid expert-review network.

---

# 60. Admin / Internal Operations Console

This is essential.

Admins need:

### Data Sources

- health
- last sync
- failures
- version

### Regulations

- new
- changed
- superseded
- review required

### AI

- retrieval quality
- failed answers
- unsupported claims
- user corrections

### Analyses

- processing failures
- latency
- errors

### Customers

- organizations
- usage
- subscription
- support

---

# 61. Current Project → SitePilot Migration

The current project already has valuable foundations:

- backend spatial API
- address/point/polygon request structures
- parcel/geocoding functionality
- hazard and zone analysis
- regulatory search
- handbook search
- spatial agent
- Milvus/embedding infrastructure
- OpenLayers/GeoJSON/layer/map components
- deployment components

Relevant architecture is visible in the existing project map. fileciteturn2file0L1-L84 fileciteturn2file5L487-L532

The frontend mapping architecture already groups GeoJSON, layers, markers, OpenLayers and related map UI. fileciteturn2file2L234-L266

Therefore:

> **Refactor, do not restart.**

---

# 62. Refactoring Strategy

Current:

```text
backend/app.py
```

Move toward domain services.

Current:

```text
frontend map components
```

Move toward:

```text
map infrastructure
+
property features
+
analysis features
```

Do not delete working spatial capabilities until replacement tests pass.

---

# 63. Deployment Architecture

Current project already references Docker, Docker Compose, Jenkins and Nginx in its deployment stack. fileciteturn2file1L130-L161

Production target:

```text
                    Internet
                       ↓
                    CDN/WAF
                       ↓
                    Nginx
                       ↓
             ┌─────────┴─────────┐
             │                   │
        React Frontend       API Gateway
                                 ↓
                        Application Services
                         ├── Analysis
                         ├── Property
                         ├── Regulatory
                         ├── Report
                         └── Monitoring
                                 ↓
                  ┌──────────────┼──────────────┐
                  ↓              ↓              ↓
              Postgres        Redis         Vector DB
              PostGIS                       / Search
                  ↓
             Object Storage
```

Workers:

```text
Queue
 ├── Analysis Worker
 ├── Ingestion Worker
 ├── Report Worker
 └── Monitoring Worker
```

---

# 64. Observability

Track:

- API latency
- analysis duration
- queue time
- ingestion failures
- retrieval latency
- model latency
- model cost
- error rate
- database performance
- source freshness
- failed analyses

Every analysis gets a trace ID.

---

# 65. Cost Controls

AI costs can become dangerous.

Use AI only where necessary.

Prefer:

- deterministic rules
- cached results
- structured retrieval
- small models for classification
- larger models for complex synthesis
- asynchronous processing
- result reuse

Cache:

- property facts
- parcel data
- zoning
- source documents
- embeddings
- repeated regulatory queries

---

# 66. Performance Targets

Initial targets:

### Property lookup

< 2 seconds where cached

### Analysis

< 2–5 minutes depending on depth

### UI

Fast interactive map.

### Report

Generated asynchronously.

The user should always see progress rather than a frozen screen.

---

# 67. Error Handling

Every analysis should distinguish:

### Verified

Data successfully obtained.

### Unavailable

Source unavailable.

### Unknown

No reliable information.

### Conflicting

Sources disagree.

### Needs Review

Human verification recommended.

Never convert missing data into an assumption silently.

---

# 68. Conflicting Regulation Handling

If two sources conflict:

```text
CONFLICT DETECTED

Source A:
Rule X

Source B:
Rule Y

Potential reason:
Different effective dates / jurisdictions / amendments.

Recommended action:
Professional verification required.
```

This is much safer than choosing one silently.

---

# 69. Auditability

Every analysis should store:

```text
analysis_id
created_at
user_id
property_id
scenario_id
data_versions
rule_versions
retrieved_documents
model_version
prompt_version
calculation_version
result
confidence
```

This allows:

> “Why did SitePilot give this answer six months ago?”

to be answered.

---

# 70. Versioning

Version:

- datasets
- rules
- regulatory documents
- scoring formulas
- analysis engine
- AI prompts
- models

Analysis results should be reproducible as far as practical.

---

# 71. API Security

Implement:

- authentication
- authorization
- tenant checks
- request validation
- rate limits
- API keys for integrations
- audit logging

For APIs:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Internal Error
```

Do not leak internal exception details.

---

# 72. Accessibility

Target WCAG-conscious UI.

Support:

- keyboard navigation
- visible focus
- semantic controls
- readable contrast
- screen-reader labels
- map alternatives
- text equivalents for findings

Important:

Do not make critical information available only through map visualization.

---

# 73. Mobile Strategy

Do not make the entire professional workflow mobile-first.

Desktop is primary.

Mobile should support:

- dashboard
- property lookup
- alerts
- report viewing
- quick analysis
- monitoring notifications

Complex GIS/scenario analysis can remain desktop-oriented.

---

# 74. Notifications

Events:

- analysis complete
- analysis failed
- regulatory change
- monitored property changed
- report ready
- team assignment
- finding requires review

Channels:

- in-app
- email
- later Slack/webhook

---

# 75. Collaboration

For teams:

- comments
- mentions
- assignments
- status
- internal notes
- report sharing
- activity timeline

Example:

> “@Alex verify coastal applicability.”

---

# 76. Documents

Allow users to attach:

- broker packages
- planning documents
- surveys
- preliminary plans
- consultant reports
- PDFs

AI can use them as supplemental evidence.

Clearly distinguish:

**Official evidence**

from

**User-provided evidence.**

---

# 77. Property Timeline

Each property gets a timeline:

```text
Jan 2026
Property added

Feb 2026
20-unit scenario analyzed

Mar 2026
Regulation changed

Mar 2026
Analysis rerun

Apr 2026
Developer marked “Due Diligence”
```

This becomes a valuable institutional memory system.

---

# 78. Search

Global search should support:

- address
- APN
- property name
- project
- regulation
- report
- organization member

Command palette:

```text
⌘K / Ctrl+K
```

Commands:

- New Analysis
- Search Property
- Compare Properties
- Open Reports
- Open Monitoring
- Search Regulations

---

# 79. User Experience Principles

## Principle 1

**Decision first.**

Show the recommendation early.

## Principle 2

**Evidence always available.**

Every important claim should be inspectable.

## Principle 3

**Unknown is acceptable.**

Do not hallucinate.

## Principle 4

**Map supports reasoning.**

Do not overwhelm users with layers.

## Principle 5

**Professional workflow over AI novelty.**

## Principle 6

**Progressive disclosure.**

Simple summary first; detailed analysis second.

---

# 80. Example Full Analysis

User:

> “Analyze 123 Main Street for a 12-unit townhome development.”

System:

### Property

Parcel identified.

### Jurisdiction

San Diego.

### Zoning

Applicable base zone identified.

### Spatial checks

- Fire: medium
- Coastal: potential
- Airport: none detected
- Flood: low
- Environmental: needs review

### Regulatory analysis

Potential development standards identified.

### Scenario

12 units.

### Feasibility

**78/100**

### Recommendation

**PURSUE WITH CONDITIONS**

### Critical actions

1. Verify coastal applicability.
2. Confirm fire access.
3. Validate density calculation.
4. Confirm parking.
5. Obtain professional planning review.

### Evidence

All material findings linked to sources.

---

# 81. What Makes This a Startup Instead of a Project

A project:

> User analyzes a property.

A startup:

> Developers repeatedly use SitePilot to evaluate acquisitions, save opportunities, compare scenarios, generate reports and monitor changes.

The recurring loop is:

```text
New property
 ↓
Analysis
 ↓
Decision
 ↓
Save
 ↓
Compare
 ↓
Acquire
 ↓
Monitor
 ↓
New property
```

That loop is the business.

---

# 82. Startup Flywheel

```text
More properties
      ↓
More analyses
      ↓
More developer feedback
      ↓
Better rules
      ↓
Better evidence
      ↓
Higher trust
      ↓
More customers
      ↓
More properties
```

Potential moat grows with:

- jurisdiction coverage
- rule coverage
- evidence graph
- historical data
- customer feedback
- workflow integration

---

# 83. Expansion Strategy

Do not expand geographically because it sounds impressive.

Expand when:

1. San Diego retention is strong.
2. Data pipelines are stable.
3. Regulatory versioning works.
4. Accuracy is measurable.
5. Customers request another jurisdiction.

Then add jurisdictions as repeatable modules.

```text
Jurisdiction Module
├── Boundary
├── Zoning
├── Development Standards
├── Regulatory Sources
├── Spatial Layers
├── Rule Set
├── Data Connectors
└── Validation Set
```

---

# 84. Jurisdiction Engine

Each jurisdiction should implement:

```python
class JurisdictionEngine:
    def resolve_zoning(...)
    def get_development_standards(...)
    def get_applicable_overlays(...)
    def evaluate_project(...)
    def get_regulatory_sources(...)
    def calculate_approval_complexity(...)
```

This allows:

```text
San DiegoEngine
CountyEngine
LosAngelesEngine
OrangeCountyEngine
```

without rewriting the platform.

---

# 85. Rule Engine

Rules should be data-driven where possible.

Example:

```json
{
  "jurisdiction": "san_diego",
  "topic": "density",
  "zone": "example",
  "condition": {
    "project_type": "multifamily"
  },
  "rule": {
    "metric": "units_per_acre",
    "value":  ...
  },
  "source": "...",
  "effective_date": "...",
  "version": "..."
}
```

Do not bury every rule inside Python conditionals.

---

# 86. Testing Strategy

### Unit tests

- geometry
- calculations
- rules
- scoring
- parsing

### Integration tests

- source ingestion
- spatial queries
- RAG
- analysis pipeline

### End-to-end tests

- address → report

### Regression tests

- gold-standard properties

### AI evaluations

- claim support
- retrieval
- citation
- reasoning consistency

---

# 87. Example Test Case

```text
Property:
Known San Diego parcel

Scenario:
12 townhomes

Expected:
Zoning = X
Coastal = true
Fire = medium
Recommendation != unconditional “buildable”

Required:
Evidence attached to every material conclusion.
```

---

# 88. Support / Customer Success

Provide:

- help center
- source explanations
- “How SitePilot works”
- report glossary
- data freshness information
- support ticketing
- issue reporting

Professional users need confidence more than novelty.

---

# 89. Commercial Strategy

First sales motion:

**Founder-led sales.**

Do not rely on paid ads initially.

Approach:

1. Identify San Diego developers.
2. Ask for a property they are considering.
3. Analyze it.
4. Compare your result with their existing diligence.
5. Identify missing/incorrect information.
6. Improve.
7. Ask for another property.
8. Ask for payment.

---

# 90. First Customer Interview Questions

Ask:

1. How do you currently evaluate a property?
2. What information do you gather first?
3. Which part takes the longest?
4. Who performs the research?
5. What does a consultant cost?
6. What makes you kill a deal?
7. How often do you evaluate properties?
8. What mistakes have cost you money?
9. Would faster feasibility change your acquisition strategy?
10. What would you trust software to determine?
11. What must always be verified by a professional?
12. Would you pay per property or monthly?

---

# 91. Sales Demonstration

Never demo:

> “Look at this cool map.”

Demo:

> “Give me a property you're considering.”

Then:

```text
Property
 ↓
12-unit scenario
 ↓
Analysis
 ↓
Pursue
 ↓
Risk
 ↓
Evidence
 ↓
Report
```

The customer should think:

> “I need this for my next property.”

---

# 92. Initial Sales Pitch

> **Before you spend weeks researching a property—or millions acquiring it—SitePilot gives you a preliminary, evidence-backed view of what you may be able to build, what could block the project, and what you need to verify next.**

---

# 93. Competitive Differentiation

Do not compete on:

- number of map layers
- number of AI features
- generic property data

Compete on:

### Decision quality

> Can the developer make a better acquisition decision?

### Evidence

> Can they see why?

### Speed

> Can they get the first answer in minutes?

### Workflow

> Can they manage the opportunity afterward?

### Monitoring

> Does the product remain useful after the first analysis?

---

# 94. Product North Star

The product should eventually answer:

> **“Given this property, this development concept, the current regulations, the current site conditions and the available evidence, what should I do next?”**

That is the core intelligence layer.

---

# 95. Long-Term Vision

SitePilot can evolve into:

## Development Intelligence OS

```text
PROPERTY DISCOVERY
        ↓
SITE SCREENING
        ↓
FEASIBILITY
        ↓
ACQUISITION
        ↓
DUE DILIGENCE
        ↓
ENTITLEMENT
        ↓
DESIGN
        ↓
PERMITTING
        ↓
CONSTRUCTION
        ↓
PORTFOLIO MONITORING
```

Do not build all of this initially.

Own the first decision:

> **Should I pursue this property?**

Then expand outward.

---

# 96. Non-Goals for V1

Do NOT build:

- nationwide coverage
- full CAD platform
- construction management
- property management
- mortgage marketplace
- brokerage marketplace
- legal practice
- automated permit submission
- full underwriting
- generic AI assistant
- dozens of user personas

These can distract from the wedge.

---

# 97. Definition of Done — MVP

MVP is complete when:

- A developer can create an account.
- They can enter a San Diego property.
- Parcel is resolved.
- Project intent can be defined.
- Core spatial constraints are evaluated.
- Applicable regulatory information is retrieved.
- Findings have evidence.
- A feasibility score is produced.
- Recommendation is produced.
- Risks are visible.
- User can ask questions.
- User can inspect evidence.
- User can generate a report.
- User can save the property.
- Analysis is reproducible/auditable.

---

# 98. Definition of Product-Market Fit Signal

Strong signal:

> Developers repeatedly bring their own properties.

Very strong signal:

> Developers use the product before making acquisition decisions.

Exceptional signal:

> Developers become upset when the product is unavailable.

Commercial signal:

> Developers pay without requiring extensive custom service.

Retention signal:

> Developers continue monitoring properties after the initial analysis.

---

# 99. Founder Rule

Whenever a feature is proposed, ask:

> **Does this help a developer make a better acquisition/development decision?**

If no:

**Do not build it yet.**

---

# 100. Final Product Blueprint

The final system should feel like this:

```text
                       SITEPILOT
          DEVELOPMENT ACQUISITION INTELLIGENCE
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       PROPERTY        PROJECT        MARKET
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  SITE INTELLIGENCE
                         ↓
          ┌──────────────┼──────────────┐
          │              │              │
       SPATIAL        ZONING       REGULATORY
       ANALYSIS       ANALYSIS      ANALYSIS
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  RULE ENGINE
                         ↓
                FEASIBILITY ENGINE
                         ↓
             ┌───────────┼───────────┐
             │           │           │
          CAPACITY      RISKS      APPROVALS
             │           │           │
             └───────────┼───────────┘
                         ↓
                  EVIDENCE GRAPH
                         ↓
                    AI ANALYST
                         ↓
              ┌──────────┼──────────┐
              │          │          │
          REPORT      DECISION    SCENARIOS
              │          │          │
              └──────────┼──────────┘
                         ↓
                 ACQUISITION PIPELINE
                         ↓
                     MONITORING
                         ↓
                 REGULATORY CHANGES
                         ↓
                  CONTINUOUS VALUE
```

---

# 101. The One Sentence That Should Guide the Entire Build

> **SitePilot is not a map with AI on top; it is a decision engine that uses maps, regulations, data and AI to help developers decide which properties are worth pursuing.**

That distinction should drive the architecture, UX, data model, AI design, pricing and roadmap.

---

# 102. Immediate Build Order

If development starts tomorrow, implement in this order:

```text
1. Product shell / authentication
2. Property creation
3. Address + parcel resolution
4. San Diego jurisdiction resolution
5. Map + parcel visualization
6. Zoning data
7. Core spatial constraint engine
8. Regulatory source ingestion
9. Hybrid regulatory retrieval
10. Evidence model
11. Deterministic feasibility rules
12. Feasibility score
13. Recommendation engine
14. Feasibility dashboard
15. Risk register
16. Evidence explorer
17. Contextual AI analyst
18. Report generation
19. Saved properties
20. Founder-led pilot
```

Only after this works:

```text
21. Scenario comparison
22. Acquisition pipeline
23. Bulk screening
24. Monitoring
25. Regulatory change detection
26. Team collaboration
27. California expansion
28. Development economics
29. Property discovery
30. API/integrations
```

---

# 103. Final Strategic Decision

### Build this.

But build it as:

> **San Diego-first Development Acquisition Intelligence**

not:

> “AI GIS SaaS.”

The strongest version of the company is a trusted intelligence layer that sits between **property discovery and capital deployment**.

The product's ultimate question is:

> **“Is this property worth pursuing, what could I build, what could stop me, and what should I do next?”**

If SitePilot can answer that question quickly, accurately, transparently and repeatedly, it has the potential to become a serious vertical SaaS business.

---

## Appendix A — Existing Project Alignment

The existing codebase is not a blank foundation. It already contains backend spatial/regulatory capabilities and a frontend mapping architecture.

Existing backend capabilities include:

- parcel/geocoding
- spatial request models
- hazard/zone analysis
- regulatory search
- handbook search
- RAG response/retrieval structures
- spatial agent
- embedding/vector infrastructure

Existing frontend capabilities include:

- OpenLayers map
- GeoJSON loading
- layer configuration
- markers
- map view
- map/chat structures

The existing project also contains deployment infrastructure around Docker/Compose/Jenkins/Nginx.

These capabilities should be treated as **raw platform primitives** and refactored into the SitePilot domain model rather than exposed directly as the product.

---

# Appendix B — Product Language

Prefer:

- Property
- Project
- Scenario
- Feasibility
- Finding
- Risk
- Evidence
- Source
- Recommendation
- Development Capacity
- Approval Path
- Monitoring
- Acquisition

Avoid overusing:

- AI magic
- AI score
- smart map
- automated legal advice
- guaranteed buildability
- instant entitlement

---

# Appendix C — Trust Language

Preferred:

> Preliminary analysis

> Based on available data

> Potentially applicable

> Requires verification

> Evidence indicates

> No material constraint identified in the available datasets

Avoid:

> Guaranteed

> Definitely permitted

> Legally approved

> You can build X

> No risk

---

# Appendix D — Product Hierarchy

```text
SITEPILOT
│
├── Dashboard
│
├── Properties
│   ├── Property Overview
│   ├── Site Intelligence
│   ├── Feasibility
│   ├── Risks
│   ├── Evidence
│   ├── Scenarios
│   └── Monitoring
│
├── Opportunities
│   ├── Pipeline
│   ├── Comparison
│   └── Screening
│
├── Analyses
│   ├── Active
│   ├── Completed
│   └── History
│
├── Map
│
├── Regulations
│
├── Reports
│
├── Monitoring
│
├── Team
│
└── Settings
```

---

# Appendix E — The Ultimate Product

The long-term product is not:

> “Tell me the zoning.”

It is:

> **“Given a property and a development goal, synthesize the current spatial and regulatory reality into an evidence-backed decision about whether the opportunity is worth pursuing.”**

That is the company.
