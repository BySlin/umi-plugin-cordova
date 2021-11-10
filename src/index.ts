import * as fse from 'fs-extra';
import * as path from 'path';
import { IApi, utils } from 'umi';
import * as address from 'address';

const { execa } = utils;

interface CordovaConfig {
  src: string,
  routerMode: 'hash' | 'memory'
}

export default function(api: IApi) {
  let isUpdatePkg = false;

  if (api.pkg.scripts['cordova:init'] == null) {
    api.pkg.scripts['cordova:init'] = 'umi cordova init';
    isUpdatePkg = true;
  }

  if (api.pkg.scripts['cordova:prepare'] == null) {
    api.pkg.scripts['cordova:prepare'] = 'umi cordova prepare';
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
    fse.writeFileSync(
      path.join(api.cwd, 'package.json'),
      JSON.stringify(api.pkg, null, 2),
    );
  }

  const isCordova = api.args._[0] === 'cordova';
  const cordovaType = api.args._[1];
  let cordovaConfigContent: string | undefined = undefined;

  const commonOpts: any = {
    cwd: api.cwd,
    cleanup: true,
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
    env: {
      FORCE_COLOR: 'true',
    },
  };

  api.describe({
    key: 'cordovaConfig',
    config: {
      default: {
        src: 'src-cordova',
        routerMode: 'hash',
      },
      schema(joi) {
        return joi.object({
          src: joi.string(),
          routerMode: joi.string(),
        });
      },
    },
  });

  if (isCordova) {
    api.modifyDevHTMLContent((html, { req }) => {
      const { src } = api.config.cordovaConfig as CordovaConfig;
      const srcCordovaPath = path.join(api.cwd, src);
      const cordovaJsPath = path.join(
        srcCordovaPath,
        'platforms',
        cordovaType,
        'platform_www',
      );
      if (req.path.includes('cordova') || req.path.includes('plugins')) {
        return fse.readFileSync(path.join(cordovaJsPath, req.url.substring(1))).toString();
      }
      return html;
    });

    api.addHTMLScripts(() => {
      return [{ src: 'cordova.js' }];
    });

    api.modifyConfig((config) => {
      const { src, routerMode } = config.cordovaConfig as CordovaConfig;
      //Cordova模式下路由更改为hash|memory
      config.history = {
        type: routerMode,
      };
      config.base = './';
      config.publicPath = './';
      config.outputPath = `${src}/www`;
      return config;
    });

    api.addRuntimePlugin(() => path.join(__dirname, './runtime'));

    //start dev cordova
    api.onDevCompileDone(({ isFirstCompile }) => {
      if (isFirstCompile) {
        const { src } = api.config.cordovaConfig as CordovaConfig;
        const srcCordovaPath = path.join(api.cwd, src);
        const installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));
        if (!installPlatform) {
          execa.sync('cordova', ['platform', 'add', cordovaType], { ...commonOpts, cwd: srcCordovaPath });
        }
        if (cordovaType !== 'browser') {
          setCordovaConfig(srcCordovaPath);
          cordovaClean(srcCordovaPath);
          execa('cordova', ['run', cordovaType], { ...commonOpts, cwd: srcCordovaPath }).then(() => {
            resetCordovaConfig(srcCordovaPath);
          }).catch(() => {
            resetCordovaConfig(srcCordovaPath);
          });
        }
      }
    });

    //build cordova
    api.onBuildComplete(({ err }) => {
      if (err == null) {
        const { src } = api.config.cordovaConfig as CordovaConfig;
        const srcCordovaPath = path.join(api.cwd, src);

        const installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));
        if (!installPlatform) {
          execa.sync('cordova', ['platform', 'add', cordovaType], { ...commonOpts, cwd: srcCordovaPath });
        }

        if (cordovaType !== 'browser') {
          cordovaClean(srcCordovaPath);
          fse.writeFileSync(path.join(srcCordovaPath, 'www', '.gitkeep'), '');
          const releaseType = api.args._[2] != undefined ? api.args._[2] : 'release';
          execa('cordova', ['build', cordovaType, `--${releaseType}`, ...api.args._.splice(2)], {
            ...commonOpts,
            cwd: srcCordovaPath,
          });
        } else {
          fse.copySync(path.join(srcCordovaPath, 'www'), path.join(srcCordovaPath, 'platforms', cordovaType, 'www'), { overwrite: true });
        }
      }
    });
  }

  api.registerCommand({
    name: 'cordova',
    fn({ args }) {
      const arg = args._[0];
      const { src } = api.config.cordovaConfig as CordovaConfig;
      const srcCordovaPath = path.join(api.cwd, src);
      if (arg === 'init') {
        if (!fse.pathExistsSync(srcCordovaPath)) {
          execa.sync('cordova', ['create', src], { ...commonOpts });
        }
        fse.emptyDirSync(path.join(srcCordovaPath, 'www'));
        checkFileConfig();
      } else if (arg === 'prepare') {
        execa.sync('cordova', ['prepare'], { ...commonOpts, cwd: srcCordovaPath });
      }
    },
  });

  //检测配置文件是否存在
  function checkFileConfig() {
    const { src } = api.config.cordovaConfig as CordovaConfig;
    const mainPath = path.join(api.cwd, src);
    fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
  }

  function setCordovaConfig(srcCordovaPath: string) {
    const port = (api.config.devServer != false && api.config.devServer?.port) || '8000';
    const protocol = (api.config.devServer != false && api.config.devServer?.https != undefined) ? 'https' : 'http';
    const url = `${protocol}://${address.ip()}:${port}`;

    const configXmlPath = path.join(srcCordovaPath, 'config.xml');
    let cordovaConfig = fse.readFileSync(configXmlPath).toString();
    cordovaConfigContent = cordovaConfig;
    const lines = cordovaConfig.split(/\r?\n/g).reverse();
    const regexContent = /\s+<content/;
    const contentIndex = lines.findIndex(line => line.match(regexContent));
    const allowNavigation = `  <allow-navigation href='${url}' />`;
    if (contentIndex >= 0) {
      lines[contentIndex] = `  <content src='${url}' />`;
      if (url) {
        lines.splice(contentIndex, 0, allowNavigation);
      }
      cordovaConfig = lines.reverse().join('\n');
      fse.writeFileSync(configXmlPath, cordovaConfig);
    }
  }

  function resetCordovaConfig(srcCordovaPath: string) {
    const configXmlPath = path.join(srcCordovaPath, 'config.xml');
    if (cordovaConfigContent != undefined) {
      fse.writeFileSync(configXmlPath, cordovaConfigContent);
    }
  }

  function cordovaClean(srcCordovaPath: string) {
    // cordova clean
    return execa.sync('cordova', [
      'clean',
      cordovaType,
    ], {
      ...commonOpts,
      cwd: srcCordovaPath,
    });
  }
}


