const gallery = document.querySelector("[data-lightbox-gallery]");
const heading = document.querySelector("#gallery-title");
const intro = heading?.parentElement?.querySelector("p:last-child");

async function loadLiveGallery() {
  if (!gallery) return;
  try {
    const response = await fetch(`gallery.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`gallery.json returned ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items) || !items.length) return;
    gallery.innerHTML = "";
    items.filter(item => item?.published !== false && item?.url).slice(0, 60).forEach((item, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item" + (i === 0 ? " gallery-wide" : "") + (i === 3 ? " gallery-tall" : "");
      button.dataset.full = item.url;
      button.dataset.caption = item.title || `${item.category || "Decoration"} — Lucknow`;
      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.alt || item.title || "Perfect Moments decoration in Lucknow";
      img.loading = "lazy";
      button.appendChild(img);
      const span = document.createElement("span");
      span.textContent = item.title || item.category || "Decoration";
      button.appendChild(span);
      gallery.appendChild(button);
    });
    if (intro) intro.textContent = "Real decoration work from Perfect Moments. New projects can be added by the owner from the gallery dashboard.";
    document.dispatchEvent(new CustomEvent("gallery:updated"));
  } catch (error) {
    console.warn("Live gallery unavailable; keeping the built-in sample gallery.", error);
  }
}
loadLiveGallery();
