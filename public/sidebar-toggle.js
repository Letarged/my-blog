// Handles the mobile sidebar drawer on post pages.
// Loaded via <script src="/sidebar-toggle.js" defer> in PostLayout.
// Does nothing if elements are absent (non-post pages).
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('sidebar-hamburger');
    var drawer    = document.getElementById('sidebar-drawer');
    var closeBtn  = document.getElementById('sidebar-close');

    if (!hamburger || !drawer) return;

    hamburger.addEventListener('click', function () {
      drawer.showModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        drawer.close();
      });
    }

    // Close on backdrop click (target is the dialog itself, not the panel)
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) drawer.close();
    });

    // Escape is handled natively by the browser for <dialog showModal()>
  });
}());
