/**
 * Machine Learning with javascript
 * Author: João Gabriel Lima
 * =========================================================
 * Example: zscore.js
 * Just a z-score example
 * =========================================================
 */
const distance = require('ml-distance').distance;
var d_euclidean = distance.euclidean([1,2],[2,3]);
var d_manhattan = distance.manhattan([1,2],[2,3]);

console.log("Euclidean: ",d_euclidean);
console.log("Manhattan: ",d_manhattan);

