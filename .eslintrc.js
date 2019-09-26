module.exports = {
  parser: '@typescript-eslint/parser',
  /*parserOptions: {
    project:'./tsconfig.json'
  },*/
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    "indent": "off",
    "semi": "error",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off"
    // not yet released - "@typescript-eslint/semi": ["error"]
  }
}