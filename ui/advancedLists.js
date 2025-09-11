import { normalize } from "../utils.js";
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

const recipesList = document.getElementById("recipesList");

// Garde une seule représentation pour chaque clé normalisée,
// mais conserve une valeur d'affichage (la première rencontrée).
function uniqueSortedByNormalized(arr) {
  const map = new Map();
  arr.forEach((v) => {
    if (!v || (typeof v === "string" && v.trim() === "")) return;
    const key = normalize(v);
    if (!map.has(key)) map.set(key, v);
  });
  return Array.from(map.values()).sort((a, b) =>
    normalize(a).localeCompare(normalize(b))
  );
}

// ===============================
// Création item cliquable
// ===============================
function createListItem(category, value) {
  const li = document.createElement("li");
  li.className = "cursor-pointer px-3 py-1 hover:bg-gray-200 rounded text-sm";
  li.textContent = value;

  li.addEventListener("click", () => {
    addTag(category, value);

    // Après ajout de tag, applyFilters + affichage est déclenché depuis tagsView (refreshUI)
  });

  return li;
}

// ===============================
// Met à jour les 3 listes de filtres
// (ne reçoit que les recettes filtrées pertinentes)
// ===============================
export function updateAdvancedLists(recipesFiltered) {
  // Ingrédients
  const ingredients = recipesFiltered.flatMap((r) =>
    (r.ingredients || []).map((i) => i.ingredient)
  );
  ingredientsList.innerHTML = "";
  uniqueSortedByNormalized(ingredients).forEach((val) =>
    ingredientsList.appendChild(createListItem("ingredients", val))
  );

  // Appareils
  const appliances = recipesFiltered.map((r) => r.appliance || "");
  appliancesList.innerHTML = "";
  uniqueSortedByNormalized(appliances).forEach((val) =>
    appliancesList.appendChild(createListItem("appliances", val))
  );

  // Ustensiles
  const ustensils = recipesFiltered.flatMap((r) => r.ustensils || []);
  ustensilsList.innerHTML = "";
  uniqueSortedByNormalized(ustensils).forEach((val) =>
    ustensilsList.appendChild(createListItem("ustensils", val))
  );
}

// ===============================
// Filtrage live + Enter
// - saisie : filtre les listes uniquement
// - Enter : ajoute un tag et filtre les cartes
// ===============================
function handleAdvancedSearchInput(category, inputEl, listEl) {
  if (!inputEl) {
    return;
  }

  // INPUT : filtrage visuel des <li>

  inputEl.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    const nq = normalize(value);

    // Base : recettes filtrées par la recherche principale + tags permanents
    const baseFiltered = applyFilters(recipes);

    // Mise à jour des listes déroulantes uniquement
    updateAdvancedLists(baseFiltered);

    // Filtrage visuel des <li> selon l'input
    Array.from(listEl.querySelectorAll("li")).forEach((li) => {
      const text = normalize(li.textContent);
      li.style.display =
        nq.length < 3 || text.includes(nq) ? "list-item" : "none";
    });
  });

  // KEYDOWN Enter : ajouter un tag permanent si correspondance exacte visible
  inputEl.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();

    const value = inputEl.value.trim();
    if (value.length < 3) return;
    const nq = normalize(value);

    // Cherche une correspondance exacte parmi les suggestions visibles
    const exactMatch = Array.from(listEl.querySelectorAll("li")).find(
      (li) => li.style.display !== "none" && normalize(li.textContent) === nq
    );

    if (exactMatch) {
      // Ajoute le tag permanent
      addTag(category, exactMatch.textContent);
      inputEl.value = "";

      // Applique les filtres permanents (barre + tags) sur les cartes
      const afterTag = applyFilters(recipes);
      displayRecipes(afterTag, recipesList, state);
      updateAdvancedLists(afterTag);
    } else {
      console.log(
        `[Enter] Pas de tag exact, on garde la recherche temporaire : "${value}"`
      );
    }
  });
}

// Branche les 3 inputs
handleAdvancedSearchInput("ingredients", ingredientsInput, ingredientsList);
handleAdvancedSearchInput("appliances", appliancesInput, appliancesList);
handleAdvancedSearchInput("ustensils", ustensilsInput, ustensilsList);
