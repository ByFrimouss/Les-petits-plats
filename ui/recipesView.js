import { escapeHtml } from "../utils.js";

// ===============================
// Affichage des cartes de recettes
// ===============================
export function displayRecipes(recipesToDisplay, recipesList, state) {
  recipesList.innerHTML = "";

  // --- MAJ compteur ---
  const countEl = document.getElementById("recipesCount");
  if (countEl) {
    // Si aucune recherche ni tag => on laisse le "1500 recettes"
    const hasFilters =
      state.query.length >= 3 ||
      state.tags.ingredients.size > 0 ||
      state.tags.appliances.size > 0 ||
      state.tags.ustensils.size > 0;

    if (hasFilters) {
      countEl.textContent = `${recipesToDisplay.length} recette${
        recipesToDisplay.length > 1 ? "s" : ""
      }`;
    } else {
      countEl.textContent = `1500 recettes`;
    }
  }

  // Si aucune recette, affiche un message de suggestion
  if (recipesToDisplay.length === 0) {
    const x = state.query;
    const suggestions = ["tarte aux pommes", "poisson", "poulet", "chocolat"];
    recipesList.innerHTML = `
      <article class="col-span-full bg-white rounded-xl p-6 shadow text-center">
        <p class="text-lg font-semibold mb-2">
          Aucune recette ne contient « <span class="text-yellow-600">${escapeHtml(
            x
          )}</span> ».
        </p>
        <p class="text-sm text-gray-600">
          Vous pouvez chercher <em>${suggestions.join("</em>, <em>")}</em>, etc.
        </p>
      </article>
    `;
    return;
  }

  // Génère chaque carte recette avec image, temps, nom, description et ingrédients
  recipesToDisplay.forEach((recipe) => {
    const article = document.createElement("article");
    article.className =
      "bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm";

    const ingredientHTML = (recipe.ingredients || [])
      .map((ing) => {
        const unit = ing.unit ? ` ${ing.unit}` : "";
        const quantity = ing.quantity ? `${ing.quantity}${unit}` : "";
        return `<li class="mb-1"><strong>${escapeHtml(
          ing.ingredient
        )}</strong><br><span class="text-xs text-gray-500">${escapeHtml(
          quantity
        )}</span></li>`;
      })
      .join("");

    article.innerHTML = `
      <div class="relative">
        <img src="${recipe.image}" alt="${escapeHtml(
      recipe.name
    )}" class="w-full h-48 object-cover" />
        <span class="absolute top-2 right-2 bg-yellow-400 text-black text-sm font-semibold px-2 py-1 rounded-full shadow">
          ${recipe.time}min
        </span>
      </div>
      <div class="p-6">
        <h2 class="text-lg font-bold mb-3">${escapeHtml(recipe.name)}</h2>

        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recette</h3>
        <p class="text-sm text-gray-700 mb-4 line-clamp-3">${escapeHtml(
          recipe.description
        )}</p>

        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ingrédients</h3>
        <ul class="text-sm text-gray-700 grid grid-cols-2 gap-y-1">
          ${ingredientHTML}
        </ul>
      </div>
    `;

    recipesList.appendChild(article);
  });
}
