// ===============================
// Fonctions utilitaires
// ===============================

// Normalisation (minuscule + suppression accents)
// => permet des recherches insensibles à la casse/accents
export const normalize = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
// Normalisation singulier/pluriel (simple)
// => retire le "s" final sauf si mot très court
export const singularize = (s) => {
  if (s.length > 3 && s.endsWith("s")) {
    return s.slice(0, -1);
  }
  return s;
};

// Combine les deux : normalisation complète pour tags
export const normalizeTag = (s) => singularize(normalize(s));

// Retourne un tableau trié alphabétiquement et sans doublons
export const toSortedUnique = (arr) =>
  Array.from(new Set(arr.map(normalizeTag))).sort((a, b) => a.localeCompare(b));

// Sécurise les affichages (évite injection HTML)
// Toujours utiliser textContent ou cette fonction
export const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
