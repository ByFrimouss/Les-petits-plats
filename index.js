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

// Fonction centrale : met à jour l'affichage en fonction de la recherche courante
function handleSearch() {
  // On récupère et nettoie la saisie utilisateur
  state.query = searchInput.value.trim();

  // On applique les filtres sur les recettes et on met à jour l'affichage principal
  displayRecipes(applyFilters(recipes), recipesList, state);

  // On met aussi à jour les listes avancées (tags, catégories, etc.)
  updateAdvancedLists(applyFilters(recipes));
}

// Événement : soumission du formulaire (clic bouton ou touche "Entrée")
// * empêche le rechargement de la page et lance la recherche
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch();
});

// Événement : saisie en direct dans le champ texte
// * chaque frappe de clavier déclenche la recherche "live"
searchInput.addEventListener("input", handleSearch);

// Initialisation au chargement
initPanelToggles();
displayRecipes(recipes, recipesList, state);
updateAdvancedLists(recipes);
renderTags();
