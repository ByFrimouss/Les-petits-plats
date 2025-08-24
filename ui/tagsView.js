import { state } from "../state.js";
import { recipes } from "../recettes.js";
import { applyFiltersWithFilter as applyFilters } from "../search/filterSearch.js";
import { displayRecipes } from "./recipesView.js";
import { updateAdvancedLists } from "./advancedLists.js";

const tagsContainer = document.getElementById("activeTags");
const recipesList = document.getElementById("recipesList");

// Affichage des tags actifs
export function renderTags() {
  if (!tagsContainer) return;
  tagsContainer.innerHTML = "";

  for (const category in state.tags) {
    state.tags[category].forEach((value) => {
      // Conteneur du tag
      const tagEl = document.createElement("div");
      tagEl.className =
        "flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm mr-2 mb-2";

      // Texte du tag
      const textEl = document.createElement("span");
      textEl.textContent = value;

      // Bouton de fermeture
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "&times;";
      closeBtn.className =
        "text-black font-bold ml-1 hover:text-red-600 focus:outline-none";

      closeBtn.addEventListener("click", () => {
        state.tags[category].delete(value);
        refreshUI();
      });

      // On assemble le tag
      tagEl.appendChild(textEl);
      tagEl.appendChild(closeBtn);

      tagsContainer.appendChild(tagEl);
    });
  }
}

// Ajout d’un tag
export function addTag(category, value) {
  state.tags[category].add(value);
  refreshUI();
}

// Rafraîchit les recettes, listes et tags
function refreshUI() {
  const filtered = applyFilters(recipes);
  displayRecipes(filtered, recipesList, state);
  updateAdvancedLists(filtered);
  renderTags();
}
