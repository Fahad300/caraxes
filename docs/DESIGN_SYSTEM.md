# Design System — Caraxes

Two layers, kept deliberately separate: **brand identity** (name, color, icon —
shown in chrome, splash, onboarding) and **functional UI** (the in-session
workout screen). They don't compete because they don't appear in the same
view at the same time.

---

## 1. Brand Identity

### Name and positioning
**Caraxes** — the Blood Wyrm. Defined by combat record, not size or
pedigree: the dragon nobody remembers for being the biggest, remembered for
what he actually fought through. That's the right metaphor for this app —
it's not a leaderboard or a wellness-brand aesthetic, it's a record of work
actually done.

Tone: disciplined, a little aggressive, unsentimental. Not a wellness app.
Not gamified with badges/confetti. Progress is earned, shown plainly.

### Brand color

| Token | Hex | Use |
|---|---|---|
| `--brand-red` | `#9F1D24` | Primary brand accent — wordmark, icon, primary CTA in chrome/onboarding |
| `--brand-red-deep` | `#5C0F14` | Dark backgrounds, pressed states, brand gradients |
| `--brand-red-bright` | `#E23744` | Sparse highlight only — active tab indicator, a single emphasis moment. Never a full fill; this one burns out fast if overused |
| `--brand-black` | `#0C0A09` | Primary dark background — "black as night" |

**This red is brand chrome only** — navigation bar, app icon, splash screen,
empty states, section headers. It does **not** appear inside an active
workout session. Inside a session, the functional phase-color system
(Section 2) governs everything, including the primary action buttons. The
two systems never occupy the same screen at the same time, so they never
have to compete.

### Why these colors

**The red is literal, not decorative.** Caraxes is described in the source
material as blood-red — that's where "the Blood Wyrm" comes from. `--brand-red`
isn't a generic accent color picked because red looks strong; it's the
dragon's actual color. The three-tone system reflects the word "blood" at
different states rather than three unrelated reds:

- `--brand-red-deep` — blood dried and settled. Used for backgrounds and
  weight-bearing surfaces, because it represents accumulated history — every
  session logged, not just today's.
- `--brand-red` — the resting mid-tone. What you'd paint a wordmark or a
  shield in. The default.
- `--brand-red-bright` — blood fresh, in the moment. Used for exactly one
  thing at a time (an active tab, a single highlight) and never as a fill,
  because a flash of intensity is a moment, not a steady state. Overuse it
  and it stops meaning anything.

**The black is not literally Caraxes's color** — he's red, not black (that's
Balerion). It's a deliberate contrast choice instead: blood only reads as
blood against something darker than itself. A near-black field is what lets
the red actually do its job — one strong signal against a dark ground, the
same reason "the Blood Wyrm" as a name works at all. This is the one place
the palette prioritizes function over lore accuracy, and that's stated here
on purpose so it doesn't get "corrected" into a literal color later.

### App icon — direction, not a literal dragon

Do not render Caraxes as a creature. A recognizable dragon illustration
reads as derivative of the show's actual character design — the name is a
borrowed word, the icon should be an original mark, not a rendering.

Three workable directions:

1. **Serpentine C-mark** — the letter C (Caraxes' initial) rendered as a
   single continuous curved stroke that whips at one end like a tail —
   abstract enough to stand alone, specific enough to feel intentional.
2. **Single scale motif** — one large, geometric scale shape (a rounded
   diamond/lens form), blood-red on black, as a minimal icon mark — evokes
   dragon without depicting one.
3. **Ember/flame mark** — a single angular flame shape, more fire than
   creature, in the brand red — leans into "forged through fire" rather
   than the animal itself.

Recommended: (1) — it's the most literally tied to the name (a C), the most
original (nothing else looks like it), and scales best down to a small
icon size.

### Splash / empty states
Black background (`--brand-black`), red wordmark or mark, no gradient
animation, no loading spinner choreography. Consistent with "no decorative
motion" from the functional system below — the brand should feel exactly as
unshowy as the utility it wraps.

---

## 2. Functional UI (in-session screens)

This is what the person actually looks at mid-set, under gym lighting, with
sweaty hands. It stays neutral and legible — brand red does not intrude here.

### Base colors

**Light:**
| Token | Hex |
|---|---|
| background | `#FAFAF9` |
| elevated (cards) | `#FFFFFF` |
| border | `#E7E5E4` |
| text | `#1C1917` |
| text-dim | `#78716C` |
| text-faint | `#A8A29E` |

**Dark (primary/default theme — fits the brand better than light does):**
| Token | Hex |
|---|---|
| background | `#17140F` |
| elevated (cards) | `#221E18` |
| border | `#35302A` |
| text | `#F5F2EC` |
| text-dim | `#B0A99E` |
| text-faint | `#7D766C` |

Primary action color inside a session (Start Workout, Complete Set when no
phase color applies, stopwatch): inverted near-black/near-white — not brand
red, not a phase color. Stays out of both systems' way.

### Phase colors (fixed, left-edge card stripe — never a full fill)

| Phase | Color | Hex |
|---|---|---|
| Warm-up | grey | `#78716C` |
| Dynamic Stretch | teal | `#0891B2` |
| Activation | green | `#65A30D` |
| Compound | indigo | `#4338CA` |
| Accessory | violet | `#6D28D9` |
| Isolation | purple | `#9333EA` |
| Cardio Finisher | orange | `#EA580C` |
| Post-Stretch | mint | `#0D9488` |

> `Accessory` is an addition beyond the original 7-phase list, needed
> because the program data (PRD Section 6.3) treats accessory work as a
> distinct rep-range/rest bucket between compound and isolation. It sits in
> the palette between indigo and purple for the same reason it sits between
> them in training intensity.

**Why none of these are red.** This is deliberate, not an oversight. Brand
identity is aspirational — what the app represents. Phase colors are purely
functional — they exist to be instantly told apart from each other and from
the brand chrome, not to feel thematically "on brand." If Compound used a red,
it would visually compete with `--brand-red` every time it appeared, and a
user's eye would read it as "the important brand color" rather than "this is
a heavy lift." Keeping phase colors in a completely different family (blue,
green, purple, teal, orange, grey) is what lets both systems work without
diluting each other.

The individual picks lean on ordinary color psychology, not lore: compound
gets the deepest, most serious color (indigo) because it's the foundational
work of the session; isolation gets purple, adjacent but secondary; cardio
gets orange — the closest thing to "heat" in the palette, but far enough
from brand red that it never gets mistaken for it; activation is green (go);
stretch/post-stretch are teal/mint (cooling, opening, recovering); warm-up is
neutral grey — you're not "in the work" yet.

### Typography
System font stack only — no external font loading, this needs to work
reliably on gym wifi. Weight carries hierarchy: 700–800 for live numbers
(tabular figures, no jitter), 600 for names/labels, 400 for meta text.

The wordmark/logo is the one exception — a single static asset (app icon,
splash), not a loaded webfont, so it can use a heavier custom weight/shape
without adding a runtime dependency.

### Layout
- Mobile-first, single column, 44×44pt minimum touch targets
- Sticky day-tab bar, auto-selects today's actual weekday
- No decorative motion — only state-driven transitions (rest banner
  slide-up, button press feedback)

### Interaction patterns to preserve
- "Complete set →" button — the app counts sets, not the user
- Auto-start rest timer on set completion: 30s activation / 120s compound /
  90s accessory / 60s isolation, always skippable, +15s extendable
- Duration items (warm-up, cardio) get their own start/pause/reset timer,
  separate component from set-based cards
- Session stopwatch always visible once first set logs; amber past 75 min,
  red past 90 min
- Undo on every set counter
- Rest timer must survive screen lock/backgrounding on mobile — local
  notification, not a plain in-app interval
