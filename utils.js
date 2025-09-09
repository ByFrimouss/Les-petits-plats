// ===============================
// Fonctions utilitaires
// ===============================

// Normalisation (minuscule + suppression accents + simplification pluriel)
// => permet des recherches insensibles à la casse/accents/singuliers/pluriels
export const normalize = (s) => {
  let str = (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // --- Simplification pluriel → singulier ---
  // On enlève un "s" final sauf pour certains mots qui finissent vraiment par "s"
  const exceptions = ["us", "is", "os", "as", "bois", "jus"];
  if (
    str.length > 2 && // évite de couper des mots trop courts
    str.endsWith("s") &&
    !exceptions.some((ex) => str.endsWith(ex))
  ) {
    str = str.slice(0, -1);
  }

  return str;
};

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
