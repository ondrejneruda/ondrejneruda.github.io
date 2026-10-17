// ==========================================================================
// Contact page.
// Email: the address is stored reversed with "#" for "@" in [data-email], so
// it never appears in the page source as an address that bots can harvest.
// "show email" decodes it and swaps in the address plus a "copy" button.
// ==========================================================================

(() => {
  const copyButton = (value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "contact__copy";
    button.textContent = "copy";
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
        button.textContent = "copied";
      } catch (e) {
        button.textContent = "select and copy it";
      }
      setTimeout(() => { button.textContent = "copy"; }, 1600);
    });
    return button;
  };

  for (const holder of document.querySelectorAll("[data-email]")) {
    const reveal = holder.querySelector(".contact__reveal");
    reveal?.addEventListener("click", () => {
      const address = [...holder.dataset.email].reverse().join("").replace("#", "@");
      const text = document.createElement("span");
      text.className = "contact__email";
      text.textContent = address;
      holder.replaceChildren(text, copyButton(address));
    });
  }
})();
