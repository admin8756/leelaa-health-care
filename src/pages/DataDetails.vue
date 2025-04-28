<template>
  <div>
    <section>
      <h2 class="flex justify-between items-center mb-6">
        <span class="text-2xl font-bold">身体指标概览</span>
        <div v-if="metricStore.getRecentMetrics.length > 1" class="flex space-x-2">
          <button
            v-for="(metric, index) in metricStore.getRecentMetrics"
            :key="metric.id"
            @click="selectedComparisonIndex = index"
            class="hand-drawn-button text-sm"
            :class="{ 'bg-amber-200': selectedComparisonIndex === index }"
          >
            {{ metric.label }}
          </button>
        </div>
      </h2>
      
      <div v-if="metricStore.getRecentMetrics.length > 1" class="text-lg font-normal text-gray-600 flex items-center justify-end mb-4">
        <span>{{ formatDateTime(metricStore.getLatestMetrics?.date) }}</span>
        <span class="mx-2">⟹</span>
        <span>{{ formatDateTime(selectedComparisonMetric?.date) }}</span>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="comparison in metricComparisons" :key="comparison.key">
          <MetricComparisonCard :metric="comparison" />
        </div>
      </div>
    </section>
    
    <!-- Overall trend chart -->
    <section class="mt-12">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">整体进度</h2>
        <div class="flex space-x-2">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            class="hand-drawn-button"
            :class="{ 'bg-amber-200': selectedPeriod === period.value }"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <MetricChart 
        chartType="line"
        primaryUnit="kg"
        secondaryUnit="%"
        :labels="filteredDateLabels" 
        :datasets="filteredOverallDatasets" 
      />
    </section>
    
    <!-- Individual metric charts -->
    <section class="mt-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">详细指标</h2>
        <div class="flex space-x-2">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            @click="selectedDetailPeriod = period.value"
            class="hand-drawn-button"
            :class="{ 'bg-amber-200': selectedDetailPeriod === period.value }"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      
      <div class="space-y-8">
        <div v-for="(metricData, key) in individualCharts" :key="key">
          <h3 class="text-xl mb-3">{{ metricStore.metricDefinitions[key].label }}</h3>
          <MetricChart 
            :title="`${metricStore.metricDefinitions[key].label}进度`"
            :chartType="getChartType(key)"
            :primaryUnit="metricStore.metricDefinitions[key].unit"
            :labels="filteredDetailDateLabels" 
            :datasets="[getFilteredMetricData(key)]" 
          />
        </div>
      </div>
    </section>
    
    <!-- Data table -->
    <section class="mt-12">
      <MetricsTable 
        :metrics="metricStore.bodyMetrics" 
        :metric-definitions="metricStore.metricDefinitions" 
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import { useMetricsStore } from '../stores/metricsStore';
import MetricComparisonCard from '../components/MetricComparisonCard.vue';
import MetricChart from '../components/MetricChart.vue';
import MetricsTable from '../components/MetricsTable.vue';

const timePeriods = [
  { label: '最近一周', value: 'week' },
  { label: '最近一月', value: 'month' },
  { label: '最近一年', value: 'year' },
  { label: '全部', value: 'all' }
];

const selectedPeriod = ref('week');
const selectedDetailPeriod = ref('week');
const selectedComparisonIndex = ref(0);  // 默认选择最新记录
const metricStore = useMetricsStore();

// 选中的对比数据
const selectedComparisonMetric = computed(() => {
  return metricStore.getRecentMetrics[selectedComparisonIndex.value];
});

// Get comparison data for the cards
const metricComparisons = computed(() => {
  const latest = metricStore.getLatestMetrics;
  const comparison = selectedComparisonMetric.value;
  
  if (!latest || !comparison) return [];
  
  return Object.entries(metricStore.metricDefinitions)
    .filter(([key]) => key !== 'id' && key !== 'date')
    .map(([key, definition]) => {
      const currentValue = latest[key];
      const previousValue = comparison[key];
      const absoluteChange = currentValue - previousValue;
      const percentChange = (absoluteChange / previousValue) * 100;
      
      return {
        key,
        label: definition.label,
        unit: definition.unit,
        currentValue,
        previousValue,
        absoluteChange,
        percentChange,
        isPositiveChange: definition.isGoodWhenDecreasing ? absoluteChange < 0 : absoluteChange > 0
      };
    });
});

function formatDateTime(date) {
  return date ? format(new Date(date), 'yyyy年MM月dd日 HH:mm:ss') : '';
}

// 详细指标的过滤数据
const filteredDetailMetrics = computed(() => {
  const now = new Date();
  const metrics = [...metricStore.bodyMetrics].reverse();
  
  switch (selectedDetailPeriod.value) {
    case 'week':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 7 * 24 * 60 * 60 * 1000;
      });
    case 'month':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 30 * 24 * 60 * 60 * 1000;
      });
    case 'year':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 365 * 24 * 60 * 60 * 1000;
      });
    default:
      return metrics;
  }
});

// 详细指标的日期标签
const filteredDetailDateLabels = computed(() => 
  filteredDetailMetrics.value.map(metric => format(new Date(metric.date), 'yyyy年MM月dd日'))
);

// 根据选择的时间段过滤数据
const filteredMetrics = computed(() => {
  const now = new Date();
  const metrics = [...metricStore.bodyMetrics].reverse();
  
  switch (selectedPeriod.value) {
    case 'week':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 7 * 24 * 60 * 60 * 1000;
      });
    case 'month':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 30 * 24 * 60 * 60 * 1000;
      });
    case 'year':
      return metrics.filter(metric => {
        const date = new Date(metric.date);
        return (now - date) <= 365 * 24 * 60 * 60 * 1000;
      });
    default:
      return metrics;
  }
});

// 获取过滤后的日期标签
const filteredDateLabels = computed(() => 
  filteredMetrics.value.map(metric => format(new Date(metric.date), 'yyyy年MM月dd日'))
);

// Create datasets for overall chart
const filteredOverallDatasets = computed(() => {
  const colorPalette = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(201, 203, 207, 0.7)'
  ];
  
  return Object.entries(metricStore.metricDefinitions)
    .filter(([key]) => key !== 'id' && key !== 'date')
    .map(([key, definition], index) => {
      const data = filteredMetrics.value.map(metric => Number(metric[key]).toFixed(2));
      const useSecondaryAxis = definition.unit === '%';
      
      return {
        label: `${definition.label}`,
        data,
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length].replace('0.7', '0.1'),
        useSecondaryAxis
      };
    });
});

// Create datasets for individual charts
const individualCharts = computed(() => {
  const result = {};
  const colorPalette = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(201, 203, 207, 0.7)'
  ];
  
  Object.entries(metricStore.metricDefinitions)
    .filter(([key]) => key !== 'id' && key !== 'date')
    .forEach(([key, definition], index) => {
      const data = [...metricStore.bodyMetrics].reverse().map(metric => metric[key]);
      
      result[key] = {
        label: `${definition.label}`,
        data,
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length].replace('0.7', '0.1')
      };
    });
  
  return result;
});

// Get filtered data for individual metrics
function getFilteredMetricData(key) {
  const colorPalette = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(201, 203, 207, 0.7)'
  ];
  
  const index = Object.keys(metricStore.metricDefinitions)
    .filter(k => k !== 'id' && k !== 'date')
    .indexOf(key);
  
  return {
    label: metricStore.metricDefinitions[key].label,
    data: filteredDetailMetrics.value.map(metric => metric[key]),
    borderColor: colorPalette[index % colorPalette.length],
    backgroundColor: colorPalette[index % colorPalette.length].replace('0.7', '0.1')
  };
}
function getChartType(metricKey) {
  // 使用柱状图显示的指标
  const barChartMetrics = ['bodyAge', 'bmr', 'bmi', 'visceralFat'];
  return barChartMetrics.includes(metricKey) ? 'bar' : 'line';
}
</script>