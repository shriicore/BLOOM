import re
from typing import List, Dict, Any, Tuple

# Mapping of symptom categories to keyword triggers and regex patterns
SYMPTOM_PATTERNS = {
    "cramps": [
        r"\bcramp(s|ing)?\b",
        r"\bmenstrual cramp(s)?\b",
        r"\bdysmenorrhea\b",
        r"\babdominal pain\b",
        r"\bpelvic pain\b",
        r"\btummy ache\b",
        r"\buterine ache\b"
    ],
    "headache": [
        r"\bheadache(s)?\b",
        r"\bmigraine(s)?\b",
        r"\bthrobbing head\b",
        r"\bpounding head\b",
        r"\bhead ache(s)?\b"
    ],
    "fatigue": [
        r"\b(tired|exhausted|fatigue(d)?|drained|lethargic|sleepy|wiped out|sluggish)\b",
        r"\blow energy\b",
        r"\bno energy\b",
        r"\bweariness\b",
        r"\bcan barely stay awake\b"
    ],
    "bloating": [
        r"\bbloat(ed|ing)?\b",
        r"\bpuffy belly\b",
        r"\bwater retention\b",
        r"\bswollen stomach\b",
        r"\bbelly swell(ing)?\b",
        r"\bfeeling stuffed\b"
    ],
    "acne": [
        r"\bacne\b",
        r"\bpimple(s)?\b",
        r"\bbreakout(s)?\b",
        r"\bbreaking out\b",
        r"\bblemish(es)?\b",
        r"\bzit(s)?\b"
    ],
    "back_pain": [
        r"\bback(\s)?pain\b",
        r"\bbackache(s)?\b",
        r"\blower back pain\b",
        r"\bsore back\b",
        r"\bachy back\b",
        r"\baching lower back\b"
    ],
    "breast_tenderness": [
        r"\bbreast tenderness\b",
        r"\bsore breast(s)?\b",
        r"\btender breast(s)?\b",
        r"\bbreast pain\b",
        r"\bswollen breast(s)?\b",
        r"\bsensitive breast(s)?\b"
    ],
    "nausea": [
        r"\bnausea\b",
        r"\bnauseous\b",
        r"\bqueasy\b",
        r"\bsick to (my|the) stomach\b",
        r"\bupset stomach\b",
        r"\bvomit(ing)?\b"
    ],
    "mood_swings": [
        r"\bmood swing(s)?\b",
        r"\bmoody\b",
        r"\broller coaster of emotion(s)?\b",
        r"\bsnapping at\b",
        r"\bquick to anger\b"
    ],
    "insomnia": [
        r"\binsomnia\b",
        r"\bcan't sleep\b",
        r"\bcouldn't sleep\b",
        r"\btrouble sleeping\b",
        r"\bsleepless(ness)?\b",
        r"\btossing and turning\b"
    ]
}

MOOD_PATTERNS = {
    "happy": [
        r"\b(happy|joyful|cheerful|great|wonderful|fantastic|radiant|optimistic|blessed|good mood|delighted|thriving)\b"
    ],
    "calm": [
        r"\b(calm|peaceful|relaxed|tranquil|serene|grounded|balanced|content|zen|rested)\b"
    ],
    "anxious": [
        r"\b(anxious|anxiety|nervous|stressed|worried|tense|panic|overwhelmed|jittery|fretful|apprehensive)\b"
    ],
    "irritated": [
        r"\b(irritated|angry|frustrated|annoyed|grumpy|cranky|pissed|furious|mad|short-tempered)\b"
    ],
    "sad": [
        r"\b(sad|crying|depressed|down|gloomy|tearful|heartbroken|low mood|blue|unhappy|weeping)\b"
    ],
    "emotional": [
        r"\b(emotional|sensitive|vulnerable|weepy|fragile|tender-hearted)\b"
    ]
}

# Negation words that cancel a symptom match if they appear within 3 words before
NEGATION_WORDS = {"no", "not", "without", "zero", "free", "never", "hardly", "barely", "stopped", "lack of"}

# Simple sentiment lexicon weights
POSITIVE_WORDS = {
    "great": 1.0, "good": 0.6, "happy": 0.9, "wonderful": 1.0, "calm": 0.7, "peaceful": 0.8,
    "energetic": 0.8, "relaxed": 0.7, "better": 0.6, "healthy": 0.7, "loving": 0.8, "refreshed": 0.8,
    "productive": 0.7, "relieved": 0.7, "radiant": 0.9, "strong": 0.7, "fine": 0.3
}
NEGATIVE_WORDS = {
    "bad": -0.6, "pain": -0.8, "terrible": -1.0, "awful": -1.0, "cramps": -0.7, "headache": -0.7,
    "tired": -0.6, "exhausted": -0.8, "sad": -0.8, "depressed": -0.9, "anxious": -0.8, "stress": -0.7,
    "stressed": -0.7, "angry": -0.8, "bloated": -0.6, "nauseous": -0.8, "uncomfortable": -0.6, "hurts": -0.8,
    "miserable": -1.0, "irritated": -0.7, "low": -0.5
}

def is_negated(text: str, match_start: int) -> bool:
    """Checks if a negation token appears in the window preceding match_start."""
    preceding_window = text[max(0, match_start - 35):match_start].lower()
    words = re.findall(r"\b\w+\b", preceding_window)
    if not words:
        return False
    # Check the last 3 words before the match
    for w in words[-3:]:
        if w in NEGATION_WORDS:
            return True
    return False

def analyze_journal_text(content: str) -> Dict[str, Any]:
    """
    Performs NLP text analysis on a user journal entry:
    - Extracts non-negated symptoms
    - Identifies prominent mood
    - Calculates overall sentiment polarity (-1.0 to +1.0)
    - Generates user-facing suggestion prompt
    """
    if not content or not content.strip():
        return {
            "detected_symptoms": [],
            "detected_mood": None,
            "sentiment_score": 0.0,
            "sentiment_label": "neutral",
            "suggestion_message": "",
            "disclaimer": "Bloom's NLP insights are AI pattern suggestions to assist your personal tracking and are never a clinical diagnosis or medical advice."
        }

    lower_text = content.lower()
    detected_symptoms = []

    # 1. Symptom matching with negation avoidance
    for symptom, patterns in SYMPTOM_PATTERNS.items():
        found = False
        for pat in patterns:
            for match in re.finditer(pat, lower_text):
                if not is_negated(lower_text, match.start()):
                    detected_symptoms.append(symptom)
                    found = True
                    break
            if found:
                break

    # 2. Mood matching
    mood_counts: Dict[str, int] = {}
    for mood, patterns in MOOD_PATTERNS.items():
        count = 0
        for pat in patterns:
            for match in re.finditer(pat, lower_text):
                if not is_negated(lower_text, match.start()):
                    count += 1
        if count > 0:
            mood_counts[mood] = count

    primary_mood = None
    if mood_counts:
        primary_mood = max(mood_counts.items(), key=lambda x: x[1])[0]

    # 3. Sentiment score calculation
    words = re.findall(r"\b[a-z']+\b", lower_text)
    total_score = 0.0
    matched_sentiment_tokens = 0

    for i, word in enumerate(words):
        # Check if preceded by negation
        negated = False
        if i > 0 and words[i-1] in NEGATION_WORDS:
            negated = True
        elif i > 1 and words[i-2] in NEGATION_WORDS:
            negated = True

        if word in POSITIVE_WORDS:
            val = POSITIVE_WORDS[word]
            total_score += -val if negated else val
            matched_sentiment_tokens += 1
        elif word in NEGATIVE_WORDS:
            val = NEGATIVE_WORDS[word]
            total_score += -val if negated else val
            matched_sentiment_tokens += 1

    if matched_sentiment_tokens > 0:
        sentiment_score = round(max(-1.0, min(1.0, total_score / matched_sentiment_tokens)), 2)
    else:
        # Fallback heuristic based on detected mood
        if primary_mood in ["happy", "calm"]:
            sentiment_score = 0.5
        elif primary_mood in ["sad", "anxious", "irritated"]:
            sentiment_score = -0.5
        else:
            sentiment_score = 0.0

    if sentiment_score > 0.15:
        sentiment_label = "positive"
    elif sentiment_score < -0.15:
        sentiment_label = "negative"
    else:
        sentiment_label = "neutral"

    # 4. Generate user-facing suggestion prompt
    readable_symptoms = [s.replace("_", " ") for s in detected_symptoms]
    if readable_symptoms:
        if len(readable_symptoms) == 1:
            sym_str = readable_symptoms[0]
        elif len(readable_symptoms) == 2:
            sym_str = f"{readable_symptoms[0]} and {readable_symptoms[1]}"
        else:
            sym_str = f"{', '.join(readable_symptoms[:-1])}, and {readable_symptoms[-1]}"
        suggestion_message = f"Your journal suggests you may be experiencing {sym_str}. Would you like to add these to today's log?"
    elif primary_mood:
        suggestion_message = f"Your journal reflects a {primary_mood} mood today. Would you like to record this in your daily log?"
    else:
        suggestion_message = ""

    return {
        "detected_symptoms": detected_symptoms,
        "detected_mood": primary_mood,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        "suggestion_message": suggestion_message,
        "disclaimer": "Bloom's NLP insights are AI pattern suggestions to assist your personal tracking and are never a clinical diagnosis or medical advice."
    }

