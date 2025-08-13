// DOM elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const recipesList = document.getElementById("recipesList");

// Affiche toutes les recettes au chargement
displayRecipes(recipes);
console.log("Nombre de recettes chargées :", recipes.length);

// Écoute l'événement de saisie
searchButton.addEventListener("click", () => {
  console.log("Recherche déclenchée !");
  const keyword = searchInput.value.trim().toLowerCase();
  console.time("filtrage");
  const filtered = filterRecipesV2(keyword);
  console.timeEnd("filtrage");

  displayRecipes(filtered);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});

/*// Version 1 : boucle native (for)
function filterRecipesV1(keyword) {
  const results = [];
  for (let i = 0; i < recipes.length; i++) {
    const recette = recipes[i];
    if (
      recette &&
      recette.name &&
      recette.name.toLowerCase().includes(keyword)
    ) {
      results.push(recette);
    }
  }
  return results;
}*/

// Version 2 : méthode fonctionnelle
function filterRecipesV2(keyword) {
  return recipes.filter((recipe) => {
    if (!recipe.name) {
      console.warn("Recette sans nom :", recipe);
      return false;
    }
    return recipe.name.toLowerCase().includes(keyword);
  });
}

function displayRecipes(recipesToDisplay) {
  recipesList.innerHTML = ""; // Vide le conteneur avant de le remplir

  recipesToDisplay.forEach((recipe) => {
    const article = document.createElement("article");
    article.className =
      "bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm";

    const ingredientHTML = recipe.ingredients
      .map((ing) => {
        const unit = ing.unit ? ` ${ing.unit}` : "";
        const quantity = ing.quantity ? `${ing.quantity}${unit}` : "";
        return `<li>${ing.ingredient}<br><span class="text-xs text-gray-500">${quantity}</span></li>`;
      })
      .join("");

    article.innerHTML = `
      <div class="relative">
        <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-48 object-cover" />
        <span class="absolute top-2 right-2 bg-yellow-400 text-black text-sm font-semibold px-2 py-1 rounded-full shadow">
          ${recipe.time}min
        </span>
      </div>
      <div class="p-4">
        <h2 class="text-lg font-bold mb-2">${recipe.name}</h2>

        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recette</h3>
        <p class="text-sm text-gray-700 mb-4">${recipe.description}</p>

        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ingrédients</h3>
        <ul class="text-sm text-gray-700 grid grid-cols-2 gap-y-1">
          ${ingredientHTML}
        </ul>
      </div>
    `;

    recipesList.appendChild(article);
  });
}
