// Click handler for the theme toggle button.
// Loaded via <script src="/theme-toggle.js" defer> in BaseHead.
// CSS handles icon visibility via [data-theme] selectors (no FOUC).
// This script only manages aria-pressed and the click event.
(function () {
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Sync aria-pressed with the theme already set by theme-init.js
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.setAttribute('aria-pressed', current === 'light' ? 'true' : 'false');

    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });
}());
