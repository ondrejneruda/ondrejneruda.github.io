// ==========================================================================
// Phone menu: the "Menu" button opens and closes the top-bar links.
// Closes again on a link tap, a tap outside, or Escape.
// ==========================================================================

(() => {
  const button = document.querySelector(".menu-toggle");
  const nav = document.getElementById(button?.getAttribute("aria-controls"));
  if (!button || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
  };

  button.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && e.target !== button) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); button.focus(); }
  });
})();
