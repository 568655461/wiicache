// 缓存规则
// 第一项为路由规则的正则表达式
// 第二项为缓存过期时间，单位秒
// 第三项为缓存开始生效的时间戳。如果涉及到模版修改等迭代升级，需要作废之前该分类下所有缓存，则传入一个晚于上线时间的时间戳即可

// mode参数：
// strict - 严格匹配，则不严格符合此规则的都忽略，不会走缓存
// greedy - 贪婪匹配，则后面带有get参数的url同样会匹配到此规则，将 请求指向【不加get参数的页面的缓存】
// distinguishing - 特例匹配，则不带get参数的请求和带有get参数的请求将指向不同的页面
// 默认采用精准匹配strict模式
var rules = [];

// 静态化cookies黑名单，当cookies中存在下列键值时默认不进行静态化读取和存储
// 数组形式，每一项为一个字符串，为黑名单cookie键值
var cookiesBlackList = [];

var config = {
  // 安全模式，若为true则全盘开启静态化，忽略过期时间和生效时间，尽可能返回缓存页面。一般用于网站服务中断时的临时处置
  safeMode: false,
  // 缓存规则
  rules: rules,
  // 存储路径
  path: '', // 每个项目都需单独配置（项目名称）
  rootDir: '', // 运维提供的根目录
  // cookies黑名单
  cookiesBlackList: cookiesBlackList
};
/**
 *@param {Boolean} `safeMode:required`
 *@param {Array} `rules`
 *@param {String} `path:required`
 *@param {String} `rootDir:required`
 *@param {Array} `cookiesBlackList`
 */
function setConfig (options) {
  try {
    var safeMode = options.safeMode;
    var rules = options.rules;
    var path = options.path;
    var rootDir = options.rootDir;
    var cookiesBlackList = options.cookiesBlackList;

    // 判断必要参数是否存在类型是否正确
    if (typeof safeMode !== 'boolean') {
      throw new Error('safeMode is required: Boolean !!');
    }
    if (rules && !Array.isArray(rules)) {
      throw new Error('rules type: Array !!');
    }
    if (!path) {
      throw new Error('path is required: String !!');
    }
    if (!rootDir) {
      throw new Error('rootDir is required: String !!');
    }
    if (cookiesBlackList && !Array.isArray(cookiesBlackList)) {
      throw new Error('cookiesBlackList is required: Array !!');
    }

    // init
    config.safeMode = safeMode || config.safeMode;
    config.rules = rules || config.rules;
    config.path = path || config.path;
    config.rootDir = rootDir || config.rootDir;
    config.cookiesBlackList = cookiesBlackList || config.cookiesBlackList;
  } catch (error) {
    console.log(error);
  }
}

// 获取配置信息
function getConfig () {
  return config;
}

module.exports = {
  setConfig: setConfig,
  getConfig: getConfig
};
