// ===============================
// Gestion des panneaux de filtres
// ===============================

// Objectifs :
// - Ouvrir/fermer les panneaux de filtres (ingrédients, appareils, ustensiles)
// - Focus sur l'input lors de l'ouverture
// - Fermeture si clic en dehors
// - Fonctions exportées pour tests ou réutilisation

// -------------------------------
// Sélecteurs DOM
// -------------------------------
const toggles = {
  ingredients: document.getElementById("toggle-ingredients"),
  appliances: document.getElementById("toggle-appliances"),
  ustensils: document.getElementById("toggle-ustensils"),
};

const panels = {
  ingredients: document.getElementById("panel-ingredients"),
  appliances: document.getElementById("panel-appliances"),
  ustensils: document.getElementById("panel-ustensils"),
};

const inputs = {
  ingredients: document.getElementById("input-ingredients"),
  appliances: document.getElementById("input-appliances"),
  ustensils: document.getElementById("input-ustensils"),
};

// -------------------------------
// Fonction : ouvre ou ferme un panneau
// -------------------------------
export function togglePanel(type) {
  const isOpen = !panels[type].classList.contains("hidden");
  panels[type].classList.toggle("hidden", isOpen);
  toggles[type].setAttribute("aria-expanded", String(!isOpen));

  // Focus sur l’input si ouverture
  if (!isOpen) inputs[type].focus();
}

// -------------------------------
// Fonction : ferme tous les panneaux
// -------------------------------
export function closeAllPanels() {
  for (const type of Object.keys(panels)) {
    panels[type].classList.add("hidden");
    toggles[type].setAttribute("aria-expanded", "false");
  }
}

// -------------------------------
// Fonction : active les événements sur les toggles
// -------------------------------
export function initPanelToggles() {
  for (const type of Object.keys(toggles)) {
    toggles[type].addEventListener("click", () => togglePanel(type));
  }

  // Fermeture si clic à l’extérieur
  document.addEventListener("click", (e) => {
    const withinFilter = e.target.closest("[data-filter]");
    if (!withinFilter) closeAllPanels();
  });
}

// -------------------------------
// Export des objets DOM pour usage externe (si nécessaire)
// -------------------------------
export { toggles, panels, inputs };
