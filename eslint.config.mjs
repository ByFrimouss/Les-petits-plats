// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
  // Config de base recommandée par ESLint
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser, // document, window, etc.
        ...globals.node, // require, module, etc.
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Bonnes pratiques JS
      "no-unused-vars": "warn", // détecte variables jamais utilisées
      "no-undef": "error", // interdit variables non définies
      "no-console": "off", // évite les console.log oubliés
      eqeqeq: ["error", "always"], // impose === plutôt que ==
      curly: ["error", "multi-line"], // exige {} seulement si plusieurs lignes
      semi: ["error", "always"], // force les ;
    },
  },
];
