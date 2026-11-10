import math
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str, "%Y-%m-%d").date()

def format_date(d: date) -> str:
    return d.strftime("%Y-%m-%d")

class CycleEngine:
    def __init__(self, baseline_cycle_length=28, baseline_period_duration=5, is_regular=True):
        self.baseline_cycle_length = max(20, min(45, baseline_cycle_length or 28))
        self.baseline_period_duration = max(2, min(10, baseline_period_duration or 5))
        self.is_regular = bool(is_regular)

    def calculate_personalized_metrics(self, period_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes historical period logs to calculate weighted average cycle length,
        period duration, cycle regularity, and standard deviation.
        """
        if not period_logs:
            return {
                "avg_cycle_length": self.baseline_cycle_length,
                "avg_period_duration": self.baseline_period_duration,
                "is_dynamically_calculated": False,
                "cycle_count": 0,
                "cycle_lengths": [],
                "std_dev": 0.0,
                "regularity_status": "Regular" if self.is_regular else "Irregular"
            }

        # Sort logs by start_date ascending
        sorted_logs = sorted(period_logs, key=lambda x: x["start_date"])

        # Calculate durations from start_date to end_date
        durations = []
        for log in sorted_logs:
            if log.get("start_date") and log.get("end_date"):
                try:
                    s = parse_date(log["start_date"])
                    e = parse_date(log["end_date"])
                    diff = (e - s).days + 1
                    if 2 <= diff <= 12:
                        durations.append(diff)
                except Exception:
                    pass

        # Calculate intervals between consecutive period start dates
        cycle_lengths = []
        for i in range(len(sorted_logs) - 1):
            try:
                s1 = parse_date(sorted_logs[i]["start_date"])
                s2 = parse_date(sorted_logs[i + 1]["start_date"])
                interval = (s2 - s1).days
                if 18 <= interval <= 55:  # Valid biological cycle range
                    cycle_lengths.append(interval)
            except Exception:
                pass

        if not cycle_lengths:
            avg_duration = round(sum(durations) / len(durations)) if durations else self.baseline_period_duration
            return {
                "avg_cycle_length": self.baseline_cycle_length,
                "avg_period_duration": avg_duration,
                "is_dynamically_calculated": False,
                "cycle_count": len(sorted_logs),
                "cycle_lengths": [],
                "std_dev": 0.0,
                "regularity_status": "Regular" if self.is_regular else "Irregular"
            }

        # Weighted average: giving more weight to recent cycles
        weights = [1.0 + (i * 0.3) for i in range(len(cycle_lengths))]
        weighted_sum = sum(l * w for l, w in zip(cycle_lengths, weights))
        avg_cycle_len = round(weighted_sum / sum(weights))

        # Standard deviation of cycle lengths
        mean_len = sum(cycle_lengths) / len(cycle_lengths)
        variance = sum((x - mean_len) ** 2 for x in cycle_lengths) / len(cycle_lengths)
        std_dev = round(math.sqrt(variance), 1)

        avg_duration = round(sum(durations) / len(durations)) if durations else self.baseline_period_duration

        regularity_status = "Very Regular" if std_dev <= 2.0 else ("Moderately Regular" if std_dev <= 4.5 else "Irregular")

        return {
            "avg_cycle_length": max(21, min(40, avg_cycle_len)),
            "avg_period_duration": max(2, min(9, avg_duration)),
            "is_dynamically_calculated": True,
            "cycle_count": len(sorted_logs),
            "cycle_lengths": cycle_lengths,
            "std_dev": std_dev,
            "regularity_status": regularity_status
        }

    def get_cycle_status(self, last_period_start_str: Optional[str], period_logs: List[Dict[str, Any]], target_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Computes the complete cycle status for a given target date (defaults to today).
        """
        today = target_date or date.today()
        metrics = self.calculate_personalized_metrics(period_logs)
        cycle_len = metrics["avg_cycle_length"]
        period_dur = metrics["avg_period_duration"]

        # Determine last period start
        last_start = None
        if last_period_start_str:
            try:
                last_start = parse_date(last_period_start_str)
            except Exception:
                pass

        # If period logs have a newer start date, use that
        if period_logs:
            latest_log_start = max(parse_date(l["start_date"]) for l in period_logs if l.get("start_date"))
            if not last_start or latest_log_start > last_start:
                last_start = latest_log_start

        if not last_start:
            # Default fallback if user has not yet entered any date
            last_start = today - timedelta(days=14)

        # Calculate days elapsed since last period start
        days_since_start = (today - last_start).days

        # Handle multi-cycle rollover if last recorded period was a while ago
        cycles_elapsed = days_since_start // cycle_len
        current_cycle_start = last_start + timedelta(days=cycles_elapsed * cycle_len)
        cycle_day = (today - current_cycle_start).days + 1

        next_period_date = current_cycle_start + timedelta(days=cycle_len)
        days_until_next = (next_period_date - today).days

        # Ovulation is typically 14 days before next period start
        ovulation_day_index = max(8, cycle_len - 14)
        ovulation_date = current_cycle_start + timedelta(days=ovulation_day_index - 1)

        # Fertile window: 5 days prior to ovulation through 1 day after ovulation
        fertile_start = ovulation_date - timedelta(days=5)
        fertile_end = ovulation_date + timedelta(days=1)

        # Cycle Phase Identification
        phase_info = self._get_phase_info(cycle_day, period_dur, ovulation_day_index, cycle_len)

        # Cycle progress percentage (1% to 100%)
        progress_pct = min(100, max(1, int((cycle_day / cycle_len) * 100)))

        # Fertile status for today
        is_fertile_today = (fertile_start <= today <= fertile_end)
        is_ovulation_today = (today == ovulation_date)

        return {
            "current_cycle_day": cycle_day,
            "total_cycle_length": cycle_len,
            "period_duration": period_dur,
            "last_period_date": format_date(current_cycle_start),
            "estimated_next_period": format_date(next_period_date),
            "days_until_next_period": days_until_next,
            "cycle_progress_percentage": progress_pct,
            "phase": phase_info["phase_name"],
            "phase_key": phase_info["phase_key"],
            "phase_description": phase_info["description"],
            "phase_hormones": phase_info["hormones"],
            "wellness_tips": phase_info["wellness_tips"],
            "estimated_ovulation_date": format_date(ovulation_date),
            "ovulation_day_number": ovulation_day_index,
            "fertile_window": {
                "start_date": format_date(fertile_start),
                "end_date": format_date(fertile_end),
                "is_active_today": is_fertile_today,
                "is_ovulation_today": is_ovulation_today
            },
            "metrics": metrics,
            "disclaimer": "All cycle, ovulation, and fertile window predictions are statistical estimates. They must never be used as medical advice or contraception."
        }

    def _get_phase_info(self, cycle_day: int, period_dur: int, ovulation_day: int, cycle_len: int) -> Dict[str, Any]:
        """Provides physiological and self-care descriptions for each menstrual phase."""
        if cycle_day <= period_dur:
            return {
                "phase_name": "Menstrual Phase",
                "phase_key": "menstrual",
                "description": "Your uterine lining is shedding. Energy may be lower as estrogen and progesterone dip.",
                "hormones": "Low Estrogen & Low Progesterone",
                "wellness_tips": [
                    "Prioritize restorative rest, warm herbal teas (chamomile or ginger), and gentle stretching.",
                    "Replenish iron levels with leafy greens, lentils, dark chocolate, or berries.",
                    "Apply a warm compress or heating pad for pelvic soothing if cramps arise."
                ]
            }
        elif cycle_day < (ovulation_day - 1):
            return {
                "phase_name": "Follicular Phase",
                "phase_key": "follicular",
                "description": "Follicle-stimulating hormone (FSH) triggers follicle growth. Estrogen is rising, boosting mental clarity and physical vitality.",
                "hormones": "Rising Estrogen, Low Progesterone",
                "wellness_tips": [
                    "A great window for creative brainstorming, starting new projects, and higher intensity workouts.",
                    "Enjoy vibrant, probiotic-rich foods (yogurt, kimchi, fresh greens) to support estrogen metabolism.",
                    "Harness your natural surge in focus and stamina."
                ]
            }
        elif (ovulation_day - 1) <= cycle_day <= (ovulation_day + 1):
            return {
                "phase_name": "Ovulatory Phase",
                "phase_key": "ovulation",
                "description": "An LH surge prompts the release of an egg. Estrogen peaks, bringing elevated confidence, radiance, and peak fertility.",
                "hormones": "Peak Estrogen & LH Surge",
                "wellness_tips": [
                    "Peak communication and social energy—ideal for presentations or connecting with friends.",
                    "Stay well hydrated with electrolytes and incorporate fiber-rich foods.",
                    "Tune in to subtle ovulation cues like mild unilateral twinges or heightened smell sensitivity."
                ]
            }
        else:
            return {
                "phase_name": "Luteal Phase",
                "phase_key": "luteal",
                "description": "Progesterone takes the lead to nourish the uterine lining. Metabolism speeds up, and body temperature slightly rises.",
                "hormones": "High Progesterone, Declining Estrogen",
                "wellness_tips": [
                    "Opt for complex carbs (sweet potatoes, oats) to stabilize blood sugar and balance cravings.",
                    "Incorporate magnesium and vitamin B6 to ease PMS symptoms, tension, or mood fluctuations.",
                    "Shift toward grounding exercises like pilates, yoga, or calming nature walks."
                ]
            }

    def generate_calendar_days(
        self,
        year: int,
        month: int,
        period_logs: List[Dict[str, Any]],
        symptom_logs: List[Dict[str, Any]],
        last_period_date_str: Optional[str]
    ) -> List[Dict[str, Any]]:
        """
        Generates complete daily calendar items for a given year and month,
        merging confirmed logged period days, logged symptoms, predicted periods,
        predicted fertile window, and ovulation day.
        """
        metrics = self.calculate_personalized_metrics(period_logs)
        cycle_len = metrics["avg_cycle_length"]
        period_dur = metrics["avg_period_duration"]

        first_day_of_month = date(year, month, 1)
        if month == 12:
            last_day_of_month = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day_of_month = date(year, month + 1, 1) - timedelta(days=1)

        # Index user period logs by date
        # Note: If a log has a start_date and end_date, expand into range
        logged_period_map: Dict[str, Dict[str, Any]] = {}
        for pl in period_logs:
            try:
                s = parse_date(pl["start_date"])
                e = parse_date(pl["end_date"]) if pl.get("end_date") else s + timedelta(days=period_dur - 1)
                curr = s
                day_num = 1
                while curr <= e:
                    logged_period_map[format_date(curr)] = {
                        "is_logged_period": True,
                        "flow": pl.get("flow", "medium"),
                        "period_log_id": pl.get("id"),
                        "period_day_index": day_num,
                        "notes": pl.get("notes")
                    }
                    curr += timedelta(days=1)
                    day_num += 1
            except Exception:
                pass

        # Index symptom logs by date
        symptom_map = {sl["log_date"]: sl for sl in symptom_logs if sl.get("log_date")}

        # Determine reference cycle start for projections
        latest_start = None
        if period_logs:
            latest_start = max(parse_date(l["start_date"]) for l in period_logs if l.get("start_date"))
        elif last_period_date_str:
            try:
                latest_start = parse_date(last_period_date_str)
            except Exception:
                pass

        if not latest_start:
            latest_start = date.today() - timedelta(days=14)

        # Generate cycle projection start dates covering ±1 year around current view
        projection_starts = []
        # Backwards
        curr_p = latest_start
        for _ in range(12):
            curr_p = curr_p - timedelta(days=cycle_len)
            projection_starts.append(curr_p)
        # Present and forwards
        curr_p = latest_start
        for _ in range(15):
            projection_starts.append(curr_p)
            curr_p = curr_p + timedelta(days=cycle_len)

        # Map predictions for days
        predicted_period_set = set()
        predicted_fertile_set = set()
        predicted_ovulation_set = set()

        for c_start in projection_starts:
            # Predicted period days
            for i in range(period_dur):
                p_day = c_start + timedelta(days=i)
                predicted_period_set.add(format_date(p_day))
            
            # Predicted ovulation
            ov_idx = max(8, cycle_len - 14)
            ov_day = c_start + timedelta(days=ov_idx - 1)
            predicted_ovulation_set.add(format_date(ov_day))

            # Predicted fertile window
            f_start = ov_day - timedelta(days=5)
            f_end = ov_day + timedelta(days=1)
            f_curr = f_start
            while f_curr <= f_end:
                predicted_fertile_set.add(format_date(f_curr))
                f_curr += timedelta(days=1)

        # Build day items
        days_list = []
        curr = first_day_of_month
        today_str = format_date(date.today())

        while curr <= last_day_of_month:
            d_str = format_date(curr)
            is_today = (d_str == today_str)

            logged_p = logged_period_map.get(d_str)
            symptom_item = symptom_map.get(d_str)

            is_predicted_period = (d_str in predicted_period_set) and not bool(logged_p)
            is_predicted_ovulation = (d_str in predicted_ovulation_set)
            is_predicted_fertile = (d_str in predicted_fertile_set) and not is_predicted_ovulation

            days_list.append({
                "date": d_str,
                "day": curr.day,
                "weekday": curr.weekday(),  # 0=Mon, 6=Sun
                "is_today": is_today,
                "is_logged_period": bool(logged_p),
                "logged_flow": logged_p.get("flow") if logged_p else (symptom_item.get("flow") if symptom_item else None),
                "period_day_index": logged_p.get("period_day_index") if logged_p else None,
                "period_log_id": logged_p.get("period_log_id") if logged_p else None,
                "is_predicted_period": is_predicted_period,
                "is_predicted_fertile": is_predicted_fertile,
                "is_predicted_ovulation": is_predicted_ovulation,
                "has_symptoms": bool(symptom_item and (symptom_item.get("symptoms") != "[]" or symptom_item.get("mood"))),
                "symptom_details": symptom_item
            })
            curr += timedelta(days=1)

        return days_list

