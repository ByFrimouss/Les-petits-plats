// ===============================
// POINT D'ENTRÉE JAVASCRIPT QUI COORDONNE TOUT
// ===============================

import { state } from "./state.js";
import { displayRecipes } from "./ui/recipesView.js";
import { updateAdvancedLists } from "./ui/advancedLists.js";
import { renderTags } from "./ui/tagsView.js";
import { initPanelToggles } from "./ui/panels.js";
import { recipes } from "./recettes.js";

// Choix de l’algorithme
// import { applyFiltersWithFor as applyFilters } from "./search/forSearch.js";
import { applyFiltersWithFilter as applyFilters } from "./search/filterSearch.js";

// Sélecteurs DOM pour le formulaire et la liste des recettes
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const recipesList = document.getElementById("recipesList");

// Événement submit : filtre les recettes selon l'input et les tags
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.query = searchInput.value.trim();
  displayRecipes(applyFilters(recipes), recipesList, state);
  updateAdvancedLists(applyFilters(recipes));
});

// Événement : saisie live pendant la saisie
searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  displayRecipes(applyFilters(recipes), recipesList, state);
  updateAdvancedLists(applyFilters(recipes));
});

// Initialisation au chargement
initPanelToggles();
displayRecipes(recipes, recipesList, state);
updateAdvancedLists(recipes);
renderTags();
