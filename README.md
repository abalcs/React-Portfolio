# Alan Balcom — Portfolio: *The Ascent*

An interactive 3D hiking journey, and also my developer portfolio.

A low-poly hiker climbs an alpine mountain on a clear summer day. Scrolling
walks him up the switchback trail from his family's basecamp to the summit,
where an American flag waves at the top. Along the way, wooden trail signs
preview each section of the portfolio — click one and it opens as a panel
over the world: About, Skills, Experience, Projects, live GitHub stats, and
a working contact form at the summit.

**[Visit the live site](https://abalcs.github.io/my-portfolio)**

## Experience highlights

- 🏔 **Procedural world** — terrain, forest, boulders, lake, clouds, sky, and
  the waving flag are all generated in code. Zero model/texture/audio files.
- 🚶 **Scroll-driven journey** — a third-person camera follows the hiker;
  his walk cycle, turn-arounds, and footstep sounds track your actual scroll.
- 🪧 **The world is the navigation** — trail signs carry live HTML previews
  of each section and open full content panels in-place.
- 🔊 **Procedural ambience** — wind, birdsong, and dirt footsteps synthesized
  with the Web Audio API, synced to the hiker's foot plants.
- 🏕 **Details everywhere** — a campsite with the hiker's family around a
  flickering fire, hawks riding thermals, cloud shadows sweeping the valley,
  wind-swaying pines, a reflective alpine tarn.
- 🎛 **Free-look mode** — orbit the camera around the hiker at any point.

## Engineering notes

- **Stack:** React 18 (CRA), TypeScript, three.js via @react-three/fiber +
  drei, postprocessing (bloom/SMAA/vignette), Tailwind CSS, framer-motion.
- **Performance:** the entire three.js graph lives behind one `React.lazy`
  boundary — the initial bundle stays ~156 kB gzipped and the 3D chunk
  (~300 kB) loads only on WebGL-capable browsers. Device perf tiers,
  adaptive resolution, and a tab-blur render pause keep it smooth.
- **Graceful fallback:** visitors without WebGL (or with reduced-motion
  preferences) get the previous 2D site, fully intact.
- **Deterministic terrain:** one seeded height function drives the terrain
  mesh, trail, camera clamps, and prop placement, so everything sits flush;
  the lake's shoreline containment is verified numerically.
- **Tests:** `npm test` — the jsdom suite exercises the 2D fallback path
  plus capability-branch tests (WebGL is detected, not mocked).

## Running locally

```bash
npm install
npm start        # dev server
npm test         # test suite
npm run build    # production build
npm run deploy   # build + publish to GitHub Pages
```

## Questions

- [GitHub Profile](https://github.com/abalcs)
- Email: abalcom23@gmail.com
