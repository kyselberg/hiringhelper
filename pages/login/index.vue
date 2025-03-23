<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases based on status code
      error.value = data.message || 'Login failed';
      return;
    }

    // Store auth data in the store
    authStore.setToken(data.body.token);
    authStore.setUser(data.body.user);

    // Redirect to dashboard or stored redirect path
    const redirectPath = authStore.redirectPath || '/dashboard';
    console.log(redirectPath);
    router.push(redirectPath);
  } catch (err: unknown) {
    // Handle network errors or JSON parsing errors
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      error.value = 'Network error. Please check your connection and try again.';
    } else {
      error.value = 'An unexpected error occurred. Please try again later.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your email and password to access your account.</CardDescription>
      </CardHeader>
      <form @submit.prevent="handleSubmit">
        <CardContent>
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <div v-if="error" class="text-sm text-red-500">
              {{ error }}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            class="w-full"
            :disabled="isLoading"
          >
            <template v-if="isLoading">
              <svg
                class="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Logging in...</span>
            </template>
            <span v-else>Log in</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>