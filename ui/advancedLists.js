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
    if (!v || (typeof v === "string" && v.trim() === "")) {
      return;
    }
    const key = normalize(v);
    if (!map.has(key)) {
      map.set(key, v);
    }
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
    // après ajout de tag, applyFilters + affichage est déclenché depuis tagsView (refreshUI)
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
// - traite la saisie comme filtre temporaire pour les cartes et les listes
// - Enter ajoute un tag exact (si présent dans les suggestions visibles)
// ===============================
function handleAdvancedSearchInput(category, inputEl, listEl) {
  if (!inputEl) {
    return;
  }

  // INPUT : filtrage visuel + filtrage des cartes (à partir de 3 chars)
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

  // KEYDOWN Enter : ajouter un tag permanent si correspondance exacte visible
  inputEl.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") {
      return;
    }
    ev.preventDefault();
    const value = inputEl.value.trim();
    if (value.length < 3) {
      return;
    }
    const nq = normalize(value);

    // Cherche une correspondance exacte parmi les suggestions visibles
    const exactMatch = Array.from(listEl.querySelectorAll("li")).find(
      (li) => li.style.display !== "none" && normalize(li.textContent) === nq
    );

    if (exactMatch) {
      // Cas 1 : correspondance exacte → on ajoute le tag
      addTag(category, exactMatch.textContent);
      inputEl.value = "";
      const afterTag = applyFilters(recipes);
      displayRecipes(afterTag, recipesList, state);
      updateAdvancedLists(afterTag);
    } else {
      // Cas 2 : pas de correspondance → on garde les résultats actuels
      // donc on NE reset PAS l'input et on NE relance PAS applyFilters
      // => les 2 recettes restent affichées
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
