const isWin = /^win/.test(process.platform);

module.exports = {
 root: true,
 parserOptions: {
  parser: 'babel-eslint',
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true
  }
 },
 env: {
   browser: true,
 },
 plugins: [
   'import',
 ],
 extends: 'airbnb-base',
 rules: {
   "linebreak-style": ["error", isWin ? "windows": "unix"],
   'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
   'comma-dangle': 0,
   'import/no-extraneous-dependencies': ['error', { 'devDependencies': true }],
   'no-console': 0,
   'max-len': [2, 110, 2],
   'import/prefer-default-export': 0,
   'arrow-parens': 0,
   'no-param-reassign': [2, { 'props': false }],
   'arrow-body-style': 0,
   'import/extensions': 0,
   'import/no-unresolved': 0,
   'import/no-dynamic-require': 'off',
   'prefer-template': 0,
   'operator-assignment': 0,
   'object-curly-newline': 0
 }
};
