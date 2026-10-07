import { config } from '../config.js';
import { qs, qsa } from '../core/dom.js';
import { escapeHtml } from '../core/format.js';
import { ApiError } from '../services/api-client.js';
import { validateContact, sendMessage } from '../services/contact-service.js';

const STATUS_ICON = '<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-info"></use></svg>';

const mailtoHref = ({ name, surname, email, message }) => {
  const sender = [name, surname].map((part) => part.trim()).filter(Boolean).join(' ');
  const subject = `Website inquiry from ${sender}`;
  const body = `${message.trim()}\n\n${sender}\n${email.trim()}`;
  return `mailto:${config.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function initContactForm(form) {
  const fields = qsa('.form-control', form);
  const submit = qs('[type="submit"]', form);
  const status = qs('[data-contact-status]', form);
  let attempted = false;

  const values = () => Object.fromEntries(fields.map((field) => [field.name, field.value]));

  const showError = (field, message) => {
    const error = qs(`#${field.id}-error`, form);
    error.textContent = message ?? '';
    error.hidden = !message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const showStatus = (html, { isError = false } = {}) => {
    status.innerHTML = html ? `${STATUS_ICON}<p>${html}</p>` : '';
    status.hidden = !html;
    status.classList.toggle('notice--error', isError);
  };

  const validate = (only) => {
    const errors = validateContact(values());
    fields.forEach((field) => {
      if (!only || only === field) showError(field, errors[field.name]);
    });
    return errors;
  };

  /* An error appearing on blur would push the Send button away before its click lands;
     the submit handler validates every field anyway. Touch browsers blur after pointerup. */
  let pressingSubmit = false;
  submit.addEventListener('pointerdown', () => {
    pressingSubmit = true;
  });
  const releaseSubmit = () => {
    window.setTimeout(() => {
      pressingSubmit = false;
    }, 300);
  };
  document.addEventListener('pointerup', releaseSubmit);
  document.addEventListener('pointercancel', releaseSubmit);

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (!pressingSubmit && (attempted || field.value.trim())) validate(field);
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    attempted = true;
    showStatus('');

    const errors = validate();
    const firstInvalid = fields.find((field) => errors[field.name]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = values();
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      await sendMessage(data);
      showStatus(`Thank you, ${escapeHtml(data.name.trim())}. Your message has been sent and we’ll reply to ${escapeHtml(data.email.trim())} soon.`);
      form.reset();
      attempted = false;
    } catch (error) {
      const email = escapeHtml(config.contact.email);
      const fallback = `<a href="${escapeHtml(mailtoHref(data))}">email your message to ${email}</a>`;
      if (error instanceof ApiError && error.status === 501) {
        showStatus(`Online messaging isn’t connected yet, so your message has <strong>not</strong> been sent. Your text is still in the form – you can ${fallback} instead.`);
      } else {
        showStatus(`Sorry, your message could not be sent right now. Please try again later or ${fallback}.`, { isError: true });
        console.warn('[contact] Message could not be sent.', error);
      }
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send';
    }
  });
}

export function initContactForms(scope = document) {
  qsa('[data-contact-form]', scope).forEach(initContactForm);
}
