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
    { img: "zebra",                truth: "zebras",                model: "a bookcase",           changed: 890, keys: ["bookshelf","shelf"] },
    { img: "keeshond",             truth: "a fluffy dog",          model: "a park bench",         changed: 1347, keys: ["parkbench","bench"] },
    { img: "bustard",              truth: "a bird",                model: "a freight car",        changed: 4678, keys: ["freightcar","train","wagon"] },
    { img: "coucal",               truth: "a bird",                model: "a web site",           changed: 1477, keys: ["website"] },
    { img: "yellow-ladys-slipper", truth: "an orchid",             model: "a jellyfish",          changed: 1779 },
    { img: "sombrero",             truth: "a man in a sombrero",   model: "a book cover",         changed: 187, keys: ["bookjacket","book"] },
    { img: "prison",               truth: "a prison",              model: "a mink",               changed: 1863 },
    { img: "porcupine",            truth: "a porcupine",           model: "a sloth bear",         changed: 73 },
    { img: "burrito",              truth: "a burrito",             model: "dough",                changed: 102 },
    { img: "mitten",               truth: "a mitten",              model: "a Christmas stocking", changed: 66 },
    { img: "harmonica",            truth: "harmonicas",            model: "a pencil sharpener",   changed: 1151 },
    { img: "rotisserie",           truth: "chickens on a spit",    model: "a French loaf",        changed: 1811, keys: ["bread","baguette"] },
    { img: "conch",                truth: "a seashell",            model: "a trilobite",          changed: 28 },
    { img: "hip",                  truth: "rose hips",             model: "a pomegranate",        changed: 212 },
    { img: "screwdriver",          truth: "a screwdriver",         model: "a fishing reel",       changed: 11, keys: ["reel"] },
    { img: "walking-stick",        truth: "a stick insect",        model: "a rose hip",           changed: 348, keys: ["hip","rosehip"] },
    { img: "model-t",              truth: "an old car",            model: "a car wheel",          changed: 929, keys: ["wheel"] },
    { img: "drum",                 truth: "a drum kit",            model: "a gong",               changed: 223 },
    { img: "starfish",             truth: "a starfish",            model: "a sea urchin",         changed: 1383 },
    { img: "buckeye",              truth: "a chestnut",            model: "a terrier",            changed: 3726, keys: ["dog","dandiedinmont"] },
    { img: "digital-watch",        truth: "a digital watch",       model: "a barometer",          changed: 618 },
    { img: "packet",               truth: "instant noodles",       model: "a Band-Aid",           changed: 353, keys: ["bandaid","plaster"] },
    { img: "pickup",               truth: "a pickup truck",        model: "a convertible",        changed: 487 },
    { img: "african-grey",         truth: "a grey parrot",         model: "a cockatoo",           changed: 1319 },
    { img: "cockatoo",             truth: "white cockatoos",       model: "an egret",             changed: 783 },
    { img: "spoonbill",            truth: "a pink spoonbill",      model: "a sandpiper",          changed: 4625, keys: ["dowitcher"] },
    { img: "angora",               truth: "a white rabbit",        model: "a Samoyed dog",        changed: 51,   keys: ["samoyed", "dog"] },
    { img: "angora-2",             truth: "a rabbit",              model: "a Scottish terrier",   changed: 270,  keys: ["scotchterrier", "terrier", "dog"] },
    { img: "crayfish",             truth: "a crayfish",            model: "a crab",               changed: 103,  keys: ["crab", "rockcrab"] },
    { img: "crock-pot",            truth: "a slow cooker",         model: "a hot pot",            changed: 148 },
    { img: "balance-beam",         truth: "a gymnast on a beam",   model: "a horizontal bar",     changed: 263 },
    { img: "drumstick",            truth: "drumsticks",            model: "a drum",               changed: 863 },
    { img: "flute",                truth: "someone playing a flute", model: "an oboe",            changed: 669 },
    { img: "four-poster",          truth: "a four-poster bed",     model: "a mosquito net",       changed: 682 },
    { img: "garbage-truck",        truth: "a garbage truck",       model: "a semi truck",         changed: 673,  keys: ["trailertruck", "semi"] },
    { img: "gasmask",              truth: "a gas mask",            model: "an oxygen mask",       changed: 2557 },
    { img: "marimba",              truth: "a marimba",             model: "wind chimes",          changed: 879,  keys: ["chime", "chimes", "windchime"] },
    { img: "slot",                 truth: "slot machines",         model: "a tram",               changed: 4,    keys: ["streetcar", "trolley"] },
    { img: "space-heater",         truth: "a space heater",        model: "a TV screen",          changed: 243,  keys: ["screen", "tv", "television"] },
    { img: "volcano",              truth: "a volcano",             model: "an alpine peak",       changed: 170,  keys: ["alp", "alps", "mountain"] },
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
  const said = (guess) => guess.length > 2 && [ex.model, ...(ex.keys || [])].some((k) => norm(k) === guess);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const guess = norm(input.value);
    const fooled = said(guess);
    const pct = (ex.changed / TOTAL_VALUES * 100).toFixed(2);
    const why =
      `${ex.changed.toLocaleString("en")} of its ${TOTAL_VALUES.toLocaleString("en")} pixel values ` +
      `(${pct}%) were nudged just enough to change what ResNet-50, a widely used image classifier, sees.`;

    if (fooled) {
      // The visitor typed exactly what the fooled network sees. Nobody does that.
      $(".ftn__verdict").textContent = "Wait. WHAT?!";
      $(".ftn__model").textContent =
        `You said ${ex.model.replace(/^(a|an) /, "")}. That's exactly what the hacked neural network sees. ` +
        `Humans don't say that. Are you... a neural network?`;
      $(".ftn__why").textContent = `It's ${ex.truth}. Really. ${why} Somehow that fooled you too.`;
      root.classList.add("ftn--shock");
    } else {
      $(".ftn__verdict").textContent = "Wrong.";
      $(".ftn__model").textContent = `It's ${ex.model}. At least that's what the neural network says.`;
      $(".ftn__why").textContent =
        `It really is ${ex.truth}, of course. But ${why} You would hardly notice. The network is completely fooled.`;
    }

    form.hidden = true;
    reveal.hidden = false;
  });
})();
