<template>
  <div class="metric-card" :class="[className]">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
});
</script>