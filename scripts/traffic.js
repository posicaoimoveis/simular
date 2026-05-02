const TRAFFIC_BADGE_HTML = `
<div class="online-badge" id="online-counter" aria-live="polite">
  <span class="online-dot" aria-hidden="true"></span>
  <span id="online-count">1 pessoa online</span>
</div>
`;

async function loadTrafficBadge() {
  const root = document.getElementById("traffic-root");
  if (!root || document.getElementById("online-counter")) return;

  const partialPath = root.dataset.trafficPartial || "pages/traffic.html";

  if (partialPath && window.location.protocol !== "file:") {
    try {
      const response = await fetch(partialPath, { cache: "no-cache" });
      if (response.ok) {
        root.innerHTML = await response.text();
        return;
      }
    } catch (error) {
      // Mantém funcionamento local usando o HTML interno abaixo.
    }
  }

  root.innerHTML = TRAFFIC_BADGE_HTML;
}

function initTrafficPresence() {
  const countSpan = document.getElementById("online-count");
  if (!countSpan) return;

  let currentCount = Math.floor(Math.random() * 4) + 2;

  const updateDisplay = () => {
    const label = currentCount === 1 ? " pessoa online" : " pessoas online";
    countSpan.innerText = currentCount + label;
  };

  updateDisplay();

  setInterval(() => {
    const change = Math.random() > 0.6 ? 1 : Math.random() > 0.4 ? -1 : 0;
    currentCount += change;
    if (currentCount < 1) currentCount = 1;
    if (currentCount > 9) currentCount = 8;
    updateDisplay();
  }, 7000);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadTrafficBadge();
  initTrafficPresence();
});
