<template>
  <div class="overflow-hidden metric-card mt-8">
    <h3 class="text-xl font-bold mb-4">所有测量数据</h3>
    <div class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-amber-100">
            <th class="py-2 px-4 text-left">日期</th>
            <th v-for="(definition, key) in metricDefinitions" :key="key" class="py-2 px-4 text-left">
              {{ definition.label }} ({{ definition.unit }})
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="metric in metrics" :key="metric.id" class="border-b border-gray-300 hover:bg-amber-50">
            <td class="py-2 px-4">{{ formatDate(metric.date) }}</td>
            <td v-for="(definition, key) in metricDefinitions" :key="key" class="py-2 px-4 text-right">
              {{ formatValue(metric[key]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns';

defineProps({
  metrics: {
    type: Array,
    required: true
  },
  metricDefinitions: {
    type: Object,
    required: true
  }
});

function formatValue(value) {
  return typeof value === 'number' ? Number(value).toFixed(2) : value;
}

function formatDate(dateString) {
  return format(new Date(dateString), 'yyyy年MM月dd日');
}
</script>