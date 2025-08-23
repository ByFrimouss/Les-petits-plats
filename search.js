// ===============================
//      Sélecteurs & État global
// ===============================
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const recipesList = document.getElementById("recipesList");
const activeTagsEl = document.getElementById("activeTags");

// Filtres avancés (panneaux)
const toggles = {
  ingredients: document.getElementById("toggle-ingredients"),
  appliances: document.getElementById("toggle-appliances"),
  ustensils: document.getElementById("toggle-ustensils"),
};
const panels = {
  ingredients: document.getElementById("panel-ingredients"),
  appliances: document.getElementById("panel-appliances"),
  ustensils: document.getElementById("panel-ustensils"),
};
const inputs = {
  ingredients: document.getElementById("input-ingredients"),
  appliances: document.getElementById("input-appliances"),
  ustensils: document.getElementById("input-ustensils"),
};
const lists = {
  ingredients: document.getElementById("list-ingredients"),
  appliances: document.getElementById("list-appliances"),
  ustensils: document.getElementById("list-ustensils"),
};

// État de recherche : requête principale + tags
const state = {
  query: "",
  tags: {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set(),
  },
};

// ===============================
//      Utilitaires
// ===============================

// Normalise : minuscule + sans accents
const normalize = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Dedup + tri alphabétique
const toSortedUnique = (arr) =>
  Array.from(new Set(arr.map((v) => (normalize(v) ? v : v)))).sort((a, b) =>
    normalize(a).localeCompare(normalize(b))
  );

// ===============================
//      Moteur de filtrage
// ===============================
function applyFilters() {
  const nq = normalize(state.query);
  const hasQuery = nq.length >= 3;

  const filtered = recipes.filter((r) => {
    // 1) Filtre principal (si >=3 car.)
    if (hasQuery) {
      const inName = normalize(r.name).includes(nq);
      const inDesc = normalize(r.description).includes(nq);
      const inIngr = (r.ingredients || []).some((ing) =>
        normalize(ing.ingredient).includes(nq)
      );
      if (!(inName || inDesc || inIngr)) return false;
    }

    // 2) Tags - ingrédients : AND (tous doivent être présents)
    for (const ing of state.tags.ingredients) {
      const found = (r.ingredients || []).some(
        (i) => normalize(i.ingredient) === normalize(ing)
      );
      if (!found) return false;
    }

    // 3) Tags - appareils : AND (tous les appareils sélectionnés doivent correspondre)
    if (state.tags.appliances.size > 0) {
      const app = normalize(r.appliance || "");

      // Vérifie que **tous les tags sélectionnés** correspondent
      const allMatch = Array.from(state.tags.appliances).every(
        (tag) => app === normalize(tag)
      );

      if (!allMatch) return false;
    }

    // 4) Tags - ustensiles : AND
    for (const ust of state.tags.ustensils) {
      const found = (r.ustensils || []).some(
        (u) => normalize(u) === normalize(ust)
      );
      if (!found) return false;
    }

    return true;
  });

  displayRecipes(filtered);
  updateAdvancedLists(filtered);
}

// ===============================
//      Affichage Recettes
// ===============================
function displayRecipes(recipesToDisplay) {
  recipesList.innerHTML = "";

  // Scénario A1 : aucun résultat
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

  // Cartes
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

// Échappe le HTML (sécurité XSS)
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===============================
//      Tags (ajout/suppression)
// ===============================
function renderTags() {
  activeTagsEl.innerHTML = "";

  const makeTag = (type, value) => {
    const wrapper = document.createElement("span");
    wrapper.className =
      "inline-flex items-center gap-2 bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-sm";

    wrapper.innerHTML = `
      <span>${escapeHtml(value)}</span>
      <button type="button" class="font-bold" aria-label="Supprimer le tag ${escapeHtml(
        value
      )}" data-type="${type}" data-value="${escapeHtml(value)}">×</button>
    `;
    return wrapper;
  };

  for (const v of state.tags.ingredients)
    activeTagsEl.appendChild(makeTag("ingredients", v));
  for (const v of state.tags.appliances)
    activeTagsEl.appendChild(makeTag("appliances", v));
  for (const v of state.tags.ustensils)
    activeTagsEl.appendChild(makeTag("ustensils", v));
}

// Click sur le « × » des tags
activeTagsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-type]");
  if (!btn) return;
  const { type, value } = btn.dataset;
  state.tags[type].delete(value);
  renderTags();
  applyFilters();
});

// ===============================
//      Listes avancées (MAJ UI)
// ===============================
function updateAdvancedLists(current) {
  // Construit les valeurs disponibles à partir des recettes filtrées
  const ing = toSortedUnique(
    current.flatMap((r) => (r.ingredients || []).map((i) => i.ingredient))
  );
  const app = toSortedUnique(
    current.map((r) => r.appliance || "").filter(Boolean)
  );
  const ust = toSortedUnique(current.flatMap((r) => r.ustensils || []));

  // Masque les options déjà taggées
  const filteredByTags = (arr, type) =>
    arr.filter((v) => !state.tags[type].has(v));

  renderOptions(
    lists.ingredients,
    filteredByTags(ing, "ingredients"),
    "ingredients"
  );
  renderOptions(
    lists.appliances,
    filteredByTags(app, "appliances"),
    "appliances"
  );
  renderOptions(lists.ustensils, filteredByTags(ust, "ustensils"), "ustensils");

  // Ré-applique le filtre de frappe dans chaque panneau (si l’utilisateur est en train d’écrire)
  filterOptionsByInput("ingredients");
  filterOptionsByInput("appliances");
  filterOptionsByInput("ustensils");
}

function renderOptions(ul, values, type) {
  ul.innerHTML = values
    .map(
      (v) => `
      <li>
        <button type="button" class="w-full text-left p-2 hover:bg-gray-100"
                data-add="${type}" data-value="${escapeHtml(v)}">${escapeHtml(
        v
      )}</button>
      </li>`
    )
    .join("");
}

// Ajoute un tag en cliquant une option
Object.values(lists).forEach((ul) => {
  ul.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-add]");
    if (!btn) return;
    const type = btn.dataset.add;
    const value = btn.dataset.value;
    state.tags[type].add(value);
    renderTags();
    applyFilters();
  });
});

// Filtrage live dans chaque panneau (point 6/11)
function filterOptionsByInput(type) {
  const q = normalize(inputs[type].value || "");
  const buttons = lists[type].querySelectorAll("button[data-add]");
  buttons.forEach((b) => {
    const txt = normalize(b.textContent || "");
    b.parentElement.classList.toggle(
      "hidden",
      q.length > 0 && !txt.includes(q)
    );
  });
}

inputs.ingredients.addEventListener("input", () =>
  filterOptionsByInput("ingredients")
);
inputs.appliances.addEventListener("input", () =>
  filterOptionsByInput("appliances")
);
inputs.ustensils.addEventListener("input", () =>
  filterOptionsByInput("ustensils")
);

// ===============================
//      Panneaux : ouverture/fermeture
// ===============================
function togglePanel(type) {
  const isOpen = !panels[type].classList.contains("hidden");
  panels[type].classList.toggle("hidden", isOpen);
  toggles[type].setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) inputs[type].focus();
}

toggles.ingredients.addEventListener("click", () => togglePanel("ingredients"));
toggles.appliances.addEventListener("click", () => togglePanel("appliances"));
toggles.ustensils.addEventListener("click", () => togglePanel("ustensils"));

// Ferme si clic à l’extérieur
document.addEventListener("click", (e) => {
  const within = e.target.closest("[data-filter]");
  if (within) return;
  for (const type of ["ingredients", "appliances", "ustensils"]) {
    panels[type].classList.add("hidden");
    toggles[type].setAttribute("aria-expanded", "false");
  }
});

// ===============================
//      Recherche principale
// ===============================

// Submit du formulaire (Enter ou clic sur bouton)
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.query = searchInput.value.trim();
  applyFilters();
});

// Recherche live (à partir de 3 caractères)
searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  applyFilters();
});

// ===============================
//      Initialisation
// ===============================
displayRecipes(recipes); // Affiche tout au chargement
updateAdvancedLists(recipes); // Alimente les listes de filtres
renderTags(); // Aucun tag au départ
console.log("Nombre de recettes chargées :", recipes.length);

// ===============================
//      Version "for"
// ===============================
function applyFiltersWithFor() {
  const nq = normalize(state.query);
  const hasQuery = nq.length >= 3;
  const filtered = [];

  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    let match = true;

    // 1) Filtre principal
    if (hasQuery) {
      const inName = normalize(r.name).includes(nq);
      const inDesc = normalize(r.description).includes(nq);
      let inIngr = false;
      for (const ing of r.ingredients || []) {
        if (normalize(ing.ingredient).includes(nq)) {
          inIngr = true;
          break;
        }
      }
      if (!(inName || inDesc || inIngr)) match = false;
    }

    // 2) Tags - ingrédients (AND)
    for (const ing of state.tags.ingredients) {
      let found = false;
      for (const i of r.ingredients || []) {
        if (normalize(i.ingredient) === normalize(ing)) {
          found = true;
          break;
        }
      }
      if (!found) {
        match = false;
        break;
      }
    }

    // 3) Tags - appareils (OR)
    if (match && state.tags.appliances.size > 0) {
      const app = normalize(r.appliance || "");
      let ok = false;
      for (const tag of state.tags.appliances) {
        if (app === normalize(tag)) {
          ok = true;
          break;
        }
      }
      if (!ok) match = false;
    }

    // 4) Tags - ustensiles (AND)
    if (match) {
      for (const ust of state.tags.ustensils) {
        let found = false;
        for (const u of r.ustensils || []) {
          if (normalize(u) === normalize(ust)) {
            found = true;
            break;
          }
        }
        if (!found) {
          match = false;
          break;
        }
      }
    }

    if (match) filtered.push(r);
  }

  return filtered; // Retourne les résultats
}

// ===============================
//      Version "filter"
// ===============================
function applyFiltersWithFilter() {
  const nq = normalize(state.query);
  const hasQuery = nq.length >= 3;

  return recipes.filter((r) => {
    // 1) Filtre principal
    if (hasQuery) {
      const inName = normalize(r.name).includes(nq);
      const inDesc = normalize(r.description).includes(nq);
      const inIngr = (r.ingredients || []).some((ing) =>
        normalize(ing.ingredient).includes(nq)
      );
      if (!(inName || inDesc || inIngr)) return false;
    }

    // 2) Tags - ingrédients (AND)
    const okIng = [...state.tags.ingredients].every((ing) =>
      (r.ingredients || []).some(
        (i) => normalize(i.ingredient) === normalize(ing)
      )
    );
    if (!okIng) return false;

    // 3) Tags - appareils (OR si non vide)
    if (
      state.tags.appliances.size > 0 &&
      ![...state.tags.appliances].some(
        (tag) => normalize(r.appliance || "") === normalize(tag)
      )
    ) {
      return false;
    }

    // 4) Tags - ustensiles (AND)
    const okUst = [...state.tags.ustensils].every((ust) =>
      (r.ustensils || []).some((u) => normalize(u) === normalize(ust))
    );
    if (!okUst) return false;

    return true;
  });
}
