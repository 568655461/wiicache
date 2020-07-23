/**
 * 同步创建目录
 * senlyn 2018-12-15 14:37
 * last modify : senlyn
 * last modify date : 2010-01-14 11:24
 */
var fse = require('fs-extra');

/**
 *@param { String } `dirpath`<要创建的目录,支持多层级创建>
 *@param { Function } `callback(err,true||false)` <回调方法>
 * 如： /data/cache/zhuge-ask/b7/c0/b7c08224341c00ef74fef2dd5d6d7b5f
 * 依次生成下列文件目录：
 */

module.exports = function mkdirsSync (dirpath, callback) {
  try {
    fse.ensureDirSync(dirpath);
    callback(null, true);
  } catch (e) {
    callback(e, null);
  }
};