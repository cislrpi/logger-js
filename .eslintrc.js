module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project:'./tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "indent": "off",
    "@typescript-eslint/brace-style": ["error", "stroustrup"],
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/semi": ["error"]
  }
}
