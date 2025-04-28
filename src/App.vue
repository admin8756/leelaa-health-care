<template>
  <div class="min-h-screen paper-bg">
    <header class="py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
      <h1 class="text-3xl md:text-4xl font-bold mb-4 md:mb-0">Leelaa Health Care</h1>
      <nav class="flex space-x-4">
        <router-link to="/import" class="nav-link" active-class="active">数据导入</router-link>
        <router-link to="/details" class="nav-link" active-class="active">数据详情</router-link>
      </nav>
    </header>
    
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="py-6 px-4 text-center text-gray-600">
      <p>© 2025 Leelaa Health Care - 您的健康数据一站式管理</p>
    </footer>
  </div>
</template>

<script setup>
// App component
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>