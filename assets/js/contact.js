// ==========================================================================
// Contact page: "copy" buttons put a value (e.g. the email) on the clipboard
// and confirm with "copied" for a moment.
// ==========================================================================

(() => {
  for (const button of document.querySelectorAll("[data-copy]")) {
    const label = button.textContent;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "copied";
      } catch (e) {
        button.textContent = "select and copy it";
      }
      setTimeout(() => { button.textContent = label; }, 1600);
    });
  }
})();
