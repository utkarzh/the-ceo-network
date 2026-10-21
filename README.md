# CEO Network — MVP prototype

A clickable prototype of TRC's CEO Network: automated profile generation, Project Director review, permission and activation, invitation and registration, and a verified member directory. It also previews the social features that are out of scope for the MVP.

**Everything is simulated in the browser.** There are no APIs and no database. HubSpot, the TRC past reports database and Gemini are fixtures in `src/lib/data/sources.ts`, and all state persists to `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Open the URL Next prints (http://localhost:3000, or the next free port). Use the **Demo** button in the bottom-left corner to switch between the Project Director, a verified member and a guest or invitee, to jump to walkthrough steps, or to reset the data.

## Demo walkthrough (about 5 minutes)

1. **Overview** (`/admin`): pilot KPIs against the brief's targets, the funnel, items that need attention, and the interview schedule.
2. **Generate a profile** (`/admin/new`): pick an upcoming interview. Each one exercises a different path:
   - *Daniel Reyes*: full HubSpot and TRC match plus a TRC photograph, so Gemini is skipped.
   - *Amara Okafor*: the HubSpot title conflicts with the entry, so Gemini runs a current check.
   - *Fatima Zahra Benali*: no HubSpot record, so Gemini fills the gaps.
   - *Yusuf Demir*: found in no source, so the gaps are flagged instead of guessed.
3. **Review** Alex Morgan (`/admin/profiles/p_7k2f`): edit fields, resolve conflicts, regenerate only the introduction, confirm TRC links, upload an approved transcript, then mark the profile ready.
4. **Presentation mock-up** (`/present/p_7k2f`): the single slide used during the interview.
5. **Record permission, then activate**: Yes, Ask Later or No. Activation publishes the same URL.
6. **Send the invitation**, then choose **Open invitation as the CEO**. This walks through Google or verified-email sign-in, an optional delegate, review, and acceptance of the privacy terms.
7. **Directory** (`/directory`) and the member profile. The **Feed, Messages and Groups** pages are labelled previews of future features.

## Decision surfaced for the team

The brief activates a profile on a recorded **verbal yes**. The data-protection guidance says to activate only **after the CEO accepts the terms**. Both are implemented: switch between them in **Settings → Activation policy**. In both policies, a yes during the presentation counts only as interest.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/engine.ts` | Simulated pipeline: base record → HubSpot → TRC search → completeness check → conditional Gemini → draft → inactive URL. Also the intro writer (3 styles, 100–200 words, never infers gender) and transcript extraction. |
| `src/lib/data/` | Fixtures: HubSpot, TRC reports, Gemini results, the 20-CEO pilot seed, and social demo content. |
| `src/lib/store.ts` | Zustand store with every workflow action. Persisted to `localStorage`. |
| `src/lib/metrics.ts` | Pilot KPIs and funnel, measured against the brief's targets. |
| `src/components/profile/profile-view.tsx` | The member-facing profile, shared by the live page, the CEO preview, the console preview and the slide. |
| `src/app/admin/*` | TRC Console. |
| `src/app/(site)/*` | Member experience. |
| `src/app/join/[slug]` | Registration flow. |

## Moving to production

Replace the fixtures and the store actions with real services. The UI already uses the shapes the brief describes:

- HubSpot search and enrichment
- A TRC reports index
- A Gemini research call that returns facts with source URLs
- An LLM profile writer bound to the same source hierarchy
- Auth with Google and verified email
- Email delivery with the 48-hour reminder
- A database with profile states: draft, ready, active, deactivated
# the-ceo-network
