# DesignNest Interiors

A mobile-first interior design app inspired by dark luxury and warm glassmorphism. Built with React, Vite, TypeScript, Tailwind CSS, React Router, and Lucide icons.

## Run locally

Use Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. If that port is occupied, Vite prints the next available port in the terminal.

## Screens

| Route                      | Experience                                                                  |
| -------------------------- | --------------------------------------------------------------------------- |
| `/`                        | Photo-led welcome screen with three inspiration slides                      |
| `/home`                    | Dashboard, spaces, project cards, notifications, and quick tools            |
| `/projects`                | Searchable projects with status filters                                     |
| `/room/:id`                | Room lighting, brightness, palettes, furniture, decor, and schedule editing |
| `/tour/:id`                | Immersive 360° panoramas with touch controls, zoom, and automatic tours     |
| `/light`                   | Two-device light controls, brightness dial, and five light colors           |
| `/favorites`               | Saved collection with room filters and design previews                      |
| `/favorites?view=discover` | Discover and save curated design inspiration                                |
| `/profile`                 | Editable profile, design preferences, notification settings, and help       |

The sample room IDs are `living-room`, `bedroom`, and `kitchen`. Create more spaces from Home.

## 360° Studio

Open a room and tap **Explore 360°**, or use **Explore 360° Studio** on Home. Direct links are `/tour/living-room`, `/tour/bedroom`, and `/tour/kitchen`. The existing visualizer also links to the selected room’s tour.

- Drag with a mouse or one finger to look in any direction, including the floor and ceiling.
- Pinch or use the +/− buttons to zoom. The reset button restores the starting view.
- Press **Play tour** for continuous rotation; pause, change speed, or drag to take over.
- Use **Expand view** for fullscreen. Browsers without element fullscreen use a viewport-filling layout.
- Switch between all three interiors using the preview cards.
- Keyboard: focus the panorama, use arrow keys to look around, +/− to zoom, and Home to reset.

The three **AI-generated concept panoramas** are served locally from `public/panoramas/`, so no image service or API key is needed at runtime. Each is a 1774×887 (2:1) PNG. Pannellum maps the images onto a sphere using WebGL and is loaded only when a tour is opened. The automatic tour animates the viewpoint; it is not a recorded video file. These are illustrative interiors, not exact reconstructions of the stock room photos, and generated geometry/seams may be imperfect. Newly added rooms use the sample panorama matching their room type.

See [the generation notes and final prompts](docs/panorama-generation.md) for asset provenance and replacement instructions. All panorama paths and starting views are in `src/data/mockData.ts`.

## What works

- Navigation, tabs, filters, favorites, notifications, and profile editing.
- Room creation and project search.
- Shared room/device brightness, power, and daily schedules.
- Independent settings for each light, with an accessible range input beneath the SVG brightness dial.
- Room palette previews, furniture selection, and decor choices.
- Photo-based style previews with a saved design direction visible in room details.
- Local generated 360° room tours with mouse, touch, keyboard, fullscreen, playback speed, and loading/retry states.
- Native dialogs with focus management and Escape dismissal, reduced-motion support, and iOS safe-area spacing.

The app uses an Express API to load and save its state in `data/designnest.json`, with uploaded images in `data/uploads/`. Back up this directory to preserve changes. The 3D Visualizer is a labeled photo/style preview; it does not render an actual 3D scene. Light controls do not connect to physical devices. Profile stats use sample totals, adjusted when you add rooms or change favorites.

## Project structure

```text
src/
  components/     Reusable cards, navigation, controls, dialogs, and image fallback
  pages/          Onboarding, Home, RoomDetail, SmartLight, Favorites, Profile, Projects, Tour
  data/           mockData.ts — sample records, room images, avatars, presets, colors
  state/          AppContext.tsx — shared session state
  App.tsx         Router and responsive app frame
  main.tsx        React entry point
  styles.css      Tailwind, design tokens, layouts, and transitions
  tour.css        360° studio and its room/dashboard entry points
```

All stock photo URLs are in `src/data/mockData.ts`. Photography loads from Unsplash and Inter loads from Google Fonts, so those assets need an internet connection. Images use lazy loading and warm background fallbacks. The pendant lights and miniature room are lightweight CSS illustrations, and the brightness arc uses SVG.

The app fills a phone viewport and becomes a centered, maximum-430px frame on desktop. Horizontal project and chip rows scroll independently; the page itself does not scroll sideways.

## Validation

```bash
npm run lint
npm run build
npx playwright install chromium
npm test
```

Playwright checks the screens and all three panorama scenes at **360×844, 390×844, and 430×844**, including horizontal overflow, image loading, navigation, saved designs, profile edits, room creation, shared lighting state, schedules, and keyboard dialog dismissal. Panorama checks exercise WebGL rendering, drag/keyboard controls, automatic rotation, zoom, fullscreen, room switching, and recovery from an unavailable image. Screenshots are written to `test-results/`.

To test an already-running server on another port:

```bash
TEST_BASE_URL=http://localhost:3002 npm test
```

Format source with `npm run format`.

## Production

To serve the complete app with its API on a Node.js host with persistent disk storage:

```bash
npm run build
npm start
```

The server listens on port 3000 by default. Set `API_PORT` to override the port and `DESIGNNEST_DATA_DIR` to choose a persistent data directory. `npm run preview` serves only the Vite frontend; it does not start the API.

### Cloudflare Workers frontend deployment

Use these Workers Builds settings with the checked-in `wrangler.jsonc`:

| Setting | Value |
| --- | --- |
| Root directory | `/` (repository root) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Worker name | `designnest` |

Wrangler uploads `dist/` and uses `assets.not_found_handling: "single-page-application"` for React Router deep links such as `/home` and `/tour/living-room`. Do not add the catch-all `/* /index.html 200` rule to `public/_redirects`: Cloudflare rejects it as an infinite redirect loop. The explicit configuration also avoids Wrangler automatically setting up the project and rebuilding it during deployment. No frontend build variables are required for this configuration.

Verify the frontend deployment configuration without publishing:

```bash
npm run build
npx wrangler deploy --dry-run
```

**Backend requirement:** this configuration deploys the frontend assets only. The current app requires `/api/state`, `/api/actions`, `/api/uploads`, and `/uploads/*` on the same origin. Without them, the app shows a connection error. The Express server, its filesystem persistence, and image processing are not included in `dist/`. To run the complete app on Cloudflare, adapt the API and storage to Workers, or route those paths to a separately hosted Node.js backend. The Vite development proxy is not used in production.
