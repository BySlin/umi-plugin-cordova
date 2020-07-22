//https://github.com/alitajs/alita/blob/master/packages/cordova/src/runtime.ts
export function render(oldRender) {
  function onDeviceReady() {
    oldRender();
  }

  document.addEventListener('deviceready', onDeviceReady, false);
}
