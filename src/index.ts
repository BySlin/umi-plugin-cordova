import * as fse from 'fs-extra';
import * as path from 'path';
import { IApi, utils } from 'umi';
import * as address from 'address';

const { execa } = utils;

interface CordovaConfig {
  src: string
}

export default function(api: IApi) {
  let isUpdatePkg = false;

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
    fse.writeFileSync(
      path.join(api.cwd, 'package.json'),
      JSON.stringify(api.pkg, null, 2),
    );
  }

  const isCordova = api.args._[0] === 'cordova';
  const cordovaType = api.args._[1];
  let cordovaConfigContent = undefined;

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
      },
      schema(joi) {
        return joi.object({
          src: joi.string(),
        });
      },
    },
  });

  api.modifyDevHTMLContent((html, { req }) => {
    if (isCordova) {
      const { src } = api.config.cordovaConfig as CordovaConfig;
      const srcCordovaPath = path.join(api.cwd, src);
      const cordovaJsPath = path.join(
        srcCordovaPath,
        'platforms',
        cordovaType,
        'platform_www',
      );
      if (req.path.includes('cordova')) {
        return fse.readFileSync(path.join(cordovaJsPath, req.url.substring(1))).toString();
      }
    }
    return html;
  });

  api.addHTMLScripts(() => {
    if (isCordova) {
      return [{ src: 'cordova.js' }];
    }
    return [];
  });

  api.modifyConfig((config) => {
    if (isCordova) {
      const { src } = config.cordovaConfig as CordovaConfig;
      //Cordova模式下路由更改为hash
      config.history = {
        type: 'hash',
      };
      config.base = './';
      config.publicPath = './';
      config.outputPath = `${src}/www`;
    }
    return config;
  });

  api.addRuntimePlugin(() => path.join(__dirname, './runtime'));

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
        checkMainConfig();
        fse.rmdirSync(path.join(srcCordovaPath, 'www'), { recursive: true });
      } else if (arg === 'prepare') {
        execa.sync('cordova', ['prepare'], { ...commonOpts, cwd: srcCordovaPath });
      }
    },
  });

  //start dev cordova
  api.onDevCompileDone(async ({ isFirstCompile }) => {
    if (isCordova && isFirstCompile) {
      const { src } = api.config.cordovaConfig as CordovaConfig;
      const srcCordovaPath = path.join(api.cwd, src);
      const installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));
      if (!installPlatform) {
        execa.sync('cordova', ['platform', 'add', cordovaType], { ...commonOpts, cwd: srcCordovaPath });
      }
      if (cordovaType !== 'browser') {
        setCordovaConfig(srcCordovaPath);
        await execa('cordova', ['run', cordovaType], { ...commonOpts, cwd: srcCordovaPath });
        resetCordovaConfig(srcCordovaPath);
      }
    }
  });

  //build cordova
  api.onBuildComplete(({ err }) => {
    if (isCordova && err == null) {
      const { src } = api.config.cordovaConfig as CordovaConfig;
      const srcCordovaPath = path.join(api.cwd, src);

      const installPlatform = fse.pathExistsSync(path.join(srcCordovaPath, 'platforms', cordovaType));
      if (!installPlatform) {
        execa.sync('cordova', ['platform', 'add', cordovaType], { ...commonOpts, cwd: srcCordovaPath });
      }

      if (cordovaType !== 'browser') {
        const releaseType = api.args._[2] != undefined ? api.args._[2] : 'release';
        execa('cordova', ['build', cordovaType, `--${releaseType}`], { ...commonOpts, cwd: srcCordovaPath });
      } else {
        fse.copySync(path.join(srcCordovaPath, 'www'), path.join(srcCordovaPath, 'platforms', cordovaType, 'www'), { overwrite: true });
      }
    }
  });

  //检测配置文件是否存在
  function checkMainConfig() {
    const { src } = api.config.cordovaConfig as CordovaConfig;
    const mainPath = path.join(api.cwd, src);
    fse.copySync(path.join(__dirname, '..', 'template'), mainPath);
  }

  function setCordovaConfig(srcCordovaPath: string) {
    const port = (api.config.devServer != false && api.config.devServer.port) || '8000';
    const protocol = (api.config.devServer != false && api.config.devServer.https != undefined) ? 'https' : 'http';
    const url = `${protocol}://${address.ip()}:${port}`;

    const configXmlPath = path.join(srcCordovaPath, 'config.xml');
    let cordovaConfig = fse.readFileSync(configXmlPath).toString();
    cordovaConfigContent = cordovaConfig;
    const lines = cordovaConfig.split(/\r?\n/g).reverse();
    const regexContent = /\s+<content/;
    const contentIndex = lines.findIndex(line => line.match(regexContent));
    const allowNavigation = `    <allow-navigation href="${url}" />`;
    if (contentIndex >= 0) {
      lines[contentIndex] = `    <content src="${url}" />`;
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
}


