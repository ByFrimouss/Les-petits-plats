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

// Retourne un tableau trié alphabétiquement et sans doublons
export const toSortedUnique = (arr) =>
  Array.from(new Set(arr)).sort((a, b) =>
    normalize(a).localeCompare(normalize(b))
  );

// Sécurise les affichages (évite injection HTML)
// Toujours utiliser textContent ou cette fonction
export const escapeHtml = (str = "") =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
