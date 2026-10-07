import { qs, qsa } from '../core/dom.js';
import { subscribe } from '../services/newsletter-service.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initNewsletter(form) {
  const input = qs('input[type="email"]', form);
  const status = qs('[data-newsletter-status]', form);
  const submit = qs('[type="submit"]', form);

  const setStatus = (message, { isError = false, invalidInput = false } = {}) => {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
    input.setAttribute('aria-invalid', String(invalidInput));
  };

  input.addEventListener('input', () => {
    if (status.textContent) setStatus('');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = input.value.trim();

    if (!EMAIL_PATTERN.test(email)) {
      setStatus('Please enter a valid email address.', { isError: true, invalidInput: true });
      input.focus();
      return;
    }

    submit.disabled = true;
    try {
      await subscribe(email);
      setStatus('Thank you – you are now subscribed.');
      form.reset();
    } catch {
      setStatus('Newsletter sign-up is not available yet. Please try again later.', { isError: true });
    } finally {
      submit.disabled = false;
    }
  });
}

export function initNewsletters(scope = document) {
  qsa('[data-newsletter]', scope).forEach(initNewsletter);
}
