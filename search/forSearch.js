import { normalize } from "../utils.js";
import { state } from "../state.js";

// ===============================
// Recherche avec boucle for
// ===============================
export function applyFiltersWithFor(recipes) {
  const nq = normalize(state.query);
  const hasQuery = nq.length >= 3;
  const filtered = [];

  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    let match = true;

    // --- Filtre principal (query) ---
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

    // --- Tags Ingrédients ---
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

    // --- Tags Appareils ---
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

    // --- Tags Ustensiles ---
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

  return filtered;
}
