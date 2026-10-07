import { qs, qsa } from '../core/dom.js';
import { config } from '../config.js';
import {
  FREQUENCY_LABELS,
  PaymentUnavailableError,
  createDonation,
  formatAmount,
  isPaymentAvailable,
  parseAmount,
  submitDonation,
  validateDonor,
} from '../services/donation-service.js';

const DONOR_FIELDS = ['firstName', 'lastName', 'email'];

/**
 * Multi-step donation form: amount → donor details → payment method.
 * Markup contract: [data-donation-form] with [data-step] fieldsets (data-title = step heading).
 * Nothing typed here is stored or logged; the payload is only handed to the payment service.
 */
export function initDonationForm(form) {
  const steps = qsa('[data-step]', form);
  const title = qs('[data-donation-title]', form);
  const backButton = qs('[data-donation-back]', form);
  const progress = qs('[data-donation-progress]', form);
  const progressBar = qs('[data-donation-progress-bar]', form);
  const announcer = qs('[data-donation-announcer]', form);
  const amountButtons = qsa('[data-amount]', form);
  const customInput = form.elements.customAmount;
  const submitButton = qs('[data-donation-submit]', form);
  const submitLabel = qs('[data-donation-submit-label]', form);
  const status = qs('[data-donation-status]', form);
  const statusText = qs('[data-donation-status-text]', form);
  const causeNote = qs('[data-cause-note]', form);
  const causeName = qs('[data-cause-name]', form);
  const summary = Object.fromEntries(qsa('[data-summary]', form).map((el) => [el.dataset.summary, el]));

  const state = {
    step: 0,
    presetCents: null,
    cause: null,
    frequency: 'once',
    pending: false,
  };

  /* ---------- Helpers ---------- */
  const announce = (message) => {
    announcer.textContent = '';
    window.setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  };

  const setError = (name, message, input) => {
    const error = qs(`[data-error="${name}"]`, form);
    error.textContent = message || '';
    error.hidden = !message;
    if (input) input.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const hasCustomAmount = () => customInput.value.trim() !== '';

  const currentAmount = () => {
    if (hasCustomAmount()) return parseAmount(customInput.value);
    if (state.presetCents) return { cents: state.presetCents };
    return parseAmount('');
  };

  const updateSummary = () => {
    const { cents } = currentAmount();
    const amountText = cents ? formatAmount(cents) : '—';
    summary.amount.textContent = amountText;
    summary.total.textContent = amountText;
    summary.frequency.textContent = FREQUENCY_LABELS[state.frequency];
    summary.cause.textContent = state.cause?.title ?? '';
    summary.cause.closest('[data-summary-row]').hidden = !state.cause;
  };

  const hideStatus = () => {
    status.hidden = true;
    statusText.replaceChildren();
  };

  /* ---------- Steps ---------- */
  const goTo = (index, { moveFocus = true } = {}) => {
    state.step = index;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    const heading = steps[index].dataset.title;
    title.textContent = heading;
    backButton.hidden = index === 0;
    progressBar.style.width = `${(index / (steps.length - 1)) * 100}%`;
    progress.setAttribute('aria-valuenow', String(index + 1));
    progress.setAttribute('aria-valuetext', `Step ${index + 1} of ${steps.length}: ${heading}`);
    hideStatus();
    if (moveFocus) {
      title.focus();
      announce(`Step ${index + 1} of ${steps.length}: ${heading}`);
    }
  };

  /* ---------- Amount ---------- */
  const selectPreset = (button) => {
    amountButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    state.presetCents = button ? Math.round(Number(button.dataset.amount) * 100) : null;
    if (button) {
      customInput.value = '';
      customInput.classList.remove('is-selected');
      setError('amount', '', customInput);
    }
    updateSummary();
  };

  const validateAmount = () => {
    const result = currentAmount();
    setError('amount', result.error, hasCustomAmount() ? customInput : null);
    if (!hasCustomAmount()) customInput.setAttribute('aria-invalid', 'false');
    return result;
  };

  amountButtons.forEach((button) => {
    button.addEventListener('click', () => selectPreset(button));
  });

  customInput.addEventListener('input', () => {
    const typed = hasCustomAmount();
    if (typed) selectPreset(null);
    customInput.classList.toggle('is-selected', typed);
    if (!qs('[data-error="amount"]', form).hidden) setError('amount', '', customInput);
    updateSummary();
  });

  /* Validating on blur during a click inside the form would shift the clicked button mid-click;
     the Next button (or a preset) handles that case instead. */
  let pointerInForm = false;
  form.addEventListener('pointerdown', () => {
    pointerInForm = true;
  });
  /* Touch browsers blur the input just after pointerup, so reset a little later. */
  const releasePointer = () => {
    window.setTimeout(() => {
      pointerInForm = false;
    }, 300);
  };
  document.addEventListener('pointerup', releasePointer);
  document.addEventListener('pointercancel', releasePointer);

  customInput.addEventListener('blur', () => {
    if (hasCustomAmount() && !pointerInForm) validateAmount();
  });

  /* ---------- Donor ---------- */
  const donorValues = () => Object.fromEntries(DONOR_FIELDS.map((name) => [name, form.elements[name].value]));

  DONOR_FIELDS.forEach((name) => {
    form.elements[name].addEventListener('input', () => setError(name, '', form.elements[name]));
  });

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    if (state.step === 0) {
      const { error } = validateAmount();
      if (error) {
        (hasCustomAmount() ? customInput : amountButtons[0]).focus();
        announce(error);
        return;
      }
      goTo(1);
      return;
    }

    if (state.step === 1) {
      const errors = validateDonor(donorValues());
      DONOR_FIELDS.forEach((name) => setError(name, errors[name], form.elements[name]));
      const firstInvalid = DONOR_FIELDS.find((name) => errors[name]);
      if (firstInvalid) {
        form.elements[firstInvalid].focus();
        announce(errors[firstInvalid]);
        return;
      }
      goTo(2);
    }
  };

  qsa('[data-donation-next]', form).forEach((button) => button.addEventListener('click', handleNext));
  backButton.addEventListener('click', () => goTo(Math.max(0, state.step - 1)));

  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.target.tagName !== 'INPUT' || state.step === steps.length - 1) return;
    if (event.target.type === 'radio') return;
    event.preventDefault();
    handleNext();
  });

  /* ---------- Payment ---------- */
  const methodInputs = qsa('[name="paymentMethod"]', form);
  const syncMethodPanels = () => {
    methodInputs.forEach((input) => {
      qs(`[data-method-panel="${input.value}"]`, form).hidden = !input.checked;
    });
  };
  methodInputs.forEach((input) => input.addEventListener('change', syncMethodPanels));

  qs('[data-payment-notice]', form).hidden = isPaymentAvailable();

  const showStatus = (message) => {
    const email = config.donations.contactEmail;
    const link = document.createElement('a');
    link.href = `mailto:${email}`;
    link.textContent = email;
    statusText.replaceChildren(message, ' To give today, please email ', link, '.');
    status.hidden = false;
    announce(statusText.textContent);
  };

  const setPending = (pending) => {
    state.pending = pending;
    submitButton.setAttribute('aria-disabled', String(pending));
    submitLabel.textContent = pending ? 'Please wait…' : 'Donate now';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.step < steps.length - 1) {
      handleNext();
      return;
    }
    if (state.pending) return;

    const { cents, error } = currentAmount();
    const donorErrors = validateDonor(donorValues());
    if (error || Object.keys(donorErrors).length > 0) {
      goTo(error ? 0 : 1);
      handleNext();
      return;
    }

    hideStatus();
    setPending(true);
    try {
      const donation = createDonation({
        cents,
        frequency: state.frequency,
        cause: state.cause,
        donor: donorValues(),
        paymentMethod: methodInputs.find((input) => input.checked)?.value ?? null,
      });
      await submitDonation(donation);
    } catch (err) {
      showStatus(
        err instanceof PaymentUnavailableError
          ? 'Online donations aren’t switched on yet, so nothing has been charged and your details haven’t been sent or saved.'
          : 'We couldn’t start the payment, and nothing has been charged.',
      );
    } finally {
      setPending(false);
    }
  });

  /* ---------- Public API ---------- */
  const setCause = (cause) => {
    state.cause = cause ?? null;
    causeName.textContent = state.cause?.title ?? '';
    causeNote.hidden = !state.cause;
    updateSummary();
  };

  qs('[data-cause-clear]', form).addEventListener('click', () => {
    setCause(null);
    announce('Your donation will go where it’s needed most.');
    const pressed = amountButtons.find((button) => button.getAttribute('aria-pressed') === 'true');
    (pressed ?? customInput).focus();
  });

  const setAmount = (cents) => {
    const preset = amountButtons.find((button) => Math.round(Number(button.dataset.amount) * 100) === cents);
    if (preset) {
      selectPreset(preset);
      return;
    }
    selectPreset(null);
    customInput.value = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
    customInput.classList.add('is-selected');
    updateSummary();
  };

  const focusForm = () => {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    title.focus({ preventScroll: true });
  };

  selectPreset(amountButtons.find((button) => button.getAttribute('aria-pressed') === 'true') ?? null);
  syncMethodPanels();
  goTo(0, { moveFocus: false });

  return { setCause, setAmount, focusForm };
}
