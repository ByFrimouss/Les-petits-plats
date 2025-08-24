import { state } from "./state.js";
import { displayRecipes } from "./ui/recipesView.js";
import { updateAdvancedLists } from "./ui/advancedLists.js";
import { renderTags } from "./ui/tagsView.js";
import { initPanelToggles } from "./ui/panels.js";
import { recipes } from "./recettes.js";

// Choix de l’algo (selon ta branche Git)
// import { applyFiltersWithFor as applyFilters } from "./search/forSearch.js";
import { applyFiltersWithFilter as applyFilters } from "./search/filterSearch.js";

// Sélecteurs DOM
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const recipesList = document.getElementById("recipesList");

// Événement : soumission du formulaire
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.query = searchInput.value.trim();
  displayRecipes(applyFilters(recipes), recipesList, state);
  updateAdvancedLists(applyFilters(recipes));
});

// Événement : saisie live
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
