// ── Theme: Ember — Dark Charcoal · Burnt Orange · Amber ──────────────────────
// Trigger class: journal-theme-ember
// Place at: src/components/features/journalCssEmber.ts

import { JOURNAL_CSS_BODY } from "./journalCssBase";

export const JOURNAL_CSS_EMBER =
  `:root{` +
  `--ink:#1a0a00;--ink-mid:#2d1500;--ink-soft:#3d1f00;` +
  `--cream:#fdf6ed;--cream-deep:#fde8d0;` +
  `--gold:#ea580c;--gold-light:#f97316;` +
  `--rust:#9a3412;--steel:#7c4a2a;--mist:#d4895a;--rule:#fed7aa;` +
  `--font-display:'Playfair Display',Georgia,serif;` +
  `--font-body:'Cormorant Garamond',Georgia,serif;` +
  `--font-mono:'Space Mono',monospace;}` +
  JOURNAL_CSS_BODY;