module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 5
    },
    "rules": {
        "no-console":0,
        "consistent-return": 0,
        "no-use-before-define": 0,
        "no-shadow": 0,
        "no-else-return": 0,
        "no-unused-vars": 0,
        "camelcase": 2,
        "max-len": [1, 200],
        "one-var": 0,
        "one-var-declaration-per-line": 0,
        "no-whitespace-before-property": 0,
        "space-before-function-paren": [2, "always"],
        "no-underscore-dangle": [2, { allow: ["__", "_id", "_fileName"] }],
        "radix": 0,
        "new-cap": 0,
        "wrap-iife": [2, "any"],
        "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
        "keyword-spacing": 2,
        "quotes": ["error", "single"],
        "semi": ["error", "always"]
    }
};