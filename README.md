# personal-website

Ondřej Neruda's personal and professional site. Hand-written HTML, CSS and JS: no frameworks, templates or build step.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Structure

- `index.html`: home page (top bar + spinning figure on black)
- `assets/css/tokens.css`: **design tokens** (colours, type, spacing, sprite size/depth/spin). Customise the whole site from here.
- `assets/css/base.css`: reset, typography and layout primitives
- `assets/css/components.css`: reusable components (top bar, stage, spinner, 3D sprite)
- `assets/js/sprite3d.js`: turns `assets/img/hero.png` into a 3D slab with thickness
- `assets/img/`: images (`hero.png` is the spinning figure)

New pages reuse the same stylesheets and components.

## Hosting

Live on GitHub Pages at https://ondrejneruda.github.io (repo `ondrejneruda/ondrejneruda.github.io`, served from the root of `main`). To publish changes, commit and `git push`; the site updates within a minute or two. `.nojekyll` turns off Jekyll processing. GitHub's servers are case-sensitive, so file names in links must match exactly.
