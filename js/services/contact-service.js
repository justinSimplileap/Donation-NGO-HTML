import { isValidEmail } from '../core/validation.js';
import { apiClient } from './api-client.js';

const NAME_MAX_LENGTH = 80;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 2000;

/** Returns a map of field name → message for invalid fields (empty when valid). */
export function validateContact({ name = '', surname = '', email = '', message = '' }) {
  const errors = {};
  const first = name.trim();
  const last = surname.trim();
  const mail = email.trim();
  const body = message.trim();

  if (!first) errors.name = 'Please enter your name.';
  else if (first.length > NAME_MAX_LENGTH) errors.name = `Please use ${NAME_MAX_LENGTH} characters or fewer.`;

  if (last.length > NAME_MAX_LENGTH) errors.surname = `Please use ${NAME_MAX_LENGTH} characters or fewer.`;

  if (!mail) errors.email = 'Please enter your email address.';
  else if (!isValidEmail(mail)) errors.email = 'Please enter a valid email address, like name@example.com.';

  if (!body) errors.message = 'Please write a message.';
  else if (body.length < MESSAGE_MIN_LENGTH) errors.message = `Please write at least ${MESSAGE_MIN_LENGTH} characters.`;
  else if (body.length > MESSAGE_MAX_LENGTH) errors.message = `Please keep your message under ${MESSAGE_MAX_LENGTH} characters.`;

  return errors;
}

/**
 * Sends the message to the backend `contact` resource.
 * Without a configured backend the API client rejects with a 501 ApiError – nothing is sent or stored.
 */
export async function sendMessage({ name, surname, email, message }) {
  return apiClient.post('contact', {
    name: name.trim(),
    surname: surname.trim(),
    email: email.trim(),
    message: message.trim(),
  });
}
