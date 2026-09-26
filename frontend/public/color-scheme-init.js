// Sets the colour scheme on <html> before the app bundle runs, so the page
// doesn't flash the wrong theme. Loaded as a static file because the CloudFront
// CSP (script-src 'self') blocks inline scripts. Mirrors MUI's
// InitColorSchemeScript: same storage key (`mui-mode`) and attribute.
(function () {
  var scheme = 'light';
  try {
    var mode = window.localStorage.getItem('mui-mode');
    if (mode === 'light' || mode === 'dark') {
      scheme = mode;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      scheme = 'dark';
    }
  } catch {
    // Storage blocked: leave the attribute unset and let CSS follow the OS.
    return;
  }
  document.documentElement.setAttribute('data-mui-color-scheme', scheme);
})();
