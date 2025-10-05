const KEY = 'userId';
const EMAIL_KEY = 'userEmail';
const NAME_KEY = 'userName';

export function getUserId() {
  return localStorage.getItem(KEY);
}

export function setUserSession({ id, email, name }) {
  localStorage.setItem(KEY, id);
  if (email) localStorage.setItem(EMAIL_KEY, email);
  if (name) localStorage.setItem(NAME_KEY, name);
}

export function clearUserSession() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getUserSummary() {
  return {
    id: localStorage.getItem(KEY),
    email: localStorage.getItem(EMAIL_KEY),
    name: localStorage.getItem(NAME_KEY),
  };
}