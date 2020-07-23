/**
 * 入口文件
 */
var cache = require('./source/main');

module.exports = {
  loadCache: cache.loadCache,
  saveCache: cache.saveCache,
  setConfig: cache.setConfig
};