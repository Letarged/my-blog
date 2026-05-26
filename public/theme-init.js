// Runs synchronously (blocking) before any CSS is parsed.
// Sets data-theme on <html> to prevent flash of incorrect theme.
// Values: 'dark' (default) | 'light'
(function () {
  var stored = localStorage.getItem('theme');
  var theme;
  if (stored === 'dark' || stored === 'light') {
    theme = stored;
  } else {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
}());
