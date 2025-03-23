
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface DashboardStats {
  totalCandidates: number
  activeJobs: number
  interviewsScheduled: number
}

interface Activity {
  id: number
  type: string
  title: string
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: Activity[]
}

// Fetch dashboard data using Nuxt's useFetch composable
const { data: dashboardData, pending, error } = await useFetch<DashboardData>('/api/dashboard')

// Helper function to format stat keys
const formatKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1')
    .split(/(?=[A-Z])/)
    .join(' ')
    .toLowerCase()
}
</script>


<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div v-if="pending" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">Error loading dashboard data</div>
    <div v-else class="space-y-6">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="(value, key) in dashboardData?.stats"
             :key="key"
             class="p-4 bg-white rounded-lg shadow">
          <h3 class="text-gray-600 capitalize">{{ formatKey(key) }}</h3>
          <p class="text-2xl font-semibold">{{ value }}</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul class="space-y-2">
          <li v-for="activity in dashboardData?.recentActivity"
              :key="activity.id"
              class="flex items-center gap-2">
            <span class="text-gray-600">{{ activity.title }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>