/**
 * kaige 2018-12-
 * last modify : senlyn
 * last modify date : 2018-12-15 14:37
 */
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var cacheConfig = require('./config');
// 加载配置文件
var config = cacheConfig.getConfig();
// 同步生成多级目录结构
var mkdirsSync = require('./mkdirsSync');

var md5 = function (text) {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex');
};

var loadCacheFile = function (filePath) {
  return fs.readFileSync(filePath, 'utf-8');
};

var writeCacheFile = function (filePath, fileName, data) {
  try {
    mkdirsSync(filePath, function (err, flag) {
      if (err) {
        // 生成文件目录结构出错了
        throw new Error(err);
      } else {
        // 写入文件
        fs.writeFile(filePath + '/' + fileName, data, {}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

var fsExistsSync = function (path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }
  return true;
};

// validDate参数为静态化缓存有效期，格式为unix时间戳，早于此时间生成的缓存一律忽略
// term表示缓存的有效期
// 如果validDate为null或false等，则表示忽略有效期
var loadCache = function (url, term, validDate) {
  try {
    if (!validDate) {
      validDate = 0;
    }

    var fileName = md5(url);
    var fileFirst = fileName.substr(0, 2) + '/';
    var fileSecond = fileName.substr(2, 2) + '/';
    var filePath = path.join(config.rootDir + config.path + fileFirst + fileSecond + fileName);

    var isExist = fsExistsSync(filePath);
    // 如果缓存文件不存在则返回false
    if (!isExist) {
      return false;
    }
    // 如果开启了安全模式，忽略过期时间，返回缓存内容
    if (config.safeMode) {
      return loadCacheFile(filePath);
    }

    // 若未开启安全模式则开始判断文件是否过期，过期更新cache
    else {
      // 获取文件状态
      var stat = fs.statSync(filePath);
      // 文件最后修改时间戳
      var fileTimeStamp = Date.parse(new Date(stat.mtime));
      var validDateStamp = validDate * 1000;
      // 如果文件过期
      if (fileTimeStamp < validDateStamp) {
        return false;
      } else {
        if (term && term > 0) {
          if (new Date().getTime() - fileTimeStamp > term * 1000) {
            return false;
          }
        }
        return loadCacheFile(filePath);
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

var saveCache = function (url, content) {
  try {
    // 防止缓存无效或错误html
    if (!content || content.length < 100) {
      return false;
    }
    var timeStamp = new Date().getTime();
    content += '<!-- cache version : ' + timeStamp + ' -->';
    var fileName = md5(url);
    var fileFirst = fileName.substr(0, 2) + '/';
    var fileSecond = fileName.substr(2, 2) + '/';
    var filePath = path.join(
      config.rootDir + config.path + fileFirst + fileSecond
    );
    return writeCacheFile(filePath, fileName, content);
  } catch (error) {
    console.log(error);
  }
};

// 静态化读取中间件
function loadStaticCache (Request, Response, Next) {
  try {
    
    // cookies黑名单处理
    var cookies = Request.cookies;

    // 循环遍历检索cookies黑名单中的值，若存在于黑名单则直接跳过
    for (var i in config.cookiesBlackList) {
      if (cookies[config.cookiesBlackList[i]]) {
        return Next();
      }
    }

    // 完整url
    var url = Request.headers.host + Request.url;

    // 不含get参数的url
    var urlWithoutParams = Request.headers.host + Request.path;

    var html = false;

    // --- 路由规则处理 ---
    if ( config.rules && Array.isArray(config.rules) && config.rules[0] ) {

      // 遍历填写的路由规则
      for (var i in config.rules) {

        var rule = config.rules[i];

         // 对于mode参数拼写错误等情况，一律按严格模式执行
        if (!rule.mode) {
          rule.mode = 'strict';
        }

        var reg = null;

        // 严格模式添加闭合，只匹配没有请求参数的
        if (rule.mode == 'strict') {
          reg = new RegExp(rule.route + '$');
        }
        // 特例匹配不添加闭合，匹配url后有参数的和没有参数的
        else if (rule.mode == 'distinguishing') {
          reg = new RegExp(rule.route);
        }
        else {
          reg = new RegExp(rule.route);
        }

        // 正则匹配当前访问的url
        if (reg.test(Request.url)) {

          // 匹配到url,判断是否需要读取
          if (!rule.load) {
            return Next();
          }
          // 如果是贪婪模式，读取的缓存为没有请求参数的链接加密生成的文件名
          if (rule.mode == 'greedy') {
            url = urlWithoutParams;
          }

          html = loadCache(url, rule.term, rule.validTimeStamp);
          // 如果加载了一次缓存，则立即停止遍历，跳出循环
          break;
        }
      }
    }

    //  --- 路由处理结束 ---
    if (html && html.length > 100) {
      Response.send(html);
      return;
    } else {
      return Next();
    }
  } catch (error) {
    console.log(error);
  }
}

// 静态化存储中间件
function saveStaticCache (Request, Response, Next) {
  try {
    var html = Response.sendHtml;

    // cookies黑名单处理
    var cookies = Request.cookies;

    // 循环遍历检索cookies黑名单中的值，若存在于黑名单则直接渲染页面，不进行保存操作；
    for (var i in config.cookiesBlackList) {
      if (cookies[config.cookiesBlackList[i]]) {
        Response.send(html);
        return;
      }
    }

    // 完整url
    var url = Request.headers.host + Request.url;

    // 不含get参数的url
    var urlWithoutParams = Request.headers.host + Request.path;
    // 判断html模板是否是正常的，默认认为模板长度大于100字符为正常
    if (Response && Response.sendHtml && Response.sendHtml.length > 100) {
      // --- 路由规则处理 ---
      if ( config.rules && Array.isArray(config.rules) && config.rules[0] ) {

        for (var i in config.rules) {
          var rule = config.rules[i];

          // 对于mode参数拼写错误等情况，一律按严格模式执行
          if (!rule.mode) {
            rule.mode = 'strict';
          }

          var reg = null;

          // 严格模式添加闭合，只匹配没有请求参数的
          if (rule.mode == 'strict') {
            reg = new RegExp(rule.route + '$');
          } 
          // 特例匹配不添加闭合，匹配url后有参数的和没有参数的
          else if (rule.mode == 'distinguishing') {
            reg = new RegExp(rule.route);
          }
          else {
            reg = new RegExp(rule.route);
          }

          if (reg.test(Request.url)) {

            // 如果是贪婪模式，url需要去掉参数
            if (rule.mode == 'greedy') {
              url = urlWithoutParams;
            }
            
            // 保存缓存操作
            saveCache(url, html);

            // 匹配到一个正则规则，不在进行下一个规则匹配，跳出循环
            break;
          }
        }
      }

      Response.send(html);
      return;
    } else {
      Response.send(html);
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  loadCache: loadStaticCache,
  saveCache: saveStaticCache,
  setConfig: cacheConfig.setConfig
};