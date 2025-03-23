import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export function useLogout() {
  const authStore = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state and redirect to login
      authStore.logout();
      router.push('/login');
    }
  };

  return {
    logout,
  };
}