# Style lock: Loyavi v2

Source of truth for tokens is `app/globals.css`; the long form is `docs/V2-PLAN.md` (section "Dizajn sistem").

- Direction contract. Thesis: a loyalty wallet that looks like a product, not a form. First viewport: blue block, condensed
  headline, one red CTA, photo collage with the real app screen. System: Tailwind v4 tokens, white cards with soft shadows
  on a tinted canvas, 3D reward objects, real app screenshots in phone frames. Risk: generated assets must stay one family.
- Palette (grounded in the owner's reference, sampled from his image): brand `#1F8BF5`, brand ink `#0B6BD0`, tint `#E3F1FF`,
  accent `#E63F26` (primary buttons only), text `#0B1826`, mute `#4F5D70`, canvas `#F2F6FC`, card `#FFFFFF`.
- Type: Geist (UI and headings), Geist Mono (numbers), Anton uppercase for hero and closing CTA only.
- Assets: `public/3d` (28 generated 3D icons, one style), `public/photos` (10 generated photos), `public/screens`
  (screenshots of the showcase routes). Logo: two cards with a red stamp, redrawn as SVG from a generated concept.
- Structure: Bento Showcase for `/` (hero, bento with phone, three steps with screens, tagline reveal, wheel split,
  category grid, dark venue band, FAQ, QR call to action, dark footer).
- Not run: the skill's palette extraction and scan scripts (the skill folder was not reachable from the shell). Contrast of
  the main pairings was checked by hand: text on white and on canvas pass; white on brand blue is about 3.4:1, so it is used
  for large or bold text only.
