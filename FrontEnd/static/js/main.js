/* ==========================================================================
   main.js — Global Interactions
   Handles: Mobile nav toggle, flash message dismissal, active-link highlight,
            and password visibility toggle
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------
   * Mobile Hamburger Menu Toggle
   * ---------------------------------------------------------------- */
  const toggle = document.getElementById('menu-toggle') || document.getElementById('navbar-toggle') || document.querySelector('.navbar__toggle');
  const nav = document.getElementById('navbar-nav') || document.querySelector('.navbar__nav');

  if (toggle && nav) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.classList.toggle('open');
      nav.classList.toggle('show');
    });

    // Close mobile menu when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        nav.classList.remove('show');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('open');
        nav.classList.remove('show');
      }
    });
  }

  /* -------------------------------------------------------------------
   * Active Navigation Link Highlight
   * Sets .active class based on the current URL path.
   * ---------------------------------------------------------------- */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    }
  });

  /* -------------------------------------------------------------------
   * Flash Message Auto-Dismiss
   * Fades out Django/Jinja messages after 4 seconds.
   * ---------------------------------------------------------------- */
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity .4s ease, transform .4s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-8px)';
      setTimeout(() => alert.remove(), 400);
    }, 4000);
  });

  /* -------------------------------------------------------------------
   * Password Visibility Toggle (auth pages)
   * ---------------------------------------------------------------- */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else if (input) {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    });
  });


  /* -------------------------------------------------------------------
   * Secret Admin Panel Access
   * Keyboard shortcut: Alt + A or Ctrl + Shift + A
   * ---------------------------------------------------------------- */
  function triggerAdminUnlock() {
    const toast = document.createElement('div');
    toast.className = 'alert alert-success';
    toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,0.25);animation:fadeIn .3s ease;';
    toast.innerHTML = '<i class="ph-bold ph-lock-key-open"></i><span>Opening Admin Panel...</span>';
    document.body.appendChild(toast);

    setTimeout(() => {
      const p = window.location.pathname;
      if (p.includes('/auth/') || p.includes('/books/') || p.includes('/library/')) {
        window.location.href = '../admin/dashboard.html';
      } else if (p.includes('/admin/')) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'templates/admin/dashboard.html';
      }
    }, 350);
  }

  // Secret keyboard combo: Alt + A or Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    // Avoid triggering if user is actively typing inside an input/textarea
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

    if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
      if (!isTyping || e.altKey) {
        e.preventDefault();
        triggerAdminUnlock();
      }
    }
  });

  /* -------------------------------------------------------------------
   * Smooth scroll for any anchor links
   * ---------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

/* ==========================================================================
   GLOBAL THEMED DIALOGUE & TOAST HELPER FUNCTIONS
   ========================================================================== */

/**
 * Shows an elegant themed modal dialog box
 * @param {Object} options - { title, message, icon, confirmText, cancelText, onConfirm }
 */
window.showAppDialog = function({
  title = "Online Library",
  message = "",
  icon = "ph-bold ph-book-open",
  confirmText = "OK",
  cancelText = null,
  onConfirm = null
} = {}) {
  // Remove existing dialog if open
  const existing = document.getElementById('app-global-dialog');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'app-dialog-overlay active';
  overlay.id = 'app-global-dialog';

  overlay.innerHTML = `
    <div class="app-dialog" role="dialog" aria-modal="true">
      <button type="button" class="app-dialog__close" id="app-dialog-x" aria-label="Close dialog">
        <i class="ph-bold ph-x"></i>
      </button>
      <div class="app-dialog__icon">
        <i class="${icon}"></i>
      </div>
      <h3 class="app-dialog__title">${title}</h3>
      <p class="app-dialog__message">${message}</p>
      <div class="app-dialog__actions">
        ${cancelText ? `<button type="button" class="btn btn-outline" id="app-dialog-cancel">${cancelText}</button>` : ''}
        <button type="button" class="btn btn-primary" id="app-dialog-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeDialog = () => {
    overlay.classList.remove('active');
    document.removeEventListener('keydown', handleKey);
    setTimeout(() => overlay.remove(), 250);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
    } else if (e.key === 'Enter') {
      closeDialog();
      if (typeof onConfirm === 'function') onConfirm();
    }
  };

  document.addEventListener('keydown', handleKey);

  overlay.querySelector('#app-dialog-confirm').addEventListener('click', () => {
    closeDialog();
    if (typeof onConfirm === 'function') onConfirm();
  });

  overlay.querySelector('#app-dialog-x').addEventListener('click', closeDialog);

  if (cancelText) {
    const cancelBtn = overlay.querySelector('#app-dialog-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
};

/**
 * Global override for native browser alert() to match the website theme
 */
window.alert = function(msg) {
  window.showAppDialog({
    title: "Online Library",
    message: String(msg || ""),
    icon: "ph-bold ph-bell-simple-ringing",
    confirmText: "OK"
  });
};

/**
 * Shows a non-intrusive floating toast alert
 * @param {Object} options - { title, message, icon, duration }
 */
window.showAppToast = function({
  title = "Notice",
  message = "",
  icon = "ph-bold ph-check-circle",
  duration = 3200
}) {
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'app-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.innerHTML = `
    <i class="${icon} app-toast__icon"></i>
    <div class="app-toast__content">
      <div class="app-toast__title">${title}</div>
      ${message ? `<div class="app-toast__desc">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};


