document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#contact-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.classList.add('was-validated');
    status.textContent = '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    status.textContent = 'Form complete. Submission will be enabled when the CMS endpoint is connected.';
  });
});
