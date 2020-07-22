"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var fse = _interopRequireWildcard(require("fs-extra"));

var path = _interopRequireWildcard(require("path"));

var _umi = require("umi");

var address = _interopRequireWildcard(require("address"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var execa = _umi.utils.execa;

function _default(api) {
  var isUpdatePkg = false;

  if (api.pkg.scripts['cordova:prepare'] == null) {
    api.pkg.scripts['cordova:prepare'] = 'umi cordova prepare';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:init'] == null) {
    api.pkg.scripts['cordova:init'] = 'umi cordova prepare init';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:browser:dev'] == null) {
    api.pkg.scripts['cordova:browser:dev'] = 'umi dev cordova browser';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:browser:build'] == null) {
    api.pkg.scripts['cordova:browser:build'] = 'umi build cordova browser';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:android:dev'] == null) {
    api.pkg.scripts['cordova:android:dev'] = 'umi dev cordova android';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:android:build'] == null) {
    api.pkg.scripts['cordova:android:build'] = 'umi build cordova android';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:ios:dev'] == null) {
    api.pkg.scripts['cordova:ios:dev'] = 'umi dev cordova ios';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:ios:build'] == null) {
    api.pkg.scripts['cordova:ios:build'] = 'umi build cordova ios';
    isUpdatePkg = true;
  }

  if (isUpdatePkg) {
    fse.writeFileSync(path.join(api.cwd, 'package.json'), JSON.stringify(api.pkg, null, 2));
  }

  var isCordova = api.args._[0] === 'cordova';
  var cordovaType = api.args._[1];
  var cordovaConfigContent = undefined;
  var commonOpts = {
    cwd: api.cwd,
    cleanup: true,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      FORCE_COLOR: 'true'
    }
  };
  api.describe({
    key: 'cordovaConfig',
    config: {
      default: {
        src: 'src-cordova'
      },
      schema: function schema(joi) {
        return joi.object({
          src: joi.string()
        });
      }
    }
  });
  api.modifyDevHTMLContent(function (html, _ref) {
    var req = _ref.req;

    if (isCordova) {
      var src = api.config.cordovaConfig.src;
      var srcCordovaPath = path.join(api.cwd, src);
      var cordovaJsPath = path.join(srcCordovaPath, 'platforms', cordovaType, 'platform_www');

      if (req.path.includes('cordova')) {
        return fse.readFileSync(path.join(cordovaJsPath, req.url.substring(1))).toString();
      }
    }

    return html;
  });
  api.addHTMLScripts(function () {
    if (isCordova) {
      return [{
        src: 'cordova.js'
      }];
    }

    return [];
  });
  api.modifyConfig(function (config) {
    if (isCordova) {
      var src = config.cordovaConfig.src; //Cordova模式下路由更改为hash

      config.history = {
        type: 'hash'
      };
      config.base = './';
      config.publicPath = './';
      config.outputPath = "".concat(src, "/www");
    }

    return config;
  });
  api.addRuntimePlugin(function () {
    return path.join(__dirname, './runtime');
  });
  api.registerCommand({
    name: 'cordova',
    fn: function fn(_ref2) {
      var args = _ref2.args;
      var arg = args._[0];
      var src = api.config.cordovaConfig.src;
      var srcCordovaPath = path.join(api.cwd, src);

      if (arg === 'init') {
        if (!fse.pathExistsSync(srcCordovaPath)) {
          execa.sync('cordova', ['create', src], _objectSpread({}, commonOpts));
        }

        checkMainConfig();
        fse.rmdirSync(path.join(srcCordovaPath, 'www'), {
          recursive: true
        });
      } else if (arg === 'prepare') {
        execa.sync('cordova', ['prepare'], _objectSpread(_objectSpread({}, commonOpts), {}, {
          cwd: srcCordovaPath
        }));
      }
    }
  }); //start dev cordova

  api.onDevCompileDone( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref3) {
      var isFirstCompile, src, srcCordovaPath, installPlatform;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              isFirstCompile = _ref3.isFirstCompile;

              if (!(isCordova && isFirstCompile)) {
                _context.next = 11;
                break;
              }

              src = api.config.cordovaConfig.src;
              srcCordovaPath = path.join(api.cwd, src);
              installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));

              if (!installPlatform) {
                execa.sync('cordova', ['platform', 'add', cordovaType], _objectSpread(_objectSpread({}, commonOpts), {}, {
                  cwd: srcCordovaPath
                }));
              }

              if (!(cordovaType !== 'browser')) {
                _context.next = 11;
                break;
              }

              setCordovaConfig(srcCordovaPath);
              _context.next = 10;
              return execa('cordova', ['run', cordovaType], _objectSpread(_objectSpread({}, commonOpts), {}, {
                cwd: srcCordovaPath
              }));

            case 10:
              resetCordovaConfig(srcCordovaPath);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref4.apply(this, arguments);
    };
  }()); //build cordova

  api.onBuildComplete(function (_ref5) {
    var err = _ref5.err;

    if (isCordova && err == null) {
      var src = api.config.cordovaConfig.src;
      var srcCordovaPath = path.join(api.cwd, src);
      var installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));

      if (!installPlatform) {
        execa.sync('cordova', ['platform', 'add', cordovaType], _objectSpread(_objectSpread({}, commonOpts), {}, {
          cwd: srcCordovaPath
        }));
      }

      if (cordovaType !== 'browser') {
        var releaseType = api.args._[2] != undefined ? api.args._[2] : 'release';
        execa('cordova', ['build', cordovaType, "--".concat(releaseType)], _objectSpread(_objectSpread({}, commonOpts), {}, {
          cwd: srcCordovaPath
        }));
      } else {
        fse.copySync(path.join(srcCordovaPath, 'www'), path.join(srcCordovaPath, 'platforms', cordovaType, 'www'), {
          overwrite: true
        });
      }
    }
  }); //检测配置文件是否存在

  function checkMainConfig() {
    var src = api.config.cordovaConfig.src;
    var mainPath = path.join(api.cwd, src);
    fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
  }

  function setCordovaConfig(srcCordovaPath) {
    var port = api.config.devServer != false && api.config.devServer.port || '8000';
    var protocol = api.config.devServer != false && api.config.devServer.https != undefined ? 'https' : 'http';
    var url = "".concat(protocol, "://").concat(address.ip(), ":").concat(port);
    var configXmlPath = path.join(srcCordovaPath, 'config.xml');
    var cordovaConfig = fse.readFileSync(configXmlPath).toString();
    cordovaConfigContent = cordovaConfig;
    var lines = cordovaConfig.split(/\r?\n/g).reverse();
    var regexContent = /\s+<content/;
    var contentIndex = lines.findIndex(function (line) {
      return line.match(regexContent);
    });
    var allowNavigation = "    <allow-navigation href=\"".concat(url, "\" />");

    if (contentIndex >= 0) {
      lines[contentIndex] = "    <content src=\"".concat(url, "\" />");

      if (url) {
        lines.splice(contentIndex, 0, allowNavigation);
      }

      cordovaConfig = lines.reverse().join('\n');
      fse.writeFileSync(configXmlPath, cordovaConfig);
    }
  }

  function resetCordovaConfig(srcCordovaPath) {
    var configXmlPath = path.join(srcCordovaPath, 'config.xml');

    if (cordovaConfigContent != undefined) {
      fse.writeFileSync(configXmlPath, cordovaConfigContent);
    }
  }
}