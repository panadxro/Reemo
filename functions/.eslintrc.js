module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'google'
  ],
  parserOptions: {
    ecmaVersion: 2020, // o 2018 si 2020 no está disponible
    sourceType: 'module'
  },
  rules: {
    'quotes': ['error', 'single'], // Permite comillas simples
    'indent': ['error', 2], // Indentación de 2 espacios
    'object-curly-spacing': ['error', 'always'], // Espacios en llaves
    'max-len': ['error', { 'code': 120 }], // Longitud máxima de línea
    'comma-dangle': ['error', 'never'] // Sin comas finales
  }
};
