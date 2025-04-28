<template>
  <div class="w-full">
    <div class="relative pt-1">
      <div class="flex mb-2 items-center justify-between">
        <div>
          <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
            {{ label }}
          </span>
        </div>
        <div class="text-right">
          <span class="text-xs font-semibold inline-block text-amber-600">
            {{ progress }}%
          </span>
        </div>
      </div>
      <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-200">
        <div
          :style="{ width: `${progress}%` }"
          class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: '处理进度'
  }
});
</script>