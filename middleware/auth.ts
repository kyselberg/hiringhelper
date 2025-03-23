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
    const response = await fetch('/api/auth/verify', {
      credentials: 'include', // This is crucial for sending cookies
    });

    if (!response.ok) {
      // If verification fails, redirect to login
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  } catch (error) {
    // If there's an error (e.g., network error), redirect to login
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
});