"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;

//https://github.com/alitajs/alita/blob/master/packages/cordova/src/runtime.ts
function render(oldRender) {
  function onDeviceReady() {
    oldRender();
  }

  document.addEventListener('deviceready', onDeviceReady, false);
}