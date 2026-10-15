# Collated User Prompts & Project History

This document collates all prompts provided during the development of the **Singapore LTA Bus Arrival & Real-Time Tracking Application**.

---

## Prompt 1: Initial Application Build (Frontend)

> **Prompt:**
> 
> "build a singapore based bus arrival time application that tracks real time bus locations and provides accurate wait time predictions for all LTA bus stops.
> 
> build just the front end for now, I will include the backend connection later."

### Summary of What Was Built:
- **Singapore LTA Data Schema**: Comprehensive support for LTA DataMall v2/v3 structures (5-digit bus stop codes, service numbers, `Load` crowd levels: Seats Available / Standing / Limited Standing, bus `Type`: Single Deck, Double Deck, Bendy, and wheelchair accessibility `WAB`).
- **Interactive Singapore Transit Map**: Leaflet map plotting Singapore stops (Orchard, Bugis, CBD, Chinatown, HarbourFront, Jurong East, Woodlands, Tampines, Bedok, etc.), user geolocation, and live moving bus GPS markers with bearing and speed.
- **Real-Time Prediction Engine**: Countdown timers down to seconds with auto-refresh and vehicle interpolation.
- **Search & Filter**: Search by 5-digit code, road name, MRT station, or bus service number, with bookmarking/favorites.

---

## Prompt 2: GitHub Repository Push

> **Prompt:**
> 
> "push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/SentosaSDC/lta-bus-arrival.git"

### Summary of Action Taken:
- Initialized local git repository on branch `main`.
- Committed all project files and source code.
- Sanitized credentials and pushed to `https://github.com/SentosaSDC/lta-bus-arrival.git`.

---

## Prompt 3: Bug Fix (Leaflet LatLng NaN)

> **Prompt:**
> 
> "Fix the errors in the app  
> [AIS_METADATA_SECTION_START]  
> fix_it_trigger: manual  
> error 0: Error: Invalid LatLng object: (NaN, NaN)  
>     at new LatLng  
>     at Object.unproject  
>     at Object.pointToLatLng  
>     at NewClass.unproject  
>     at NewClass.frame  
>     at NewClass.flyTo  
>     at src/components/BusMap.tsx:231:8  
> [AIS_METADATA_SECTION_END]"

### Summary of Fix Applied:
- Added a `ResizeObserver` on the Leaflet container to invalidate size on tab switch.
- Added container visibility guards before triggering `map.flyTo` so zero-dimension containers don't produce `NaN` projections.
- Added strict `Number.isFinite` guards across bus positions, stop coordinates, and live vehicle interpolations.
- Pushed fix commit to GitHub.

---

## Prompt 4: Serverless LTA DataMall Endpoints

> **Prompt:**
> 
> "Add a severless connection that pulls live data from LTA Datamall using the following endpoints:
> 
> - Store this in /api folder (project root level) not the src folder
> - include /health.ts and /busarrival.ts within that subfolder
> - do not hardcode any key, I will include them later.
> 
> GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
> # AccountKey: <LTA_ACCOUNT_KEY>
> # accept: application/json"

### Summary of Implementation:
- **`/api/health.ts`**: Serverless health check returning service status and whether `LTA_ACCOUNT_KEY` is present.
- **`/api/busarrival.ts`**: Serverless proxy querying `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=...` using `process.env.LTA_ACCOUNT_KEY`, default `BusStopCode=83139`, with no hardcoded keys.
- **`/.env.example`**: Added `LTA_ACCOUNT_KEY="YOUR_LTA_ACCOUNT_KEY"`.
- **`server.ts`**: Express integration on port 3000 mounting `/api/*` endpoints and Vite dev middleware.
- Pushed changes to GitHub repository.

---

## Prompt 5: Collate Prompts

> **Prompt:**
> 
> "collate the prompt thus far and store it prompt.md"
