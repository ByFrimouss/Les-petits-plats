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

    // --- Base filtrée (recherche principale + tags actifs) ---
    const baseFiltered = applyFilters(recipes);

    // --- Filtrage recettes selon saisie ---
    const filteredRecipes =
      nq.length >= 3
        ? baseFiltered.filter((r) => {
            if (category === "ingredients")
              return (r.ingredients || []).some((i) =>
                normalize(i.ingredient).includes(nq)
              );
            if (category === "appliances")
              return normalize(r.appliance || "").includes(nq);
            if (category === "ustensils")
              return (r.ustensils || []).some((u) => normalize(u).includes(nq));
            return true;
          })
        : baseFiltered;

    // --- Filtrage visuel des suggestions ---
    listEl.querySelectorAll("li").forEach((li) => {
      const text = normalize(li.textContent);
      li.style.display =
        nq.length < 3 || text.includes(nq) ? "list-item" : "none";
    });

    // --- Mise à jour cartes + listes pertinentes ---
    displayRecipes(filteredRecipes, recipesList, state);
    updateAdvancedLists(filteredRecipes);
  });

  // --- Enter pour ajouter un tag ---
  inputEl.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      const value = inputEl.value.trim();
      if (value.length < 3) return;

      const nq = normalize(value);

      // Vérifie correspondance exacte dans suggestions visibles
      const exactMatch = Array.from(listEl.querySelectorAll("li")).find(
        (li) => li.style.display !== "none" && normalize(li.textContent) === nq
      );

      if (exactMatch) addTag(category, exactMatch.textContent);

      // Reset input
      inputEl.value = "";

      // ⚡ Filtrage combiné : prend en compte les tags actifs et la saisie
      const baseFiltered = applyFilters(recipes); // recettes filtrées par tags
      const filteredRecipes = baseFiltered.filter((r) => {
        if (category === "ingredients")
          return (r.ingredients || []).some((i) =>
            normalize(i.ingredient).includes(nq)
          );
        if (category === "appliances")
          return normalize(r.appliance || "").includes(nq);
        if (category === "ustensils")
          return (r.ustensils || []).some((u) => normalize(u).includes(nq));
        return true;
      });

      displayRecipes(filteredRecipes, recipesList, state);
      updateAdvancedLists(filteredRecipes);
    }
  });
}

// ===============================
// Branche les 3 inputs
// ===============================
handleAdvancedSearchInput("ingredients", ingredientsInput, ingredientsList);
handleAdvancedSearchInput("appliances", appliancesInput, appliancesList);
handleAdvancedSearchInput("ustensils", ustensilsInput, ustensilsList);
