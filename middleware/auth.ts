import { defineNuxtRouteMiddleware } from '#app';

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for auth pages
  if (to.path === '/login' || to.path === '/register') {
    return;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return navigateTo('/login');
  }
});