# 🌸 BLOOM — Smart Period & Menstrual Health Tracker

> *"Your cycle. Your body. Your bloom."*  
> Understand your cycle, discover your patterns, and feel more connected to your body.

BLOOM is a full-stack, portfolio-quality menstrual cycle and wellness tracking web application designed with a high-end pink aesthetic, responsive design, statistical cycle intelligence, and Natural Language Processing (NLP) journal reflections.

---

## 🌟 Key Features

1. **🌸 Dusty Rose & Soft Pink Aesthetic**
   - Palette: Dusty Rose (`#D96C91`), Soft Pink (`#F4B8CC`), Blush White (`#FFF7FA`), Light Pink (`#FCE4EC`), Deep Pink (`#B94D75`), Mauve (`#A66C83`), and Dark Plum (`#392936`).
   - Premium typography using *Plus Jakarta Sans*, *DM Sans*, and *Playfair Display*.
   - Rounded cards, smooth gradients, subtle drop shadows, and micro-interactions.
   - Built-in **Dark Mode** with a complementary Mauve & Velvet Night palette.

2. **📊 Dynamic Cycle Forecasting & Circular Progress Ring**
   - Real-time cycle day counter and next period countdown.
   - Dynamic cycle length estimation (weighted moving average of historical periods).
   - Infradian phase detection: **Menstrual**, **Follicular**, **Ovulatory**, and **Luteal**.
   - Estimated 6-day fertile window and peak ovulation date.
   - Transparent, mathematical formulas without hardcoded assumptions.

3. **🗓️ Interactive Monthly Calendar**
   - Monthly grid with month-to-month navigation.
   - Color-coded distinctions: Confirmed Logged Periods (Deep Pink), Forecasted Periods (Dotted Pink), Fertile Window (Soft Mauve), and Peak Ovulation (Golden Sparkle).
   - Click any date to view logged symptoms, mark confirmed bleeding days, or record notes.

4. **💖 Period & Symptom Tracker**
   - Flow intensity: *Light*, *Medium*, *Heavy*, *Spotting*.
   - Physical symptoms: *Cramps*, *Headache*, *Bloating*, *Acne*, *Fatigue*, *Back Pain*, *Breast Tenderness*, *Mood Swings*, *Nausea*, *Insomnia*.
   - Moods: *Happy*, *Calm*, *Anxious*, *Irritated*, *Sad*, *Emotional*.
   - Vitality tracking: Energy levels, Sleep duration slider, and Water intake counter.

5. **🧠 NLP-Powered Reflective Journal**
   - Daily free-form journaling with real-time text analysis.
   - Identifies non-negated symptoms (e.g. captures *"tired and experiencing cramps"*, avoids *"no cramps"*).
   - Affective sentiment polarity scoring ($-1.0$ to $+1.0$).
   - Interactive suggestion banner: *"Your journal suggests you may be experiencing fatigue and cramps. Would you like to add these to today's log?"*
   - One-click confirmation synchronizes tags directly into the daily symptom log!

6. **📈 Recharts Analytics & Visual Insights**
   - Historical cycle length bar chart with personal benchmark line.
   - Bleeding duration history chart.
   - Symptom frequency horizontal distribution.
   - Mood distribution donut chart.
   - Standard deviation variance and regularity index.

7. **🎓 Educational Wellness Section**
   - In-depth guide for all four cycle phases with physiological changes, nutrition, and exercise recommendations.
   - Common menstrual symptoms guide with holistic relief tips.
   - Prominent clinical disclaimers.

8. **🔒 Settings, Security & Data Sovereignty**
   - Password hashing with PBKDF2/Werkzeug.
   - Complete personal data export in JSON format.
   - One-click **"Load Demo Data"** to populate 3 realistic historical cycles with symptoms and journal reflections.
   - Account deletion with full cascade cleanup.

---

## 🏗️ Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React, Recharts
- **Backend:** Python 3 Flask, SQLite 3, Flask-CORS, Werkzeug Security
- **Intelligence:** Python-based rule engine & NLP lexical sentiment processor with negation scope resolution
- **Architecture:** Decoupled REST API + Single-page Application

---

## 📁 Project Structure

```
bloom/
├── backend/
│   ├── app.py                  # Flask entrypoint & REST API routes
│   ├── database.py             # SQLite schema & database migrations
│   ├── auth.py                 # JWT token creation & authentication decorator
│   ├── cycle_engine.py         # Cycle day, phase, ovulation, & calendar engine
│   ├── nlp_engine.py           # NLP symptom extractor, negation & sentiment parser
│   ├── test_suite.py           # Comprehensive automated unittest suite
│   ├── requirements.txt        # Python backend dependencies
│   └── bloom.db                # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CycleProgressRing.jsx
│   │   │   ├── SymptomChips.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   └── OnboardingModal.jsx
│   │   ├── pages/              # Primary application views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── TrackerPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── JournalPage.jsx
│   │   │   ├── LearnPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── api.js              # Centralized REST API client
│   │   ├── App.jsx             # Main application orchestrator & routing
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind base styles & keyframe animations
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── run_bloom.bat               # One-click Windows launcher
├── API_DOCUMENTATION.md        # Complete REST API specification
├── CYCLE_PREDICTION_LOGIC.md   # Mathematical cycle formulation
└── NLP_IMPLEMENTATION.md       # NLP text processing architecture
```

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- Python 3.10+
- Flask & Flask-CORS (`pip install flask flask-cors werkzeug`)

### 2. Running the Application

#### Option A: Quick Launcher (Windows)
Double-click `run_bloom.bat` in the `bloom` folder. This starts the Flask server and opens your default browser at `http://localhost:5000`.

#### Option B: Manual Command Line
```bash
cd backend
python app.py
```
Then navigate to `http://localhost:5000` in your browser.

### 3. Exploring with Demo Data
1. Sign up for a new account (e.g. `shriya@example.com`).
2. Complete the 3-step onboarding walkthrough.
3. Click the **"Load Demo Data"** button in the top navigation bar.
4. Watch the Dashboard, Calendar, and Analytics pages instantly populate with 3 realistic historical cycles, symptoms, moods, water tracking, and NLP reflections!

---

## 🧪 Automated Testing

To run the automated backend test suite covering authentication, period CRUD, calendar projections, NLP analysis, and data export:

```bash
cd backend
python test_suite.py
```

All tests execute in sub-second time with 100% pass rate.

---

## ⚖️ Medical Disclaimer
BLOOM is an educational and personal health-tracking tool. All cycle dates, ovulation days, and fertile windows are statistical approximations and must **never** be used for medical diagnosis, clinical evaluation, or contraception. Always consult a healthcare provider for gynecological or hormonal health guidance.

