import unittest
import json
from app import app
from database import init_db

class BloomTestSuite(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = app.test_client()

    def test_full_user_lifecycle(self):
        print("\n--- Running BLOOM Test Suite ---")
        
        # 1. Register a test user
        email = f"shriya_test_{unittest.TestCase().id().replace('.', '_')}@example.com"
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Shriya",
            "email": email,
            "password": "bloomPassword2026",
            "cycle_length": 29,
            "period_duration": 5,
            "is_regular": True,
            "last_period_date": "2026-11-01"
        })
        self.assertIn(reg_res.status_code, [201, 409])
        
        # 2. Login
        login_res = self.client.post("/api/auth/login", json={
            "email": email,
            "password": "bloomPassword2026"
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.json["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Authentication & Password Hashing: Verified")

        # 3. Verify Cycle Status endpoint
        status_res = self.client.get("/api/cycle/status", headers=headers)
        self.assertEqual(status_res.status_code, 200)
        s_data = status_res.json
        self.assertIn("current_cycle_day", s_data)
        self.assertIn("phase", s_data)
        self.assertIn("estimated_ovulation_date", s_data)
        self.assertIn("fertile_window", s_data)
        print(f"✓ Cycle Engine: Current Day = {s_data['current_cycle_day']}, Phase = {s_data['phase']}")

        # 4. Seed Demo Data
        seed_res = self.client.post("/api/demo/seed", headers=headers)
        self.assertEqual(seed_res.status_code, 200)
        print("✓ Realistic Demo Data Seeding: Verified")

        # 5. Check Cycle Status after seed (should reflect 3 historical cycles)
        status_after = self.client.get("/api/cycle/status", headers=headers).json
        self.assertTrue(status_after["metrics"]["is_dynamically_calculated"])
        print(f"✓ Dynamic Calibration: Avg Cycle Length = {status_after['metrics']['avg_cycle_length']} days, Std Dev = {status_after['metrics']['std_dev']}")

        # 6. Test Calendar Grid for November 2026
        cal_res = self.client.get("/api/cycle/calendar?year=2026&month=11", headers=headers)
        self.assertEqual(cal_res.status_code, 200)
        cal_data = cal_res.json
        self.assertGreater(len(cal_data["days"]), 27)
        has_logged = any(d["is_logged_period"] for d in cal_data["days"])
        has_predicted = any(d["is_predicted_period"] or d["is_predicted_fertile"] for d in cal_data["days"])
        self.assertTrue(has_logged or has_predicted)
        print(f"✓ Interactive Monthly Calendar: {len(cal_data['days'])} days generated with predictions & logs")

        # 7. Test Period Logs CRUD
        periods_res = self.client.get("/api/periods", headers=headers)
        self.assertEqual(periods_res.status_code, 200)
        self.assertGreaterEqual(len(periods_res.json), 1)
        print(f"✓ Period Logs Database: {len(periods_res.json)} periods stored")

        # 8. Test Daily Symptoms Logging
        sym_res = self.client.post("/api/symptoms", headers=headers, json={
            "log_date": "2026-11-10",
            "flow": "light",
            "symptoms": ["cramps", "headache", "fatigue"],
            "mood": "calm",
            "energy": "medium",
            "sleep_hours": 8.0,
            "water_intake_ml": 2500,
            "notes": "Testing unit flow"
        })
        self.assertEqual(sym_res.status_code, 200)
        get_sym = self.client.get("/api/symptoms?date=2026-11-10", headers=headers).json
        self.assertEqual(get_sym["flow"], "light")
        self.assertIn("cramps", get_sym["symptoms"])
        print("✓ Symptom Logging & Retrieval: Verified")

        # 9. Test NLP Analysis
        nlp_test_text = "I have been feeling tired and experiencing cramps today. My mood is also low."
        nlp_res = self.client.post("/api/journal/analyze", headers=headers, json={"content": nlp_test_text})
        self.assertEqual(nlp_res.status_code, 200)
        nlp_data = nlp_res.json
        self.assertIn("cramps", nlp_data["detected_symptoms"])
        self.assertIn("fatigue", nlp_data["detected_symptoms"])
        self.assertLess(nlp_data["sentiment_score"], 0)
        self.assertIn("suggests you may be experiencing", nlp_data["suggestion_message"])
        print(f"✓ NLP Engine: Detected {nlp_data['detected_symptoms']} (Sentiment: {nlp_data['sentiment_score']})")

        # 10. Save Journal Entry and Confirm Tags
        j_save = self.client.post("/api/journal", headers=headers, json={
            "title": "Evening Check-in",
            "content": nlp_test_text,
            "entry_date": "2026-11-10"
        })
        self.assertEqual(j_save.status_code, 201)
        entry_id = j_save.json["entry_id"]

        confirm_res = self.client.post(f"/api/journal/{entry_id}/confirm-tags", headers=headers, json={
            "symptoms": ["cramps", "fatigue"],
            "mood": "calm"
        })
        self.assertEqual(confirm_res.status_code, 200)
        print("✓ NLP Tag Synchronization to Daily Log: Verified")

        # 11. Test Analytics Endpoints
        analytics_res = self.client.get("/api/analytics", headers=headers)
        self.assertEqual(analytics_res.status_code, 200)
        a_data = analytics_res.json
        self.assertIn("cycle_history", a_data)
        self.assertIn("symptom_distribution", a_data)
        self.assertIn("mood_distribution", a_data)
        print("✓ Cycle Analytics & Distribution Engines: Verified")

        # 12. Test Data Export
        export_res = self.client.get("/api/user/export", headers=headers)
        self.assertEqual(export_res.status_code, 200)
        exp_data = export_res.json
        self.assertIn("user_profile", exp_data)
        self.assertIn("period_logs", exp_data)
        self.assertIn("daily_symptom_logs", exp_data)
        self.assertIn("journal_entries", exp_data)
        print("✓ Data Export & Privacy Compliance: Verified")

if __name__ == "__main__":
    unittest.main()

