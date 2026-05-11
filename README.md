# Asobi

<table border="0"><tr>
<td valign="middle">

Asobi is a mobile-first progressive web app for playing party games together — whether you're passing a single device around or connecting multiple phones via WebSockets for a seamless shared experience.
All games and content are completely free, with no ads, ever.

A native app is in the works to bring offline multi-peer connectivity, so the fun doesn't stop when the Wi-Fi does.

Want to help? Contributions are always welcome — whether that's translating the app into your language, adding new game content, building new games, or supporting the project with a donation.

</td>
<td valign="middle" width="30"></td>
<td valign="middle" width="25%">
<img src="static/readme-icon.png" width="100%"/>
</td>
</tr></table>

## Games

| Game     | Status         |
| -------- | -------------- |
| Impostor | ✅ Playable    |
| Taboo    | 🚧 Coming soon |
| Werewolf | 🚧 Coming soon |
| And More | 🚧 Coming soon |

## Tech stack

- **[SvelteKit](https://kit.svelte.dev/)** + **Svelte 5** (runes)
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[GSAP](https://gsap.com/)** — animations
- **[Bits UI](https://bits-ui.com/)** — accessible headless components
- **[Runed](https://runed.dev/)** — Svelte 5 utility primitives
- **[Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)** — i18n

## Getting started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm check

# Format
pnpm format
```

## Building

```bash
pnpm build
pnpm preview
```

The build targets Node.js via `adapter-node`. Output lands in `build/`.

## Lib structure

```
lib/
├── games/
│   ├── impostor/       # Specific Game
│   │   ├── state/      # Game specific State
│   │   ├── types/      # Game specific Types
│   │   ├── ui/         # Game specific UI
│   │   └── ...
│   └── gameslist.ts    # Master list of all games
├── ui/                 # Shared UI components
├── helper/             # GSAP helpers, utilities
├── state/              # Global state
└── types/              # Shared types

```
