import { apiRequest, clearStoredToken, clearStoredUser, setStoredToken, setStoredUser } from './apiClient';

export async function login({ email, password }) {
  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const { token, user } = payload.data;
  setStoredToken(token);
  setStoredUser(user);

  return { token, user };
}

export async function getMe() {
  const payload = await apiRequest('/auth/me');
  const { user } = payload.data;
  setStoredUser(user);

  return user;
}

export function clearSession() {
  clearStoredToken();
  clearStoredUser();
}
