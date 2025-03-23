import { defineNuxtRouteMiddleware } from '#app';
import { useAuthStore } from '@/stores/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Skip middleware for public routes
  if (publicRoutes.includes(to.path)) {
    return;
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Store the intended destination
    authStore.setRedirectPath(to.fullPath);
    return navigateTo('/login');
  }

  // Verify token validity on the server side
  try {
    await authStore.verifyToken();
  } catch (error) {
    // If token is invalid or expired, clear auth state and redirect to login
    authStore.logout();
    authStore.setRedirectPath(to.fullPath);
    return navigateTo('/login');
  }
});