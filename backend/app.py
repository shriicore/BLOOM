import os
import json
from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_db, init_db
from auth import create_token, token_required
from cycle_engine import CycleEngine
from nlp_engine import analyze_journal_text

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

# Ensure DB initialized
init_db()

# --- AUTH ENDPOINTS ---

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "An account with this email already exists"}), 409

    pwd_hash = generate_password_hash(password)
    cursor.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", (name, email, pwd_hash))
    user_id = cursor.lastrowid

    # Create default cycle preferences
    last_period_date = data.get("last_period_date") or (date.today() - timedelta(days=12)).strftime("%Y-%m-%d")
    cycle_length = int(data.get("cycle_length") or 28)
    period_duration = int(data.get("period_duration") or 5)
    is_regular = 1 if data.get("is_regular", True) else 0

    cursor.execute("""
        INSERT INTO cycle_preferences (user_id, cycle_length, period_duration, is_regular, last_period_date)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, cycle_length, period_duration, is_regular, last_period_date))

    # Also insert initial period log if last_period_date provided
    if last_period_date:
        end_date = (datetime.strptime(last_period_date, "%Y-%m-%d").date() + timedelta(days=period_duration - 1)).strftime("%Y-%m-%d")
        cursor.execute("""
            INSERT INTO period_logs (user_id, start_date, end_date, flow, notes)
            VALUES (?, ?, ?, 'medium', 'Initial onboarding cycle')
        """, (user_id, last_period_date, end_date))

    conn.commit()
    conn.close()

    token = create_token(user_id, email, name)
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user["id"], user["email"], user["name"])
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })

@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_me():
    user = request.current_user
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT cycle_length, period_duration, is_regular, last_period_date, reminder_days_before, notifications_enabled
        FROM cycle_preferences WHERE user_id = ?
    """, (user["id"],))
    prefs = cursor.fetchone()
    conn.close()

    return jsonify({
        "user": user,
        "preferences": dict(prefs) if prefs else None
    })

# --- PREFERENCES & USER PROFILE ---

@app.route("/api/user/preferences", methods=["GET", "PUT"])
@token_required
def user_preferences():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM cycle_preferences WHERE user_id = ?", (user_id,))
        prefs = cursor.fetchone()
        conn.close()
        return jsonify(dict(prefs) if prefs else {})

    data = request.get_json() or {}
    cycle_length = int(data.get("cycle_length", 28))
    period_duration = int(data.get("period_duration", 5))
    is_regular = 1 if data.get("is_regular", True) else 0
    last_period_date = data.get("last_period_date")
    reminder_days_before = int(data.get("reminder_days_before", 2))
    notifications_enabled = 1 if data.get("notifications_enabled", True) else 0

    cursor.execute("""
        INSERT INTO cycle_preferences (user_id, cycle_length, period_duration, is_regular, last_period_date, reminder_days_before, notifications_enabled, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            cycle_length = excluded.cycle_length,
            period_duration = excluded.period_duration,
            is_regular = excluded.is_regular,
            last_period_date = excluded.last_period_date,
            reminder_days_before = excluded.reminder_days_before,
            notifications_enabled = excluded.notifications_enabled,
            updated_at = CURRENT_TIMESTAMP
    """, (user_id, cycle_length, period_duration, is_regular, last_period_date, reminder_days_before, notifications_enabled))

    conn.commit()
    conn.close()
    return jsonify({"message": "Preferences updated successfully"})

@app.route("/api/user/profile", methods=["PUT"])
@token_required
def update_profile():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated", "name": name})

@app.route("/api/user/password", methods=["PUT"])
@token_required
def change_password():
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    current_pwd = data.get("current_password", "")
    new_pwd = data.get("new_password", "")

    if not current_pwd or not new_pwd:
        return jsonify({"error": "Current and new password are required"}), 400

    if len(new_pwd) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row or not check_password_hash(row["password_hash"], current_pwd):
        conn.close()
        return jsonify({"error": "Current password is incorrect"}), 401

    new_hash = generate_password_hash(new_pwd)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Password changed successfully"})

@app.route("/api/user/account", methods=["DELETE"])
@token_required
def delete_account():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Account deleted successfully"})

@app.route("/api/user/export", methods=["GET"])
@token_required
def export_user_data():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    user = dict(cursor.fetchone() or {})

    cursor.execute("SELECT * FROM cycle_preferences WHERE user_id = ?", (user_id,))
    prefs = dict(cursor.fetchone() or {})

    cursor.execute("SELECT * FROM period_logs WHERE user_id = ? ORDER BY start_date DESC", (user_id,))
    periods = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM daily_symptom_logs WHERE user_id = ? ORDER BY log_date DESC", (user_id,))
    symptoms = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC", (user_id,))
    journals = [dict(r) for r in cursor.fetchall()]

    conn.close()

    export_payload = {
        "export_metadata": {
            "app": "Bloom Menstrual Tracker",
            "exported_at": datetime.now().isoformat(),
            "version": "1.0.0"
        },
        "user_profile": user,
        "preferences": prefs,
        "period_logs": periods,
        "daily_symptom_logs": symptoms,
        "journal_entries": journals
    }

    return jsonify(export_payload)

# --- CYCLE & CALENDAR ENDPOINTS ---

@app.route("/api/cycle/status", methods=["GET"])
@token_required
def cycle_status():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cycle_preferences WHERE user_id = ?", (user_id,))
    prefs_row = cursor.fetchone()
    prefs = dict(prefs_row) if prefs_row else {}

    cursor.execute("SELECT * FROM period_logs WHERE user_id = ? ORDER BY start_date ASC", (user_id,))
    periods = [dict(r) for r in cursor.fetchall()]

    conn.close()

    engine = CycleEngine(
        baseline_cycle_length=prefs.get("cycle_length", 28),
        baseline_period_duration=prefs.get("period_duration", 5),
        is_regular=bool(prefs.get("is_regular", 1))
    )

    status = engine.get_cycle_status(
        last_period_start_str=prefs.get("last_period_date"),
        period_logs=periods
    )

    return jsonify(status)

@app.route("/api/cycle/calendar", methods=["GET"])
@token_required
def cycle_calendar():
    user_id = request.current_user["id"]
    year = int(request.args.get("year", date.today().year))
    month = int(request.args.get("month", date.today().month))

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cycle_preferences WHERE user_id = ?", (user_id,))
    prefs_row = cursor.fetchone()
    prefs = dict(prefs_row) if prefs_row else {}

    cursor.execute("SELECT * FROM period_logs WHERE user_id = ? ORDER BY start_date ASC", (user_id,))
    periods = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM daily_symptom_logs WHERE user_id = ?", (user_id,))
    symptoms = [dict(r) for r in cursor.fetchall()]

    conn.close()

    engine = CycleEngine(
        baseline_cycle_length=prefs.get("cycle_length", 28),
        baseline_period_duration=prefs.get("period_duration", 5),
        is_regular=bool(prefs.get("is_regular", 1))
    )

    calendar_days = engine.generate_calendar_days(
        year=year,
        month=month,
        period_logs=periods,
        symptom_logs=symptoms,
        last_period_date_str=prefs.get("last_period_date")
    )

    return jsonify({
        "year": year,
        "month": month,
        "days": calendar_days
    })

# --- PERIOD LOGS CRUD ---

@app.route("/api/periods", methods=["GET", "POST"])
@token_required
def period_logs():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        cursor.execute("SELECT * FROM period_logs WHERE user_id = ? ORDER BY start_date DESC", (user_id,))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return jsonify(rows)

    data = request.get_json() or {}
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    flow = data.get("flow", "medium")
    notes = data.get("notes", "")

    if not start_date:
        conn.close()
        return jsonify({"error": "start_date is required"}), 400

    cursor.execute("""
        INSERT INTO period_logs (user_id, start_date, end_date, flow, notes)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, start_date, end_date, flow, notes))
    log_id = cursor.lastrowid

    # Update preferences last_period_date if this is the newest
    cursor.execute("SELECT last_period_date FROM cycle_preferences WHERE user_id = ?", (user_id,))
    cur_pref = cursor.fetchone()
    if not cur_pref or not cur_pref["last_period_date"] or start_date > cur_pref["last_period_date"]:
        cursor.execute("UPDATE cycle_preferences SET last_period_date = ? WHERE user_id = ?", (start_date, user_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Period log saved", "id": log_id}), 201

@app.route("/api/periods/<int:log_id>", methods=["PUT", "DELETE"])
@token_required
def period_log_detail(log_id):
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM period_logs WHERE id = ? AND user_id = ?", (log_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Period log not found"}), 404

    if request.method == "DELETE":
        cursor.execute("DELETE FROM period_logs WHERE id = ? AND user_id = ?", (log_id, user_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Period log deleted"})

    data = request.get_json() or {}
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    flow = data.get("flow", "medium")
    notes = data.get("notes", "")

    cursor.execute("""
        UPDATE period_logs SET start_date = ?, end_date = ?, flow = ?, notes = ?
        WHERE id = ? AND user_id = ?
    """, (start_date, end_date, flow, notes, log_id, user_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Period log updated"})

# --- DAILY SYMPTOMS ENDPOINTS ---

@app.route("/api/symptoms", methods=["GET", "POST"])
@token_required
def daily_symptoms():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        log_date = request.args.get("date") or date.today().strftime("%Y-%m-%d")
        cursor.execute("SELECT * FROM daily_symptom_logs WHERE user_id = ? AND log_date = ?", (user_id, log_date))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return jsonify({
                "log_date": log_date,
                "flow": None,
                "symptoms": [],
                "mood": None,
                "energy": None,
                "sleep_hours": None,
                "water_intake_ml": 0,
                "notes": ""
            })
        item = dict(row)
        try:
            item["symptoms"] = json.loads(item.get("symptoms") or "[]")
        except Exception:
            item["symptoms"] = []
        return jsonify(item)

    data = request.get_json() or {}
    log_date = data.get("log_date") or date.today().strftime("%Y-%m-%d")
    flow = data.get("flow")
    symptoms = data.get("symptoms", [])
    if isinstance(symptoms, list):
        symptoms_str = json.dumps(symptoms)
    else:
        symptoms_str = "[]"
    mood = data.get("mood")
    energy = data.get("energy")
    sleep_hours = data.get("sleep_hours")
    water_intake_ml = data.get("water_intake_ml", 0)
    notes = data.get("notes", "")

    cursor.execute("""
        INSERT INTO daily_symptom_logs (user_id, log_date, flow, symptoms, mood, energy, sleep_hours, water_intake_ml, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, log_date) DO UPDATE SET
            flow = excluded.flow,
            symptoms = excluded.symptoms,
            mood = excluded.mood,
            energy = excluded.energy,
            sleep_hours = excluded.sleep_hours,
            water_intake_ml = excluded.water_intake_ml,
            notes = excluded.notes,
            created_at = CURRENT_TIMESTAMP
    """, (user_id, log_date, flow, symptoms_str, mood, energy, sleep_hours, water_intake_ml, notes))

    conn.commit()
    conn.close()
    return jsonify({"message": "Daily symptoms logged successfully", "log_date": log_date})

@app.route("/api/symptoms/recent", methods=["GET"])
@token_required
def recent_symptoms():
    user_id = request.current_user["id"]
    limit = int(request.args.get("limit", 7))
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM daily_symptom_logs WHERE user_id = ?
        ORDER BY log_date DESC LIMIT ?
    """, (user_id, limit))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for r in rows:
        try:
            r["symptoms"] = json.loads(r.get("symptoms") or "[]")
        except Exception:
            r["symptoms"] = []

    return jsonify(rows)

# --- NLP JOURNAL ENDPOINTS ---

@app.route("/api/journal/analyze", methods=["POST"])
@token_required
def analyze_journal():
    data = request.get_json() or {}
    text = data.get("content", "")
    analysis = analyze_journal_text(text)
    return jsonify(analysis)

@app.route("/api/journal", methods=["GET", "POST"])
@token_required
def journal_collection():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "GET":
        search_query = request.args.get("q", "").strip()
        if search_query:
            cursor.execute("""
                SELECT * FROM journal_entries 
                WHERE user_id = ? AND (content LIKE ? OR title LIKE ?)
                ORDER BY entry_date DESC, created_at DESC
            """, (user_id, f"%{search_query}%", f"%{search_query}%"))
        else:
            cursor.execute("""
                SELECT * FROM journal_entries WHERE user_id = ?
                ORDER BY entry_date DESC, created_at DESC
            """, (user_id,))
        
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        for r in rows:
            try:
                r["detected_symptoms"] = json.loads(r.get("detected_symptoms") or "[]")
            except Exception:
                r["detected_symptoms"] = []

        return jsonify(rows)

    data = request.get_json() or {}
    content = data.get("content", "").strip()
    title = data.get("title", "").strip() or "Cycle Reflection"
    entry_date = data.get("entry_date") or date.today().strftime("%Y-%m-%d")

    if not content:
        conn.close()
        return jsonify({"error": "Content cannot be empty"}), 400

    # Execute NLP analysis on journal content
    nlp_res = analyze_journal_text(content)
    detected_symptoms_json = json.dumps(nlp_res["detected_symptoms"])
    detected_mood = nlp_res["detected_mood"]
    sentiment_score = nlp_res["sentiment_score"]

    cursor.execute("""
        INSERT INTO journal_entries (user_id, entry_date, title, content, detected_symptoms, detected_mood, sentiment_score, tags_confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    """, (user_id, entry_date, title, content, detected_symptoms_json, detected_mood, sentiment_score))
    entry_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Journal entry saved",
        "entry_id": entry_id,
        "nlp_analysis": nlp_res
    }), 201

@app.route("/api/journal/<int:entry_id>/confirm-tags", methods=["POST"])
@token_required
def confirm_journal_tags(entry_id):
    user_id = request.current_user["id"]
    data = request.get_json() or {}
    confirmed_symptoms = data.get("symptoms", [])
    confirmed_mood = data.get("mood")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT entry_date FROM journal_entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
    entry = cursor.fetchone()
    if not entry:
        conn.close()
        return jsonify({"error": "Journal entry not found"}), 404

    entry_date = entry["entry_date"]

    # Mark tags confirmed in journal
    cursor.execute("UPDATE journal_entries SET tags_confirmed = 1 WHERE id = ?", (entry_id,))

    # Pull existing daily symptoms for entry_date to merge
    cursor.execute("SELECT * FROM daily_symptom_logs WHERE user_id = ? AND log_date = ?", (user_id, entry_date))
    existing = cursor.fetchone()

    if existing:
        try:
            curr_symptoms = set(json.loads(existing["symptoms"] or "[]"))
        except Exception:
            curr_symptoms = set()
        for s in confirmed_symptoms:
            curr_symptoms.add(s)
        merged_symptoms = list(curr_symptoms)
        new_mood = confirmed_mood or existing["mood"]

        cursor.execute("""
            UPDATE daily_symptom_logs
            SET symptoms = ?, mood = ?
            WHERE user_id = ? AND log_date = ?
        """, (json.dumps(merged_symptoms), new_mood, user_id, entry_date))
    else:
        cursor.execute("""
            INSERT INTO daily_symptom_logs (user_id, log_date, symptoms, mood, notes)
            VALUES (?, ?, ?, ?, 'Imported from Bloom NLP Journal')
        """, (user_id, entry_date, json.dumps(confirmed_symptoms), confirmed_mood))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Suggested tags confirmed and synchronized to your daily symptom log!",
        "log_date": entry_date
    })

@app.route("/api/journal/<int:entry_id>", methods=["DELETE"])
@token_required
def delete_journal(entry_id):
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM journal_entries WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Journal entry deleted"})

# --- ANALYTICS ENDPOINTS ---

@app.route("/api/analytics", methods=["GET"])
@token_required
def get_analytics():
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    # Preferences
    cursor.execute("SELECT cycle_length, period_duration, is_regular FROM cycle_preferences WHERE user_id = ?", (user_id,))
    prefs = dict(cursor.fetchone() or {"cycle_length": 28, "period_duration": 5, "is_regular": 1})

    # Period logs
    cursor.execute("SELECT * FROM period_logs WHERE user_id = ? ORDER BY start_date ASC", (user_id,))
    periods = [dict(r) for r in cursor.fetchall()]

    # Symptoms
    cursor.execute("SELECT * FROM daily_symptom_logs WHERE user_id = ? ORDER BY log_date ASC", (user_id,))
    symptoms = [dict(r) for r in cursor.fetchall()]

    conn.close()

    engine = CycleEngine(
        baseline_cycle_length=prefs.get("cycle_length", 28),
        baseline_period_duration=prefs.get("period_duration", 5),
        is_regular=bool(prefs.get("is_regular", 1))
    )
    metrics = engine.calculate_personalized_metrics(periods)

    # 1. Cycle Length History (Chart Data)
    cycle_history_data = []
    for i in range(len(periods) - 1):
        try:
            s1 = datetime.strptime(periods[i]["start_date"], "%Y-%m-%d").date()
            s2 = datetime.strptime(periods[i + 1]["start_date"], "%Y-%m-%d").date()
            length = (s2 - s1).days
            if 15 <= length <= 60:
                cycle_history_data.append({
                    "cycle_index": f"Cycle {i + 1}",
                    "date": periods[i + 1]["start_date"],
                    "cycle_length": length,
                    "target_benchmark": metrics["avg_cycle_length"]
                })
        except Exception:
            pass

    # If few historical cycles, provide at least the baseline visual entry
    if not cycle_history_data:
        cycle_history_data = [
            {"cycle_index": "Baseline", "date": date.today().strftime("%Y-%m-%d"), "cycle_length": prefs.get("cycle_length", 28), "target_benchmark": prefs.get("cycle_length", 28)}
        ]

    # 2. Period Duration History
    period_duration_data = []
    for p in periods:
        if p.get("start_date") and p.get("end_date"):
            try:
                s = datetime.strptime(p["start_date"], "%Y-%m-%d").date()
                e = datetime.strptime(p["end_date"], "%Y-%m-%d").date()
                dur = (e - s).days + 1
                period_duration_data.append({
                    "date": p["start_date"],
                    "duration_days": dur,
                    "flow": p.get("flow", "medium")
                })
            except Exception:
                pass

    if not period_duration_data:
        period_duration_data = [
            {"date": date.today().strftime("%Y-%m-%d"), "duration_days": prefs.get("period_duration", 5), "flow": "medium"}
        ]

    # 3. Symptom Frequency Distribution
    symptom_counts = {}
    for sl in symptoms:
        try:
            syms = json.loads(sl.get("symptoms") or "[]")
            for s in syms:
                readable = s.replace("_", " ").title()
                symptom_counts[readable] = symptom_counts.get(readable, 0) + 1
        except Exception:
            pass

    symptom_distribution = [
        {"name": k, "count": v}
        for k, v in sorted(symptom_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # 4. Mood Breakdown
    mood_counts = {}
    for sl in symptoms:
        m = sl.get("mood")
        if m:
            readable = m.capitalize()
            mood_counts[readable] = mood_counts.get(readable, 0) + 1

    mood_distribution = [
        {"name": k, "count": v}
        for k, v in sorted(mood_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # 5. Flow Breakdown
    flow_counts = {"Light": 0, "Medium": 0, "Heavy": 0, "Spotting": 0}
    for p in periods:
        fl = (p.get("flow") or "medium").capitalize()
        if fl in flow_counts:
            flow_counts[fl] += 1
    for sl in symptoms:
        fl = (sl.get("flow") or "").capitalize()
        if fl in flow_counts:
            flow_counts[fl] += 1

    flow_distribution = [
        {"name": k, "value": v}
        for k, v in flow_counts.items() if v > 0
    ]

    return jsonify({
        "metrics": metrics,
        "cycle_history": cycle_history_data,
        "period_duration_history": period_duration_data,
        "symptom_distribution": symptom_distribution,
        "mood_distribution": mood_distribution,
        "flow_distribution": flow_distribution,
        "total_periods_logged": len(periods),
        "total_days_tracked": len(symptoms)
    })

# --- DEMO SEED ENDPOINT ---

@app.route("/api/demo/seed", methods=["POST"])
@token_required
def seed_demo_data():
    """
    Populates 3 full realistic cycles with symptoms, moods, water, sleep,
    and thoughtful journal entries for rich portfolio testing and review.
    """
    user_id = request.current_user["id"]
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing logs for fresh seed
    cursor.execute("DELETE FROM period_logs WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM daily_symptom_logs WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM journal_entries WHERE user_id = ?", (user_id,))

    today = date.today()

    # Cycle 1: 56 days ago (28 days long, 5 days duration)
    p1_start = today - timedelta(days=58)
    p1_end = p1_start + timedelta(days=4)

    # Cycle 2: 29 days ago (29 days long, 5 days duration)
    p2_start = today - timedelta(days=29)
    p2_end = p2_start + timedelta(days=4)

    # Cycle 3: Started 2 days ago (Current cycle, bleeding now)
    p3_start = today - timedelta(days=2)
    p3_end = p3_start + timedelta(days=4)

    # Insert period logs
    cursor.execute("""
        INSERT INTO period_logs (user_id, start_date, end_date, flow, notes)
        VALUES 
        (?, ?, ?, 'heavy', 'Strong flow on days 2 and 3'),
        (?, ?, ?, 'medium', 'Regular onset with mild cramps'),
        (?, ?, ?, 'medium', 'Current cycle - tracking closely')
    """, (
        user_id, p1_start.strftime("%Y-%m-%d"), p1_end.strftime("%Y-%m-%d"),
        user_id, p2_start.strftime("%Y-%m-%d"), p2_end.strftime("%Y-%m-%d"),
        user_id, p3_start.strftime("%Y-%m-%d"), p3_end.strftime("%Y-%m-%d")
    ))

    # Update preferences
    cursor.execute("""
        UPDATE cycle_preferences 
        SET last_period_date = ?, cycle_length = 29, period_duration = 5, is_regular = 1
        WHERE user_id = ?
    """, (p3_start.strftime("%Y-%m-%d"), user_id))

    # Add realistic daily symptom logs for past 30 days
    sample_daily = [
        # Menstrual days current cycle
        (today - timedelta(days=2), "heavy", ["cramps", "fatigue"], "tired", "low", 7.0, 2200, "Used hot water bottle for cramps."),
        (today - timedelta(days=1), "medium", ["cramps", "back_pain", "bloating"], "emotional", "low", 6.5, 2500, "Chamomile tea helped calm the stomach ache."),
        (today, "medium", ["fatigue", "headache"], "calm", "medium", 7.5, 2000, "Feeling peaceful today, rested in the afternoon."),
        # Luteal days before period
        (today - timedelta(days=3), "spotting", ["bloating", "mood_swings"], "irritated", "medium", 6.0, 1800, "PMS mood swings, cravings for chocolate."),
        (today - timedelta(days=5), None, ["acne", "breast_tenderness", "bloating"], "anxious", "low", 7.0, 2100, "Skin breakouts on forehead, tender breasts."),
        (today - timedelta(days=8), None, ["insomnia", "breast_tenderness"], "anxious", "medium", 5.5, 1900, "Woke up multiple times during the night."),
        # Ovulation days in previous cycle
        (today - timedelta(days=15), None, [], "happy", "high", 8.0, 2800, "High energy! Completed a 5k run."),
        (today - timedelta(days=16), None, [], "happy", "high", 8.2, 3000, "Feeling vibrant, radiant and creative."),
        # Follicular days
        (today - timedelta(days=20), None, [], "calm", "medium", 7.8, 2400, "Productive work day, steady stamina.")
    ]

    for d_date, flow, syms, mood, energy, sleep, water, notes in sample_daily:
        cursor.execute("""
            INSERT INTO daily_symptom_logs (user_id, log_date, flow, symptoms, mood, energy, sleep_hours, water_intake_ml, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, d_date.strftime("%Y-%m-%d"), flow, json.dumps(syms), mood, energy, sleep, water, notes))

    # Seed sample NLP journal entries
    journals = [
        (
            today - timedelta(days=2),
            "Day 1 Reflections",
            "My period started this morning. I have been feeling quite tired and experiencing noticeable cramps and lower back pain. Staying warm and drinking plenty of water.",
            json.dumps(["fatigue", "cramps", "back_pain"]),
            "sad",
            -0.65,
            1
        ),
        (
            today - timedelta(days=15),
            "Mid-Cycle Glow",
            "Felt absolutely wonderful and full of energy today. Did an empowering yoga flow and felt very calm, grounded and happy.",
            json.dumps([]),
            "happy",
            0.85,
            0
        ),
        (
            today - timedelta(days=5),
            "PMS & Low Energy",
            "Noticeable bloating and acne breakouts today. Feeling slightly anxious and irritated with work deadlines. Trying to take deep breaths.",
            json.dumps(["bloating", "acne"]),
            "anxious",
            -0.45,
            1
        )
    ]

    for j_date, j_title, j_content, j_syms, j_mood, j_sent, j_conf in journals:
        cursor.execute("""
            INSERT INTO journal_entries (user_id, entry_date, title, content, detected_symptoms, detected_mood, sentiment_score, tags_confirmed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, j_date.strftime("%Y-%m-%d"), j_title, j_content, j_syms, j_mood, j_sent, j_conf))

    conn.commit()
    conn.close()

    return jsonify({"message": "Realistic demo data seeded successfully with 3 historical cycles, symptoms, and NLP reflections!"})

# --- STATIC CLIENT FALLBACK (FOR BUILT PRODUCTION) ---

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_client(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({
        "status": "BLOOM Menstrual Health API is running",
        "version": "1.0.0",
        "documentation": "/api/cycle/status, /api/auth, /api/symptoms, /api/journal, /api/analytics"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

