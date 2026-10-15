// ==========================================================================
// "Fool the network": one adversarial example per page load.
// The visitor types what they see; the reveal shows what ResNet-50 sees
// after a tiny, almost invisible change to the pixels.
// Images: real results from my bachelor's thesis (iterative JSMA attack).
// Mounts into any element with [data-fool-the-net].
// ==========================================================================

(() => {
  const root = document.querySelector("[data-fool-the-net]");
  if (!root) return;

  // truth: what the picture really shows. model: what ResNet-50 says after the attack.
  // changed: how many of the 150,528 pixel values (224 × 224 × RGB) the attack touched.
  const EXAMPLES = [
    { img: "chickadee",            truth: "a chickadee",           model: "a minibus",            changed: 1763 },
    { img: "limousine",            truth: "a limousine",           model: "a giant panda",        changed: 1010 },
    { img: "zebra",                truth: "zebras",                model: "a bookcase",           changed: 890 },
    { img: "keeshond",             truth: "a fluffy dog",          model: "a park bench",         changed: 1347 },
    { img: "bustard",              truth: "a bird",                model: "a freight car",        changed: 4678 },
    { img: "coucal",               truth: "a bird",                model: "a web site",           changed: 1477 },
    { img: "yellow-ladys-slipper", truth: "an orchid",             model: "a jellyfish",          changed: 1779 },
    { img: "sombrero",             truth: "a man in a sombrero",   model: "a book cover",         changed: 187 },
    { img: "prison",               truth: "a prison",              model: "a mink",               changed: 1863 },
    { img: "porcupine",            truth: "a porcupine",           model: "a sloth bear",         changed: 73 },
    { img: "burrito",              truth: "a burrito",             model: "dough",                changed: 102 },
    { img: "mitten",               truth: "a mitten",              model: "a Christmas stocking", changed: 66 },
    { img: "harmonica",            truth: "harmonicas",            model: "a pencil sharpener",   changed: 1151 },
    { img: "rotisserie",           truth: "chickens on a spit",    model: "a French loaf",        changed: 1811 },
    { img: "conch",                truth: "a seashell",            model: "a trilobite",          changed: 28 },
    { img: "hip",                  truth: "rose hips",             model: "a pomegranate",        changed: 212 },
    { img: "screwdriver",          truth: "a screwdriver",         model: "a fishing reel",       changed: 11 },
    { img: "walking-stick",        truth: "a stick insect",        model: "a rose hip",           changed: 348 },
    { img: "model-t",              truth: "an old car",            model: "a car wheel",          changed: 929 },
    { img: "drum",                 truth: "a drum kit",            model: "a gong",               changed: 223 },
    { img: "starfish",             truth: "a starfish",            model: "a sea urchin",         changed: 1383 },
    { img: "buckeye",              truth: "a chestnut",            model: "a terrier",            changed: 3726 },
    { img: "digital-watch",        truth: "a digital watch",       model: "a barometer",          changed: 618 },
    { img: "packet",               truth: "instant noodles",       model: "a Band-Aid",           changed: 353 },
    { img: "pickup",               truth: "a pickup truck",        model: "a convertible",        changed: 487 },
  ];
  const TOTAL_VALUES = 224 * 224 * 3;

  const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
  const $ = (sel) => root.querySelector(sel);
  const img = $(".ftn__img");
  const form = $(".ftn__form");
  const input = $(".ftn__input");
  const reveal = $(".ftn__reveal");

  img.src = `${root.dataset.imgBase || "assets/img/adversarial/"}${ex.img}.png`;

  const norm = (s) => s.toLowerCase().replace(/\b(a|an|the|some)\b/g, "").replace(/[^a-z]/g, "");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const guess = norm(input.value);
    const saidModel = guess.length > 2 && guess === norm(ex.model);
    const pct = (ex.changed / TOTAL_VALUES * 100).toFixed(2);

    $(".ftn__verdict").textContent = saidModel ? "Correct?!" : "Wrong.";
    $(".ftn__model").textContent = saidModel
      ? `Yes, it's ${ex.model}. You think like a neural network.`
      : `It's ${ex.model}. At least that's what the neural network says.`;
    $(".ftn__why").textContent =
      `It really is ${ex.truth}, of course. But ${ex.changed.toLocaleString("en")} of its ` +
      `${TOTAL_VALUES.toLocaleString("en")} pixel values (${pct}%) were nudged just enough ` +
      `to change what ResNet-50, a widely used image classifier, sees. You would hardly notice. The network is completely fooled.`;

    form.hidden = true;
    reveal.hidden = false;
  });
})();
