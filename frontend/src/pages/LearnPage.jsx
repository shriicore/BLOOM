import React from 'react';
import {
  GraduationCap,
  Droplet,
  Sparkles,
  Sun,
  Moon,
  Heart,
  ShieldAlert,
  Apple,
  Dumbbell,
  Brain,
  Coffee,
  CheckCircle2
} from 'lucide-react';

export default function LearnPage() {
  const phases = [
    {
      id: 'menstrual',
      title: '1. Menstrual Phase (Days 1–5)',
      subtitle: 'The Reset & Cleansing',
      icon: Droplet,
      color: 'from-bloom-deep to-bloom-primary',
      hormones: 'Low Estrogen & Progesterone',
      description: 'Your uterine lining sheds as pregnancy has not occurred. Hormone levels drop to their lowest point, prompting your body to rest and renew.',
      symptoms: ['Pelvic cramps (prostaglandins)', 'Fatigue and low stamina', 'Lower back tightness', 'Need for introspection'],
      nutrition: 'Iron-rich foods (spinach, lentils, dark chocolate), bone broths, warming herbal teas (ginger, raspberry leaf), and adequate hydration.',
      movement: 'Gentle yin yoga, walking, restorative stretching, and plenty of restorative sleep.'
    },
    {
      id: 'follicular',
      title: '2. Follicular Phase (Days 6–13)',
      subtitle: 'The Rebirth & Energy Rise',
      icon: Sparkles,
      color: 'from-bloom-primary to-rose-400',
      hormones: 'FSH Stimulates Follicles; Estrogen Climbs',
      description: 'The brain releases Follicle-Stimulating Hormone (FSH), prompting ovarian follicles to develop. Rising estrogen thickens the endometrial lining and elevates vitality.',
      symptoms: ['Surging mental clarity', 'Vibrant skin glow', 'Higher social curiosity', 'Increased stamina'],
      nutrition: 'Fermented foods (kimchi, kefir) to aid estrogen metabolism, fresh vibrant salads, lean proteins, and complex seeds (pumpkin & flax).',
      movement: 'High-intensity interval training (HIIT), strength training, running, and tackling ambitious work or creative endeavors.'
    },
    {
      id: 'ovulation',
      title: '3. Ovulatory Phase (Days 14–16)',
      subtitle: 'The Climax & Peak Fertility',
      icon: Sun,
      color: 'from-amber-400 to-rose-400',
      hormones: 'LH Surge & Peak Estrogen Levels',
      description: 'A sharp surge in Luteinizing Hormone (LH) triggers the release of a mature egg into the fallopian tube. The egg survives for 12–24 hours, but sperm can survive for up to 5 days.',
      symptoms: ['Peak sex drive', 'Mild one-sided twinges (Mittelschmerz)', 'Egg-white cervical fluid', 'Elevated confidence'],
      nutrition: 'Antioxidant-rich berries, leafy cruciferous veggies, glutathione-supporting foods, and plenty of electrolyte water.',
      movement: 'Group fitness, dance, intense circuits, and key networking or public speaking events.'
    },
    {
      id: 'luteal',
      title: '4. Luteal Phase (Days 17–28)',
      subtitle: 'The Nesting & Progesterone Reign',
      icon: Moon,
      color: 'from-bloom-accent to-bloom-deep',
      hormones: 'High Progesterone; Secondary Estrogen Rise',
      description: 'The ruptured follicle transforms into the corpus luteum, pumping out progesterone to support a potential pregnancy. If unfertilized, progesterone drops precipitously, initiating PMS.',
      symptoms: ['Bloating and fluid retention', 'Breast tenderness', 'Mood sensitivities & irritability', 'Food cravings (especially sweet & salty)'],
      nutrition: 'Magnesium-rich foods (roasted pumpkin seeds, cacao, avocados), vitamin B6 (bananas, sweet potatoes), and fiber to prevent constipation.',
      movement: 'Pilates, moderate resistance training, slow flow yoga, and establishing comforting boundary routines.'
    }
  ];

  const commonSymptoms = [
    {
      name: 'Menstrual Cramps (Dysmenorrhea)',
      cause: 'Caused by uterine muscle contractions induced by inflammatory prostaglandins.',
      remedy: 'Heat therapy (heating pad/warm bath), magnesium glycinate supplements, gentle pelvic stretches, and anti-inflammatory teas like chamomile.'
    },
    {
      name: 'Premenstrual Bloating',
      cause: 'Fluctuations in progesterone and estrogen alter fluid balance and slow digestive transit.',
      remedy: 'Reduce high-sodium foods, drink dandelion root tea, stay hydrated with fresh water, and eat potassium-rich bananas and avocados.'
    },
    {
      name: 'Hormonal Headaches & Migraines',
      cause: 'Triggered by rapid drops in estrogen right before menstruation or during ovulation.',
      remedy: 'Maintain regular blood sugar with balanced meals, prioritize magnesium, rest in a dark quiet room, and practice cold compress application.'
    },
    {
      name: 'Mood Swings & Irritability',
      cause: 'Shifts in estrogen impact neurotransmitters like serotonin and dopamine.',
      remedy: 'Daily 20-minute sunlight exposure, journaling emotions, mindful breathwork, and reducing excess caffeine.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-bloom-darkcard p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Educational Wellness & Science</span>
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
          Menstrual Cycle Biology & Self-Care
        </h2>
        <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
          Demystifying your hormonal shifts across all four phases so you can live in harmony with your body.
        </p>

        {/* Top Disclaimer */}
        <div className="mt-4 p-3.5 rounded-2xl bg-bloom-bg/80 dark:bg-bloom-darkbg border border-bloom-border/40 dark:border-bloom-darkborder/40 flex items-center gap-2.5 text-xs text-bloom-subtle dark:text-bloom-darkmuted">
          <ShieldAlert className="w-4 h-4 text-bloom-primary flex-shrink-0" />
          <span>
            <strong>Medical Disclaimer:</strong> This educational guide is designed for informational and self-awareness purposes only. It is not medical advice, diagnosis, or treatment. Always consult a licensed healthcare professional for persistent, severe pain or gynecological concerns.
          </span>
        </div>
      </div>

      {/* 4 Phases Detailed Cards */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext px-2">
          The Four Infradian Rhythm Phases
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {phases.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-4 hover:shadow-bloom-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
                        {p.title}
                      </h4>
                      <span className="text-xs font-semibold text-bloom-deep dark:text-pink-300">
                        {p.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed">
                  <p className="mb-2 font-medium text-bloom-dark dark:text-bloom-darktext">
                    <strong>Hormones:</strong> {p.hormones}
                  </p>
                  <p>{p.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-bloom-border/40 dark:border-bloom-darkborder/40 text-xs">
                  <div>
                    <span className="font-bold text-bloom-dark dark:text-bloom-darktext flex items-center gap-1.5 mb-1">
                      <Apple className="w-3.5 h-3.5 text-bloom-primary" /> Nourishment:
                    </span>
                    <p className="text-bloom-subtle dark:text-bloom-darkmuted pl-5">{p.nutrition}</p>
                  </div>

                  <div>
                    <span className="font-bold text-bloom-dark dark:text-bloom-darktext flex items-center gap-1.5 mb-1">
                      <Dumbbell className="w-3.5 h-3.5 text-bloom-deep" /> Movement & Energy:
                    </span>
                    <p className="text-bloom-subtle dark:text-bloom-darkmuted pl-5">{p.movement}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Symptoms & Holistic Remedies */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-6">
        <div>
          <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
            Understanding Common Menstrual Symptoms
          </h3>
          <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
            Why they happen biologically, and gentle evidence-based ways to find relief.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonSymptoms.map((sym, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border/60 dark:border-bloom-darkborder space-y-2 text-xs"
            >
              <h4 className="font-bold text-bloom-dark dark:text-bloom-darktext text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bloom-primary" />
                <span>{sym.name}</span>
              </h4>
              <p className="text-bloom-subtle dark:text-bloom-darkmuted">
                <strong>Why it happens:</strong> {sym.cause}
              </p>
              <p className="text-bloom-deep dark:text-pink-300 font-medium">
                <strong>Self-Care:</strong> {sym.remedy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

