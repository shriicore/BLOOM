# BLOOM — REST API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an `Authorization` header formatted as:
```http
Authorization: Bearer <jwt_or_auth_token>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account and calibrates initial cycle preferences.
- **Request Body:**
  ```json
  {
    "name": "Shriya",
    "email": "shriya@example.com",
    "password": "strongPassword123",
    "cycle_length": 28,
    "period_duration": 5,
    "is_regular": true,
    "last_period_date": "2026-11-01"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "token": "<token>",
    "user": {
      "id": 1,
      "name": "Shriya",
      "email": "shriya@example.com"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates an existing user via email and hashed password verification.
- **Request Body:**
  ```json
  {
    "email": "shriya@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "<token>",
    "user": {
      "id": 1,
      "name": "Shriya",
      "email": "shriya@example.com"
    }
  }
  ```

### `GET /api/auth/me` *(Protected)*
Returns the current authenticated user's profile and calibrated cycle preferences.

---

## 2. Cycle Predictions & Calendar

### `GET /api/cycle/status` *(Protected)*
Calculates dynamic cycle status based on the user's recorded periods and preferences.
- **Response (200 OK):**
  ```json
  {
    "current_cycle_day": 10,
    "total_cycle_length": 29,
    "period_duration": 5,
    "last_period_date": "2026-11-01",
    "estimated_next_period": "2026-11-30",
    "days_until_next_period": 20,
    "cycle_progress_percentage": 34,
    "phase": "Follicular Phase",
    "phase_key": "follicular",
    "phase_description": "Follicle-stimulating hormone...",
    "phase_hormones": "Rising Estrogen, Low Progesterone",
    "wellness_tips": [ ... ],
    "estimated_ovulation_date": "2026-11-15",
    "ovulation_day_number": 15,
    "fertile_window": {
      "start_date": "2026-11-10",
      "end_date": "2026-11-16",
      "is_active_today": true,
      "is_ovulation_today": false
    },
    "metrics": {
      "avg_cycle_length": 29,
      "avg_period_duration": 5,
      "is_dynamically_calculated": true,
      "cycle_count": 3,
      "std_dev": 1.0,
      "regularity_status": "Very Regular"
    },
    "disclaimer": "All cycle, ovulation, and fertile window predictions are statistical estimates..."
  }
  ```

### `GET /api/cycle/calendar?year=YYYY&month=MM` *(Protected)*
Generates a monthly grid with confirmed period days, forecasted period days, fertile window, and ovulation day.

---

## 3. Period Logs CRUD

- `GET /api/periods`: List all logged periods for the user, ordered newest first.
- `POST /api/periods`: Add a new period log (`start_date`, `end_date`, `flow`, `notes`).
- `PUT /api/periods/<id>`: Update an existing period log.
- `DELETE /api/periods/<id>`: Delete an existing period log.

---

## 4. Daily Symptoms Tracking

### `GET /api/symptoms?date=YYYY-MM-DD` *(Protected)*
Retrieves flow, symptoms list, mood, energy, sleep hours, water intake, and notes for a specific date.

### `POST /api/symptoms` *(Protected)*
Upserts the daily record for a date.
- **Request Body:**
  ```json
  {
    "log_date": "2026-11-10",
    "flow": "medium",
    "symptoms": ["cramps", "fatigue", "bloating"],
    "mood": "calm",
    "energy": "medium",
    "sleep_hours": 7.5,
    "water_intake_ml": 2250,
    "notes": "Evening chamomile tea"
  }
  ```

---

## 5. NLP-Powered Journal

### `POST /api/journal/analyze` *(Protected)*
Runs NLP tokenization, negation detection, and sentiment analysis on raw journal text.
- **Request Body:**
  ```json
  {
    "content": "I have been feeling tired and experiencing cramps today. My mood is also low."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detected_symptoms": ["fatigue", "cramps"],
    "detected_mood": null,
    "sentiment_score": -0.6,
    "sentiment_label": "negative",
    "suggestion_message": "Your journal suggests you may be experiencing fatigue and cramps. Would you like to add these to today's log?",
    "disclaimer": "Bloom's NLP insights are AI pattern suggestions..."
  }
  ```

### `POST /api/journal` *(Protected)*
Saves a new reflection entry with automated NLP extraction.

### `POST /api/journal/<entry_id>/confirm-tags` *(Protected)*
Confirms NLP suggestions and pushes detected symptoms & mood to the user's daily symptom log for that entry date.

### `GET /api/journal?q=<search_query>` *(Protected)*
Retrieves past journal reflections with optional keyword filter.

### `DELETE /api/journal/<entry_id>` *(Protected)*
Deletes a journal reflection.

---

## 6. Analytics & Insights

### `GET /api/analytics` *(Protected)*
Returns calculated analytics derived strictly from the user's recorded database records:
- `metrics`: Weighted averages, std dev, regularity rating.
- `cycle_history`: Cycle length per historical cycle vs target benchmark.
- `period_duration_history`: Bleeding duration history.
- `symptom_distribution`: Frequency distribution of symptoms.
- `mood_distribution`: Mood occurrence counts.
- `flow_distribution`: Flow intensity breakdown.

---

## 7. User Data Sovereignty & Demo

- `GET /api/user/export`: Instant complete JSON data archive export.
- `PUT /api/user/profile`: Update display name.
- `PUT /api/user/password`: Change account password.
- `DELETE /api/user/account`: Delete user account and cascade delete all associated records.
- `POST /api/demo/seed`: Populates 3 realistic cycles, daily symptoms, and NLP reflections for rapid demonstration.

