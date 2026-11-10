# BLOOM — Natural Language Processing (NLP) Architecture

## 1. Purpose & Design Principles
The Bloom NLP Engine transforms unstructured daily journal writing into structured, actionable wellness data without imposing cognitive burden on the user.

A critical design requirement is **responsible AI**:
- Suggestions are strictly presented as non-clinical aids.
- Negations (e.g. *"no cramps today"*, *"not feeling tired"*) must never be misclassified as active symptoms.
- The user maintains complete autonomy to confirm or reject suggestions before anything is added to their permanent record.

---

## 2. Text Processing Pipeline

```
Raw Journal Text
      │
      ▼
Regex Tokenization & Case Normalization
      │
      ├──> Negation Scope Resolution (Preceding 35-character Window)
      │       └── Cancels false-positive matches (e.g. "without headache")
      │
      ├──> Domain-Specific Symptom Lexicon Match
      │       └── cramps, fatigue, headache, bloating, acne, back_pain, etc.
      │
      ├──> Emotional & Mood Extraction
      │       └── happy, calm, anxious, irritated, sad, emotional
      │
      └──> Polarity & Sentiment Lexicon Engine (-1.0 to +1.0)
              │
              ▼
Structured JSON Analysis & Suggestion Generator
```

---

## 3. Negation Scope Handling

A common failure mode of basic keyword search is misinterpreting negative statements (e.g., *"Glad I have no cramps today"* being tagged with Cramps).

Bloom implements a backward-looking window parser:
```python
def is_negated(text: str, match_start: int) -> bool:
    preceding_window = text[max(0, match_start - 35):match_start].lower()
    words = re.findall(r"\b\w+\b", preceding_window)
    # Checks the 3 tokens immediately preceding the symptom match
    for w in words[-3:]:
        if w in {"no", "not", "without", "zero", "free", "never", "hardly", "barely", "stopped", "lack of"}:
            return True
    return False
```

If a negation token appears in the preceding window, the candidate symptom is ignored.

---

## 4. Sentiment Polarity Lexicon

Bloom calculates an emotional polarity score $S \in [-1.0, +1.0]$:
$$S = \text{clamp}\left( \frac{\sum_{t \in T} w_t \cdot \text{sign}(t)}{|T|}, -1.0, 1.0 \right)$$
where each affective token is weighted according to valence:
- Positive tokens: `happy` (+0.9), `great` (+1.0), `calm` (+0.7), `radiant` (+0.9), `refreshed` (+0.8).
- Negative tokens: `cramps` (-0.7), `pain` (-0.8), `exhausted` (-0.8), `terrible` (-1.0), `anxious` (-0.8).
- Negation inversion: If a positive token is preceded by negation (e.g. *"not feeling good"*), its polarity sign is inverted.

Classification:
- $S > +0.15 \implies$ **Positive** (Light & uplifting)
- $S < -0.15 \implies$ **Challenging** (Reflective of physical discomfort or stress)
- Otherwise $\implies$ **Neutral** (Grounded reflection)

---

## 5. User Confirmation & Data Synchronization

Upon saving a journal entry:
1. The backend responds with `suggestion_message`:
   > *"Your journal suggests you may be experiencing fatigue and cramps. Would you like to add these to today's log?"*
2. An interactive floating banner appears with **"Yes, Add to Today's Log"** and **"Dismiss"**.
3. If confirmed, `POST /api/journal/<id>/confirm-tags` merges the extracted tags into the SQLite `daily_symptom_logs` table for that entry date, ensuring seamless synchronization across the Dashboard and Analytics charts.

