// ==========================================================================
// Sprite 3D: turns a flat pixel-art image into a solid slab.
// Front and back show the image (the back mirrored, like a real cut-out); every opaque pixel on an outline gets a
// side face in that pixel's own colour, so the sprite keeps its body when
// it turns edge-on. Size and thickness come from --sprite-height and
// --sprite-depth in tokens.css. Pure CSS 3D, no dependencies.
//
// Usage: <img data-sprite3d src="..."> — the <img> stays as the fallback
// (no JS, or the image can't be read). Once built it is hidden but kept in
// the layout, so CSS still sizes it and the sprite is rebuilt whenever that size changes.
// ==========================================================================

(() => {
  const ALPHA_MIN = 128; // pixels at least this opaque count as solid

  function build(img, boxHeight, previous) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let data;
    try { data = ctx.getImageData(0, 0, w, h).data; } catch (e) { return previous; } // e.g. opened from file://

    // Size of one image pixel in CSS px, so the sprite matches the <img>'s CSS height.
    const u = boxHeight / h;
    if (!u) return previous;

    // Thickness in image pixels, from the --sprite-depth token (default 1).
    const depth = parseFloat(getComputedStyle(img).getPropertyValue("--sprite-depth")) || 1;
    const d = depth * u;

    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= ALPHA_MIN;
    const colour = (x, y) => {
      const i = (y * w + x) * 4;
      return `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
    };

    const sprite = document.createElement("div");
    // Copy the <img>'s classes, minus the one that hides it after the first build.
    sprite.className = img.className.replace("sprite3d__source", "").trim() + " sprite3d";
    sprite.setAttribute("role", "img");
    sprite.setAttribute("aria-label", img.alt);
    sprite.style.width = `${w * u}px`;
    sprite.style.height = `${h * u}px`;

    // Front and back: the image itself, pushed half the depth forward / back.
    // The back is drawn mirrored, so after it turns 180° each pixel sits
    // exactly behind its front pixel and lines up with the side faces.
    // Drawn at full size with smoothing off, so pixels stay sharp at an angle.
    const faces = [
      { mirror: false, transform: `translateZ(${d / 2}px)` },
      { mirror: true, transform: `rotateY(180deg) translateZ(${d / 2}px)` },
    ];
    for (const { mirror, transform } of faces) {
      const face = document.createElement("canvas");
      face.width = Math.round(w * u); face.height = Math.round(h * u);
      const fctx = face.getContext("2d");
      fctx.imageSmoothingEnabled = false;
      if (mirror) { fctx.translate(face.width, 0); fctx.scale(-1, 1); }
      fctx.drawImage(canvas, 0, 0, face.width, face.height);
      face.className = "sprite3d__face sprite3d__face--image";
      face.style.transform = transform;
      sprite.append(face);
    }

    // Side faces: one pixel-wide, depth-deep strip per exposed pixel edge.
    // Each starts centred on its pixel, then moves out to the edge and turns.
    const half = u / 2;
    const sides = [
      { dx: -1, dy: 0, w: d, h: u, t: `translateX(${-half}px) rotateY(-90deg)` }, // left
      { dx: 1, dy: 0, w: d, h: u, t: `translateX(${half}px) rotateY(90deg)` },    // right
      { dx: 0, dy: -1, w: u, h: d, t: `translateY(${-half}px) rotateX(90deg)` },  // top
      { dx: 0, dy: 1, w: u, h: d, t: `translateY(${half}px) rotateX(-90deg)` },   // bottom
    ];
    const frag = document.createDocumentFragment();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!solid(x, y)) continue;
        for (const s of sides) {
          if (solid(x + s.dx, y + s.dy)) continue;
          const face = document.createElement("div");
          face.className = "sprite3d__face";
          face.style.cssText =
            `left:${x * u + half - s.w / 2}px;top:${y * u + half - s.h / 2}px;` +
            `width:${s.w}px;height:${s.h}px;` +
            `background:${colour(x, y)};transform:${s.t}`;
          frag.append(face);
        }
      }
    }
    sprite.append(frag);
    if (previous) previous.replaceWith(sprite);
    else img.after(sprite);
    img.classList.add("sprite3d__source");
    return sprite;
  }

  function setUp(img) {
    let sprite, lastHeight = 0;
    const update = (height) => {
      if (!height || Math.abs(height - lastHeight) < 0.5) return;
      lastHeight = height;
      sprite = build(img, height, sprite);
    };
    // Build straight away from the computed CSS height (layout size, not
    // affected by the spin transform), then follow any later size changes.
    update(parseFloat(getComputedStyle(img).height));
    new ResizeObserver(([entry]) => update(entry.contentRect.height)).observe(img);
    window.addEventListener("resize", () => update(parseFloat(getComputedStyle(img).height)));
  }

  for (const img of document.querySelectorAll("img[data-sprite3d]")) {
    if (img.complete && img.naturalWidth) setUp(img);
    else img.addEventListener("load", () => setUp(img), { once: true });
  }
})();
