module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: ['airbnb-base'],
  rules: {
    'no-console': 'off',
    // don't require .js extension when importing
    'import/extensions': ['error', 'always', { js: 'never' }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
      ],
    }],
    // allow devDependencies
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['test/**/*.js'],
    }],
    // Rules to work with prettier-eslint
    'arrow-parens': ['error', 'as-needed'],
    'no-mixed-operators': ['off'],
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  settings: {
    'import/core-modules': ['aws-sdk'],
  },
}
