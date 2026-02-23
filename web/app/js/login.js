"use strict";

(function bootstrapLoginReact() {
  var LOGIN_CONTAINER_ID = 'divMain';
  var REACT_MOUNT_ID = 'login-react-root';

  function mountLoginPlaceholder() {
    var container = document.getElementById(LOGIN_CONTAINER_ID);
    if (!container) {
      return;
    }

    var mountNode = document.getElementById(REACT_MOUNT_ID);
    if (!mountNode) {
      mountNode = document.createElement('div');
      mountNode.id = REACT_MOUNT_ID;
      mountNode.setAttribute('aria-hidden', 'true');
      container.appendChild(mountNode);
    }

    var LoginPlaceholder = function LoginPlaceholder() {
      return null;
    };

    var reactElement = window.React.createElement(LoginPlaceholder);
    window.ReactDOM.createRoot(mountNode).render(reactElement);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error('Failed to load script: ' + src));
      };
      document.head.appendChild(script);
    });
  }

  function ensureReactGlobals() {
    if (window.React && window.ReactDOM && window.ReactDOM.createRoot) {
      return Promise.resolve();
    }

    return loadScript('https://unpkg.com/react@19/umd/react.production.min.js')
      .then(function () {
        return loadScript('https://unpkg.com/react-dom@19/umd/react-dom.production.min.js');
      });
  }

  ensureReactGlobals().then(mountLoginPlaceholder);
})();
