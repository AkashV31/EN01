
CanopyROI 

What is CanopyROI

CanopyROI is an AI-powered geospatial decision platform that tells governments, corporations, and NGOs exactly where to plant trees in Indian cities for maximum environmental and financial return. It does not just suggest planting trees — it calculates which specific urban zones will deliver the highest carbon sequestration, heat reduction, and biodiversity impact per rupee spent, and generates a verifiable ESG receipt that organisations can present to investors, regulators, and stakeholders.

The platform currently targets Pune, Maharashtra, with the architecture designed to scale to any Indian city within minutes.



 The Problem We Are Solving

Indian cities are getting hotter every year. Pune's average surface temperature has risen nearly 4 degrees Celsius over the last two decades. Urban canopy cover has dropped from 28 percent to 12 percent in the same period. The people most affected are low income communities who have 40 percent less tree cover than wealthier neighbourhoods and no means to change that.

At the same time, corporations have ESG commitments they need to fulfil and budgets allocated for environmental action. The problem is they have no reliable way to know where their money will have the most impact. Tree planting today is largely random, undocumented, and impossible to verify for carbon credit markets.

CanopyROI solves both sides of that equation simultaneously.



 Unique Selling Points

Precision over guesswork. Every planting recommendation is backed by satellite data from Sentinel-2 and MODIS, processed through Google Earth Engine. We compute NDVI and Land Surface Temperature for every zone before making a single recommendation. No other urban greening tool in India does this at zone level.

ML-driven species selection. Our TWIST 1 model is a calibrated ensemble of Gradient Boosting, Random Forest, and Logistic Regression that predicts the 5-year survival probability of each tree species for a given microclimate. When you select a zone, the platform tells you not just where to plant but which species will actually survive there. This is the difference between planting trees and growing trees.

Drought-aware optimization. Our TWIST 2 model activates a drought scoring mode that dynamically reweights zone priority based on water proximity and soil moisture using a Gradient Boosting Regressor trained on spatial features. When water is scarce, the optimizer automatically shifts to zones that can sustain growth without irrigation.

Budget constrained optimization. The knapsack algorithm selects the combination of zones that delivers maximum cumulative impact without exceeding the user's budget. A corporate ESG team can set a budget of five lakhs or five crores and get an optimal allocation in under thirty seconds.

Verifiable ESG receipts. Every optimization run generates a structured ESG impact report showing carbon sequestered over ten years, local temperature reduction, carbon credit value at current voluntary market rates, ROI percentage, and cross-city comparison. This report is built to the standard that ESG auditors and impact investors actually require.

Private land handling. When a high-impact zone turns out to be private land, the platform does not just exclude it. It shows the user neighbouring public areas with available area in square kilometres so no opportunity is lost.

Triple role access. The platform is built for three distinct user types — students and researchers who need data, farmers who need land use guidance, and NGO officials who need policy-grade reports. Each role gets a tailored login flow and dashboard experience.



 Business Model

Primary revenue — Corporate ESG subscriptions.** Large corporations with mandatory ESG reporting under SEBI regulations pay a monthly or annual subscription to run unlimited optimizations, generate branded ESG receipts, and access carbon credit valuation reports. Target clients are infrastructure companies, IT parks, real estate developers, and manufacturing units in Maharashtra and Karnataka.

Secondary revenue — Government and municipal contracts.** Smart city programs and urban development authorities pay for city-wide canopy analysis, zone prioritization reports, and ongoing monitoring dashboards. This is a project-based revenue model.

Tertiary revenue — Carbon credit facilitation.** As voluntary carbon markets mature in India, CanopyROI can act as the technical verification layer between tree planters and carbon registries, earning a percentage of each credit issued.

Data licensing. Aggregated, anonymized urban heat and vegetation data has value to climate researchers, insurance companies pricing climate risk, and real estate platforms. This becomes a long term passive revenue stream.



Tech Stack

Frontend — Next.js with React, styled with Tailwind CSS. Three pages covering login, landing, and the main dashboard. Recharts for data visualization. Leaflet with react-leaflet for interactive geospatial mapping, using CartoDB tiles with no API key dependency. Zustand for global state management. Axios and React Query for API communication. Full internationalization in English, Marathi, and Hindi.

Backend — Python with FastAPI. Clean service-oriented architecture separating parsing, optimization, ESG reporting, and ML inference into individual modules. Pydantic for strict request and response validation. CORS configured for local and production origins.

Machine Learning — Two independent ML systems. TWIST 1 is a soft-voting ensemble classifier combining Gradient Boosting, Random Forest, and Logistic Regression with Platt scaling for calibrated survival probabilities. TWIST 2 is a Gradient Boosting Regressor pipeline with StandardScaler achieving cross-validated R-squared of 0.886 for drought impact scoring. Both models train on startup from synthetic data and are ready to accept real GEE exports as a direct drop-in.

Geospatial processing — Google Earth Engine Python API for Sentinel-2 multi-band imagery ingestion, QA60 cloud masking, NDVI computation, and MODIS Land Surface Temperature extraction. GeoPandas and Shapely for polygon operations, water proximity calculations, and spatial filtering.

Optimization — Greedy knapsack algorithm operating on impact-to-cost density ratios, with two modes: classic LST and NDVI weighted scoring, and ML-powered drought impact scoring from TWIST 2.

Infrastructure — Fully containerized with Docker and docker-compose. Data bootstrap service generates mock GeoJSON on first run. Backend and frontend communicate over an internal Docker network.



Who This Is Built For

Any organisation that has money allocated for environmental impact and needs to prove that impact with data. That is every listed Indian company with SEBI ESG compliance requirements, every smart city program, every CSR team, and every climate-focused NGO operating in urban India. The total addressable market is not tree planting — it is verified environmental accountability, which is a multi-billion rupee market growing every year as regulation tightens.

