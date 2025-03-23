import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  redirectPath: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState>({
    user: null,
    token: null,
    redirectPath: null,
  });

  const isAuthenticated = computed(() => !!state.value.token);

  function setUser(user: User | null) {
    state.value.user = user;
  }

  function setToken(token: string | null) {
    state.value.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  function setRedirectPath(path: string | null) {
    state.value.redirectPath = path;
  }

  async function verifyToken() {
    if (!state.value.token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${state.value.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      setUser(data.user);
      return data;
    } catch (error) {
      logout();
      throw error;
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    setRedirectPath(null);
  }

  // Initialize state from localStorage on client-side
  if (process.client) {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }

  return {
    user: computed(() => state.value.user),
    token: computed(() => state.value.token),
    redirectPath: computed(() => state.value.redirectPath),
    isAuthenticated,
    setUser,
    setToken,
    setRedirectPath,
    verifyToken,
    logout,
  };
});