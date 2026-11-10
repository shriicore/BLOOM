# BLOOM — Menstrual Cycle Prediction & Biological Logic

## 1. Overview
Bloom uses a dynamic mathematical model that bridges baseline clinical averages with personal historical cycle variance. Unlike basic apps that assume a rigid 28-day cycle, Bloom dynamically updates personalized parameters as the user logs consecutive periods over time.

---

## 2. Dynamic Cycle Length Calculation

### Baseline State
When a new user registers or completes onboarding:
$$\text{Cycle Length} = L_{\text{baseline}} \quad (\text{default: } 28 \text{ days, configurable } 20-45)$$
$$\text{Period Duration} = D_{\text{baseline}} \quad (\text{default: } 5 \text{ days, configurable } 2-10)$$

### Historical Adaptation ($\ge 2$ Recorded Cycles)
When consecutive period start dates $S_1, S_2, \dots, S_n$ are recorded:
$$\Delta_i = S_{i+1} - S_i \quad (\text{days})$$

Filtered for biologically viable human menstrual lengths: $18 \le \Delta_i \le 55$.

A **linear recency weighting scheme** is applied to prioritize recent cycle trends over distant history:
$$w_i = 1.0 + (i \times 0.3)$$
$$L_{\text{dynamic}} = \text{round}\left( \frac{\sum_{i=1}^{m} \Delta_i \cdot w_i}{\sum_{i=1}^{m} w_i} \right)$$

### Cycle Regularity & Variance
Cycle length standard deviation ($\sigma$) measures predictability:
$$\mu = \frac{1}{m} \sum_{i=1}^{m} \Delta_i$$
$$\sigma = \sqrt{ \frac{1}{m} \sum_{i=1}^{m} (\Delta_i - \mu)^2 }$$

- **Very Regular**: $\sigma \le 2.0 \text{ days}$
- **Moderately Regular**: $2.0 < \sigma \le 4.5 \text{ days}$
- **Irregular**: $\sigma > 4.5 \text{ days}$ (accompanied by helpful regularity notes)

---

## 3. Current Cycle Day & Next Period Countdown

Given the latest confirmed period start date $S_{\text{latest}}$ and target date $T$ (today):
$$\text{Elapsed Days} = (T - S_{\text{latest}})$$
$$\text{Cycles Elapsed} = \lfloor \text{Elapsed Days} / L \rfloor$$
$$S_{\text{current}} = S_{\text{latest}} + (\text{Cycles Elapsed} \times L)$$
$$\text{Cycle Day} = (T - S_{\text{current}}) + 1$$

$$\text{Next Period Date} = S_{\text{current}} + L$$
$$\text{Days Until Next} = \text{Next Period Date} - T$$

---

## 4. Infradian Phase Classification

The menstrual cycle is subdivided into four endocrinologically distinct phases based on cycle day ($C_d$):

```
Day 1                       Day D_avg             Day O-1   Day O   Day O+1               Day L
|--------- MENSTRUAL --------|------ FOLLICULAR -----|----- OVULATION -----|-------- LUTEAL --------|
```

1. **Menstrual Phase ($1 \le C_d \le D_{\text{avg}}$)**
   - **Endocrinology:** Low systemic estrogen and progesterone. The functional endometrium sheds.
   - **Self-Care:** Warm teas, iron replenishing foods, restorative sleep, gentle pelvic stretching.

2. **Follicular Phase ($D_{\text{avg}} < C_d < O - 1$)**
   - **Endocrinology:** Pituitary FSH stimulates follicle growth. Granulosa cells steadily secrete estrogen.
   - **Self-Care:** High energy, creative brainstorming, moderate to high intensity workouts.

3. **Ovulatory Phase ($O - 1 \le C_d \le O + 1$)**
   - **Endocrinology:** Sharp LH surge triggers follicle rupture and egg release. Estrogen peaks.
   - **Self-Care:** Peak social and verbal stamina, electrolyte hydration, mindful body tracking.

4. **Luteal Phase ($O + 2 \le C_d \le L$)**
   - **Endocrinology:** Corpus luteum secretes progesterone to vascularize the endometrium. Progesterone drops precipitously if unfertilized.
   - **Self-Care:** Magnesium glycinate, complex carbs, grounding pilates/yoga, PMS symptom tracking.

---

## 5. Fertile Window & Ovulation Estimation

### Ovulation Timing
In mammalian endocrinology, the luteal phase duration is relatively stable (approximately 14 days) across varied cycle lengths:
$$O_{\text{day}} = \max(8, L - 14)$$
$$\text{Ovulation Date} = S_{\text{current}} + (O_{\text{day}} - 1)$$

### Fertile Window
Sperm cells can remain viable in cervical crypts for up to 5 days, while the released ovum remains viable for approximately 24 hours. The clinical fertile window is therefore modeled as a 6-day window:
$$\text{Fertile Window} = [\text{Ovulation Date} - 5 \text{ days}, \text{ Ovulation Date} + 1 \text{ day}]$$

> **Important Clinical & Ethical Disclaimer:** All cycle, ovulation, and fertility calculations are statistical estimates. They must **never** be used for natural contraception or medical diagnosis.

