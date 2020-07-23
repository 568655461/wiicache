# 前端静态化

> 适用于node+express+ejs 架构前端项目，node >= 6.0,可显著提高页面响应速度，主要用于：
+ 1. 数据不经常改变的列表页；
+ 2. 固定内容或者不经常变化数据的详情页；
+ 3. 项目宕机情况下正常运行;


[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]


## Install

+ windows: `npm install --save wiicache`  
+ mac: `yarn add wiicache`

## Use

#### 1. 配置静态化文件

> 在项目中创建一个用于配置静态化功能的js，如： `cache.js`;

+ 引入`wiicache`模块；
+ 配置参数
+ `module.exports` 读取（`loadcache`）和写入(`savecache`)缓存的方法;

#### 2. 配置详解

> 例如：`var cache = require('wiicache');`;
> 
> 配置方法：`cache.setConfig(Object)` 

+ `safeMode`: `type`: `Boolean`, `required`:`true`,`default`:`false`;
+ `rules`: `type`: `Array`, `required`:`false`,`default`:`[]`;
+ `path`: `type`: `String`, `required`:`true`,`default`:`''`;
+ `rootDir`: `type`: `String`, `required`:`true`,`default`:`''`;
+ `cookiesBlackList`: `Array`: `Boolean`, `required`:`false`,`default`:`[]`;

```sh
cache.setConfig({
  safeMode: false,
  rules: [],
  path: '',
  rootDir: '', 
  cookiesBlackList: []
});
```
##### (1) safeMode:

>  安全模式，若为true则全盘开启静态化，忽略过期时间和生效时间，尽可能返回缓存页面。一般用于网站服务中断时的临时处置;

##### (2) rules:

> 缓存规则,数据结构：[{},{},...]

```sh
[{
  route: '\/news\/\S+\/\S+\/\S+.html',
  term: 30,
  validTimeStamp: 0,
  mode: 'strict',
  load: true // 是否需要读取，如果为false 则只存不读 ，默认为true 
}]
```

+ `route`: 
	- 需要匹配的页面路由规则的正则表达式,不同项目需要按照需求手动配置；
	- route 设置的正则在使用时会通过 `new RegExp(route);` 得到正则，书写的时候需要注意；
	- 如果 `mode` 是`strict` || `distinguishing` 模式，正则处理方法： `new RegExp(route + '$')`，将在路由后面自动添加 `$` 结尾；
+ `term`: 缓存过期时间，单位秒
+ `validTimeStamp`: 缓存开始生效的时间戳。如果涉及到模版修改等迭代升级，需要作废之前该分类下所有缓存，则传入一个晚于上线时间的时间戳即可
+ `mode`: 
	- mode参数：
	- strict - 严格匹配，则不严格符合此规则的都忽略，不会走缓存
	- greedy - 贪婪匹配，则后面带有get参数的url同样会匹配到此规则，将 请求指向【不加get参数的页面的缓存】
	- distinguishing - 特例匹配，则不带get参数的请求和带有get参数的请求将指向不同的页面
	- 默认采用精准匹配strict模式
+ `load`:是否需要读取，如果为false则只存不读 ，默认为true(读取)
##### (3) path:

> 每个项目都需单独配置（推荐使用项目名称），如：`project-haha/`（项目名+'/'）


##### (4) rootDir:

> 运维提供的根目录,如： `/data/cache/`

##### (5) cookiesBlackList:

> cookies黑名单
> 将指定cookie加入黑名单后，如果浏览的页面存在指定cookie，当前页面将不会读取缓存，来实现页面数据同步；

#### 3. 存储规则：

+ 缓存文件保存将以md5加密格式为文件名，如：某页面的缓存文件名`b7c08224341c00ef74fef2dd5d6d7b5f`;
+ 保存时，缓存文件路径为 `rootDir`+`path`+ `文件名1，2位`+ `文件名3，4位`+文件名，如：`\data\cache\zhuge-ask\b7\c0\b7c08224341c00ef74fef2dd5d6d7b5f`

#### 4. 完整代码如下：

+ cache.js

```sh
var cache = require('wiicache');

// 缓存规则
// 第一项为路由规则的正则表达式
// 第二项为缓存过期时间，单位秒
// 第三项为缓存开始生效的时间戳。如果涉及到模版修改等迭代升级，需要作废之前该分类下所有缓存，则传入一个晚于上线时间的时间戳即可

// mode参数：
// strict - 严格匹配，则不严格符合此规则的都忽略，不会走缓存
// greedy - 贪婪匹配，则后面带有get参数的url同样会匹配到此规则，将 请求指向【不加get参数的页面的缓存】
// distinguishing - 特例匹配，则不带get参数的请求和带有get参数的请求将指向不同的页面
// 默认采用精准匹配strict模式

/**
 *@param {Boolean} `safeMode:required`
 *@param {Array} `rules`
 *@param {String} `path:required`
 *@param {String} `rootDir:required`
 *@param {Array} `cookiesBlackList`
 */
cache.setConfig({
  safeMode: true,
  rules: [
    {
      route: 'ask.+answer\\S+',
      term: 30,
      validTimeStamp: 0,
      mode: 'strict'
    },
    {
      route: '\/news\/\S+\/\S+\/\S+.html',
      term: 1800,
      validTimeStamp: 0,
      mode: 'greedy'
    }
  ],
  path: 'project-name/', // 每个项目都需单独配置
  rootDir: '/data/cache/',// 放置缓存的根路径
  cookiesBlackList: ['_WEB_cache','_WAP_cache'] ,// 存在`_web_cache` cookie的将不会取缓存数据
});

module.exports = {
    loadcache: cache.loadcache,
    savecache: cache.savecache
};

```

+ app.js

> `app.use(cache.loadCache);` 和 `app.use(cache.saveCache);`中间为设置路由代码

```sh
var express = require('express');
var app = express();
var cache = require('./mycache');

// 静态化读取中间件
app.use(cache.loadCache);

// TODO:yours route
// ... others code  

// 静态化存储中间件
app.use(cache.saveCache);
module.exports = app;

```

+ 需要使用缓存的页面：
+ 在`render`方法中给`res`添加`sendHtml`属性，然后调用`next()`方法；

```sh
	res.render('web/haha', {
		'title': '哈哈',
	},function (err,html){
		res.sendHtml = html;
		next();
	});
```



## 使用场景：

+ 1. 数据不经常改变的列表页；
+ 2. 固定内容或者不经常变化数据的详情页；

## 不适合的场景：

+ 1. 通过服务端渲染具有用户信息的页面，使用后用户信息将被缓存，导致不同用户看到相同信息；
+ 2. 数据每次都会改变的页面；

## 问题：

> 某个页面不经常变化，但是当用户在浏览器触发ajax交互后，页面数据需要改变。

+ 使用cookie黑名单
如：当用户在详情页面购买商品，商品数量会减少，如果时服务端渲染同时做了缓存的情况，
再次刷新页面数据不会变化，这个时候在ajax返回成功后需要设置一个cookie，同时要保证
cookie黑名单中存在对应cookie,这时刷新页面就不会读取缓存文件，但是ejs send 前，需要
清除页面指定的cookie，否存该页面将不会走缓存方案；

## License

[MIT](LICENSE)

Copyright (c) 2018-present, zhuge

[npm-image]: https://img.shields.io/npm/v/wiicache.svg
[npm-url]: https://npmjs.org/package/wiicache
[node-version-image]: https://img.shields.io/node/v/wiicache.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/wiicache.svg
[downloads-url]: https://npmjs.org/package/wiicache