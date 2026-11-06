document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#contact-form-status');
  if (!form || !status) return;

  // No form backend is configured. Keep this closed even if markup is changed accidentally.
  form.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(control => { control.disabled = true; });
  const unavailable = 'Online enquiries are currently unavailable. Please try again later.';
  status.textContent = unavailable;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // Never fetch, navigate, store field values, or write to the CMS from this disabled form.
    status.textContent = unavailable;
  });
});
