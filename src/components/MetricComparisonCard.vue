<template>
  <HandDrawnCard className="h-full flex flex-col">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="text-xl font-bold mb-2">{{ metric.label }}</h3>
        <div class="text-3xl font-semibold">
          {{ formatValue(metric.currentValue) }} <span class="text-sm">{{ metric.unit }}</span>
        </div>
        <div v-if="metric.previousValue !== null" class="mt-2 text-gray-600 text-sm">
          上次：{{ formatValue(metric.previousValue) }} {{ metric.unit }}
        </div>
      </div>
      
      <div v-if="metric.previousValue !== null" class="flex items-center ml-4">
        <div 
          class="flex flex-col items-end" 
          :class="getChangeClass(metric)"
        >
          <span class="text-2xl mb-1">
            {{ getChangeArrow(metric.absoluteChange) }}
          </span>
          <div class="text-right">
            <template v-if="metric.absoluteChange !== 0">
              <div>{{ formatValue(Math.abs(metric.absoluteChange)) }} {{ metric.unit }}</div>
              <div class="text-sm">({{ formatValue(Math.abs(metric.percentChange)) }}%)</div>
            </template>
            <template v-else>
              <div class="text-gray-600">无变化</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </HandDrawnCard>
</template>

<script setup>
import HandDrawnCard from './HandDrawnCard.vue';

defineProps({
  metric: {
    type: Object,
    required: true
  }
});

function formatValue(value) {
  return Number(value).toFixed(2);
}

function getChangeClass(metric) {
  if (metric.absoluteChange === 0) return 'unchanged';
  return metric.isPositiveChange ? 'increase' : 'decrease';
}

function getChangeArrow(change) {
  if (change === 0) return '→';
  return change > 0 ? '↑' : '↓';
}
</script>