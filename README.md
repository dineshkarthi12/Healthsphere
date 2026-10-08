# HealthSphere

**Specialized Care. For Every Part of You.**

HealthSphere is a specialty-first healthcare platform prototype. Patients can start from a symptom, find the right specialty and specialist, and book care. They can then follow their whole care journey in one place: consultation, tests, diagnosis, treatment, recovery and follow-up.

> This is a **frontend prototype using mock data only**. It isn't connected to any real medical records, payment systems or patient databases, and none of its content is medical advice.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

The demo patient account (Priya Raman) is one tap away: **Login → Continue with demo account**, or use the button on any patient screen. App state such as bookings, uploads and sign-in persists in `localStorage`. **Profile → Reset demo data** restores the seed data.

Add `?simulate=error` to a list page (doctors, records or appointments) to see its error state.

## Stack

- React 18, TypeScript (strict), Vite 6
- Tailwind CSS v4, with design tokens as CSS variables in `src/index.css` (`@theme`)
- React Router 6, with every page lazy-loaded (code-split)
- Radix UI primitives for accessible Dialog, Tabs and Dropdown Menu, styled in the shadcn manner
- Lucide icons, plus four custom specialty icons (lungs, kidney, tooth, venus) drawn to match
- Plus Jakarta Sans (self-hosted via Fontsource)
- No chart library: small accessible SVG charts in `src/components/charts`

Framer Motion was deliberately left out. All motion is subtle CSS (`fade-up`, `scale-in`, sheet slide, progress fills) and is switched off under `prefers-reduced-motion`.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/specialties`, `/specialties/:slug` (11 specialties), `/symptoms`, `/doctors`, `/doctors/:id`, `/hospitals`, `/hospitals/:id`, `/health-library`, `/health-library/:slug`, `/about`, `/contact`, `/emergency`, `/login`, `/signup` |
| Patient | `/appointments`, `/appointments/book`, `/care`, `/care/journey/:id`, `/records`, `/insights`, `/profile`, `/consultation/:id` |
| Doctor portal | `/doctor`, plus `appointments`, `patients`, `patients/:id`, `consult/:id`, `messages`, `records`, `prescriptions`, `reports`, `settings` |
| Hospital admin | `/admin`, plus `doctors`, `patients`, `departments`, `appointments`, `reports`, `analytics`, `settings` |

On phones, `/` renders a dedicated app home (greeting, quick intents, upcoming appointment, health overview, quick actions) rather than a squeezed landing page. A bottom tab bar (Home, Care, Appointments, Records, Profile) handles primary navigation.

## Architecture

```
src/
  components/
    ui/            Button, form fields, Modal/BottomSheet, Tabs, Toast, badges, states, Logo, icons
    layout/        AppLayout, Header, Footer, MobileBottomNav, GlobalSearch, DashboardShell, RequireSession
    specialties/   SpecialtyCard + modules/ (one interactive module per specialty)
    care-journey/  JourneyCard, JourneyStepper, JourneyTimeline, JourneyTemplate
    doctors/ appointments/ records/ health/ charts/ dashboard/
  pages/           home, specialties, doctors (+hospitals), library, public, patient/*, portal/*, admin/*
  data/            typed mock data: specialties, doctors, hospitals, journeys, records, articles, symptoms, portal
  types/           domain models (Patient, Doctor, Specialty, Hospital, Appointment, MedicalRecord, …)
  lib/             utils (formatting in IST), icon registry, mock slots, client store
  hooks/           media query, simulated query (loading/error states), document title
```

**Specialty architecture.** All 11 specialty pages share one layout:

> hero → specialty module → journey → conditions → tests & treatments → specialists → hospitals → FAQs

Each specialty brings its own vocabulary, tone colour, journey and interactive module:

| Specialty | Interactive module |
| --- | --- |
| Eye | Vision profile and Amsler grid self-check |
| Heart | Vitals overview and heart-risk check |
| Brain | BE FAST stroke card and headache diary |
| Bone & spine | Pain tracker and recovery trend |
| Lung | Peak-flow zone calculator |
| Skin | Skin-type routine builder |
| Cancer | Treatment explainers and screening guide |
| Kidney | eGFR stages and hydration tracker |
| Dental | Interactive tooth chart |
| Women's health | Cycle and pregnancy tracker |
| Child | Vaccination schedule and growth chart |

## Images

The original uploads live in `assets/source/` and are not shipped. `scripts/process_images.py` (`npm run images`, which needs Pillow, numpy and scipy) does three things:

- **Responsive WebP.** It writes 640/1024/1536 px WebP derivatives to `public/images/` (about 7 MB, down from about 60 MB of PNGs), served with `srcset`, lazy loading and explicit dimensions.
- **Checkerboard cleanup.** Several uploads had a fake grey/white transparency checkerboard baked into their pixels: `eye-care-specialty` and four unnamed `file_*.png` files. The script turns that into real transparency. Those four files were renamed descriptively: `doctor-male-portrait`, `doctor-female-portrait`, `family-portrait`, `caring-hands` and `doctor-patient-bedside`.
- **Avatars.** It makes square avatar crops of the doctor portraits.

## Accessibility

- Semantic landmarks, a skip link, and focus moved to `<main>` on navigation
- Visible `:focus-visible` rings
- Dialogs trap focus and close on Esc
- Tabs, menus and switches use correct roles
- Every form field has a label, a hint and an announced error message
- Status is never shown by colour alone (icon plus label)
- Specialty accent text uses a darker "ink" tone that clears 4.5:1 contrast
- Touch targets are at least 44px
- Each chart ships a visually hidden data table
- Respects `prefers-reduced-motion`

## Notes and limitations

- **People and places are fictional.** Doctors, hospitals and reviews are invented. HealthSphere doesn't claim to verify real practitioners.
- **Photos.** The uploaded imagery contains one female and one male doctor model, so only two doctors have photos. The others use initials-based avatars tinted in their specialty colour, rather than repeating the same face under different names.
- **No backend.** Payments, OTP, uploads, sharing and video calls are simulated in the browser.
