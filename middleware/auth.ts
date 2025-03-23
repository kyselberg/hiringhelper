import { defineNuxtRouteMiddleware } from '#app';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for public routes
  if (publicRoutes.includes(to.path)) {
    return;
  }

  try {
    // Verify authentication using the server-side verify endpoint
    await $fetch('/api/auth/verify', {
      credentials: 'include', // This is crucial for sending cookies
    });

    // If we get here, the verification was successful
    return;
  } catch (error) {
    console.error('Auth verification error:', error);
    // If there's an error (e.g., network error), redirect to login
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
});