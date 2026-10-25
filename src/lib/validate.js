const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const RULES = {
  name: (v) => (!v.trim() ? 'Please tell me your name.' : v.trim().length < 2 ? 'That looks a bit short.' : v.length > 80 ? 'Keep it under 80 characters.' : ''),
  email: (v) => (!v.trim() ? 'I need an email to reply to.' : !EMAIL.test(v.trim()) ? "That email doesn't look right." : ''),
  message: (v) => (!v.trim() ? 'Write a short message.' : v.trim().length < 20 ? `A little more detail, please (${20 - v.trim().length} more characters).` : v.length > 1500 ? 'Please keep it under 1500 characters.' : ''),
};

export const validateAll = (values) =>
  Object.fromEntries(Object.entries(RULES).map(([k, fn]) => [k, fn(values[k] ?? '')]));
