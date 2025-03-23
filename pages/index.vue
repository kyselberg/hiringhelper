<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-8">shadcn-vue Demo</h1>

    <div class="space-y-4">
      <div class="flex gap-4">
        <UiButton>Default Button</UiButton>
        <UiButton variant="destructive">Destructive Button</UiButton>
        <UiButton variant="outline">Outline Button</UiButton>
        <UiButton variant="secondary">Secondary Button</UiButton>
        <UiButton variant="ghost">Ghost Button</UiButton>
        <UiButton variant="link">Link Button</UiButton>
      </div>

      <div class="flex gap-4">
        <UiButton size="sm">Small Button</UiButton>
        <UiButton size="default">Default Size</UiButton>
        <UiButton size="lg">Large Button</UiButton>
        <UiButton size="icon">👋</UiButton>
      </div>
    </div>
  </div>
</template>