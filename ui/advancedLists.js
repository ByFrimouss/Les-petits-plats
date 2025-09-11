import { toSortedUnique, normalize } from "../utils.js";
import { addTag } from "./tagsView.js";
import { recipes } from "../recettes.js";
import { displayRecipes } from "./recipesView.js";
import { state } from "../state.js";
import { applyFiltersWithFilter as applyFilters } from "../search/filterSearch.js";

// ===============================
// Sélecteurs DOM
// ===============================
const ingredientsList = document.getElementById("list-ingredients");
const appliancesList = document.getElementById("list-appliances");
const ustensilsList = document.getElementById("list-ustensils");

const ingredientsInput = document.getElementById("input-ingredients");
const appliancesInput = document.getElementById("input-appliances");
const ustensilsInput = document.getElementById("input-ustensils");

// ===============================
// Création item cliquable
// ===============================
function createListItem(category, value) {
  const li = document.createElement("li");
  li.className = "cursor-pointer px-3 py-1 hover:bg-gray-200 rounded text-sm";
  li.textContent = value;

  li.addEventListener("click", () => {
    addTag(category, value);
  });

  return li;
}

// ===============================
// Met à jour les 3 listes de filtres
// ===============================
export function updateAdvancedLists(recipes) {
  // --- Ingrédients ---
  const ingredients = recipes.flatMap((r) =>
    (r.ingredients || []).map((i) => i.ingredient)
  );

  ingredientsList.innerHTML = "";
  Array.from(new Map(ingredients.map((val) => [normalize(val), val])).values()) // dédoublonnage sur normalize
    .sort((a, b) => normalize(a).localeCompare(normalize(b)))
    .forEach((val) =>
      ingredientsList.appendChild(createListItem("ingredients", val))
    );

  // --- Appareils ---
  const appliances = recipes.map((r) => r.appliance || "");
  appliancesList.innerHTML = "";
  Array.from(new Map(appliances.map((val) => [normalize(val), val])).values())
    .sort((a, b) => normalize(a).localeCompare(normalize(b)))
    .forEach((val) =>
      appliancesList.appendChild(createListItem("appliances", val))
    );

  // --- Ustensiles ---
  const ustensils = recipes.flatMap((r) => r.ustensils || []);
  ustensilsList.innerHTML = "";
  Array.from(new Map(ustensils.map((val) => [normalize(val), val])).values())
    .sort((a, b) => normalize(a).localeCompare(normalize(b)))
    .forEach((val) =>
      ustensilsList.appendChild(createListItem("ustensils", val))
    );
}

// ===============================
// Recherche en live + ajout tag avec "Enter"
// ===============================
function handleAdvancedSearchInput(category, inputEl, listEl) {
  if (!inputEl) return;

  inputEl.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    const nq = normalize(value);

    // Filtrage visuel des <li>
    Array.from(listEl.querySelectorAll("li")).forEach((li) => {
      const text = normalize(li.textContent);
      if (nq.length < 3) {
        li.style.display = "list-item";
      } else {
        li.style.display = text.includes(nq) ? "list-item" : "none";
      }
    });

    // On ne filtre plus les recettes ici ! On met juste à jour les listes
    const baseFiltered = applyFilters(recipes); // recettes filtrées par la recherche principale + tags
    updateAdvancedLists(baseFiltered);
  });
}

// ===============================
// Branche les 3 inputs
// ===============================
handleAdvancedSearchInput("ingredients", ingredientsInput, ingredientsList);
handleAdvancedSearchInput("appliances", appliancesInput, appliancesList);
handleAdvancedSearchInput("ustensils", ustensilsInput, ustensilsList);
