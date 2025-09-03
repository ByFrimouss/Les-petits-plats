import { toSortedUnique } from "../utils.js";
import { addTag } from "./tagsView.js";

// ===============================
// Gestion des listes de filtres avancés
// (Ingrédients, Appareils, Ustensiles)
// ===============================

// Sélecteurs DOM
const ingredientsList = document.getElementById("list-ingredients");
const appliancesList = document.getElementById("list-appliances");
const ustensilsList = document.getElementById("list-ustensils");

// Génère un bouton cliquable pour un filtre
function createListItem(category, value) {
  const li = document.createElement("li");
  li.className = "cursor-pointer px-3 py-1 hover:bg-gray-200 rounded text-sm";
  li.textContent = value;

  li.addEventListener("click", () => {
    addTag(category, value);
  });

  return li;
}

// Met à jour les 3 listes de filtres
export function updateAdvancedLists(recipes) {
  // --- Ingrédients ---
  const ingredients = recipes.flatMap((r) =>
    (r.ingredients || []).map((ing) => ing.ingredient)
  );
  ingredientsList.innerHTML = "";
  toSortedUnique(ingredients).forEach((val) => {
    ingredientsList.appendChild(createListItem("ingredients", val));
  });

  // --- Appareils ---
  const appliances = recipes.map((r) => r.appliance || "");
  appliancesList.innerHTML = "";
  toSortedUnique(appliances).forEach((val) => {
    appliancesList.appendChild(createListItem("appliances", val));
  });

  // --- Ustensiles ---
  const ustensils = recipes.flatMap((r) => r.ustensils || []);
  ustensilsList.innerHTML = "";
  toSortedUnique(ustensils).forEach((val) => {
    ustensilsList.appendChild(createListItem("ustensils", val));
  });
}
