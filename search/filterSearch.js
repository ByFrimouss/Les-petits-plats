import { normalize } from "../utils.js";
import { state } from "../state.js";

// ===============================
// Recherche avec Array.filter
// ===============================
export function applyFiltersWithFilter(recipes) {
  const nq = normalize(state.query);
  const hasQuery = nq.length >= 3;

  return recipes.filter((r) => {
    // --- Filtre principal (query) ---
    if (hasQuery) {
      const inName = normalize(r.name).includes(nq);
      const inDesc = normalize(r.description).includes(nq);
      const inIngr = (r.ingredients || []).some((ing) =>
        normalize(ing.ingredient).includes(nq)
      );
      if (!(inName || inDesc || inIngr)) return false;
    }

    // --- Tags Ingrédients ---
    const okIng = [...state.tags.ingredients].every((ing) =>
      (r.ingredients || []).some(
        (i) => normalize(i.ingredient) === normalize(ing)
      )
    );
    if (!okIng) return false;

    // --- Tags Appareils ---
    if (
      state.tags.appliances.size > 0 &&
      ![...state.tags.appliances].some(
        (tag) => normalize(r.appliance || "") === normalize(tag)
      )
    ) {
      return false;
    }

    // --- Tags Ustensiles ---
    const okUst = [...state.tags.ustensils].every((ust) =>
      (r.ustensils || []).some((u) => normalize(u) === normalize(ust))
    );
    if (!okUst) return false;

    return true;
  });
}
