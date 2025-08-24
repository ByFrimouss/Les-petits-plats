// ===============================
// Données partagées entre tous les modules
// (moteur de recherche, UI, filtres…)
// ===============================
export const state = {
  query: "", // texte de recherche principal
  tags: {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set(),
  },
};
