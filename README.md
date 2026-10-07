\# AstroShield – AI-Based Satellite Collision Avoidance



AstroShield is an AI-based satellite collision avoidance and space traffic management system developed as an individual MCA project.



The system monitors satellites and space debris, analyzes orbital information, estimates collision risk using machine learning, and provides alerts and recommendations through an interactive web dashboard.



\## Key Features



\* Satellite and space-debris monitoring

\* AI-based collision risk prediction

\* Relative distance and velocity analysis

\* Risk classification as HIGH, MEDIUM, or LOW

\* Real-time alert generation

\* Collision analysis and avoidance recommendations

\* Interactive satellite analytics

\* Orbit simulation and visualization

\* MongoDB integration

\* External satellite data API integration

\* PDF report generation

\* Demo mode when MongoDB is unavailable



\## Technology Stack



\### Frontend



\* React

\* React Router

\* Tailwind CSS

\* Plotly



\### Backend



\* Python

\* Flask

\* REST APIs



\### Database



\* MongoDB



\### Machine Learning



\* Scikit-learn

\* Random Forest

\* Logistic Regression



\### Simulation \& Visualization



\* Python-based orbit simulation

\* Orbital physics calculations

\* Plotly visualizations



\## System Architecture



```text

External Satellite Data

&#x20;       │

&#x20;       ▼

┌──────────────────────┐

│   Flask Backend      │

│                      │

│ API \& Business Logic │

└──────────┬───────────┘

&#x20;          │

&#x20;    ┌─────┴─────┐

&#x20;    ▼           ▼

&#x20;MongoDB      ML Model

&#x20;    │           │

&#x20;    │      Collision Risk

&#x20;    │       Prediction

&#x20;    └─────┬─────┘

&#x20;          ▼

┌──────────────────────┐

│   React Frontend     │

│                      │

│ Dashboard \& Analysis │

└──────────────────────┘

```



\## Machine Learning Approach



AstroShield uses machine learning and orbital analysis to estimate collision risk.



The prediction pipeline includes:



1\. Orbital and satellite/debris data collection

2\. Relative distance calculation

3\. Relative velocity analysis

4\. Feature preparation

5\. Machine learning prediction

6\. Collision-risk classification

7\. Alert and recommendation generation



The project includes a trained collision prediction model using an ensemble approach involving:



\* Random Forest

\* Logistic Regression



The trained model is stored at:



```text

backend/ml-model/collision\_predictor.pkl

```



\## Project Structure



```text

AstroShield/

│

├── backend/

│   ├── database/

│   ├── ml-model/

│   │   └── collision\_predictor.pkl

│   ├── models/

│   ├── routes/

│   ├── scripts/

│   ├── services/

│   ├── tests/

│   ├── app.py

│   └── requirements.txt

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── services/

│   │   └── utils/

│   ├── package.json

│   └── tailwind.config.js

│

├── simulation/

│   ├── orbit\_simulator.py

│   └── physics\_engine.py

│

├── .gitignore

└── README.md

```



\## Installation



\### 1. Clone the repository



```bash

git clone <your-repository-url>

cd satellite-traffic-management

```



\### 2. Backend setup



```bash

cd backend

python -m venv venv

```



Activate the virtual environment on Windows:



```powershell

venv\\Scripts\\activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



\### 3. Configure environment variables



Create a `.env` file inside the `backend` directory using `.env.example` as a reference.



```text

backend/

├── .env

└── .env.example

```



Do not commit `.env` because it may contain database credentials or API keys.



\### 4. Start the backend



```bash

cd backend

python app.py

```



The backend runs on:



```text

http://localhost:5000

```



\### 5. Start the frontend



Open another terminal:



```bash

cd frontend

npm install

npm start

```



The frontend runs on:



```text

http://localhost:3000

```



\## MongoDB



AstroShield supports MongoDB for storing application data such as:



\* Users

\* Satellites

\* Predictions

\* Alerts

\* Recommendations



The application also supports demo-mode operation when MongoDB is unavailable.



\## API Integrations



The project can work with external space-data services such as:



\* CelesTrak

\* N2YO

\* NASA APIs where applicable



API keys and credentials should be stored in environment variables rather than committed to the repository.



\## Testing



Backend smoke checks can be executed using:



```bash

cd backend

python scripts/smoke\_check.py

```



API tests are available under:



```text

backend/tests/

```



\## Future Enhancements



\* Real-time satellite tracking

\* Improved 3D orbital visualization

\* Deep learning-based collision prediction

\* Reinforcement learning for maneuver planning

\* Automated avoidance maneuver generation

\* Expanded real-time external satellite data integration

\* Mobile application



\## Developer



\*\*Shilpa Shree R\*\*



MCA – Computer Applications



AstroShield was developed individually as an academic project, covering frontend development, backend API development, database integration, machine learning, simulation, and system integration.



