<template>
  <div class="overflow-hidden hand-drawn-border bg-white p-4">
    <h3 class="text-xl font-bold mb-4">{{ title }}</h3>
    <div class="relative chart-container">
      <component
        :is="chartType"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'vue-chartjs';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  chartType: {
    type: String,
    default: 'line'
  },
  primaryUnit: {
    type: String,
    default: ''
  },
  secondaryUnit: {
    type: String,
    default: ''
  },
  labels: {
    type: Array,
    required: true
  },
  datasets: {
    type: Array,
    required: true
  }
});

// Apply hand-drawn style to charts
onMounted(() => {
  // This would be the place to use roughJS to make the chart hand-drawn
  // but for simplicity we're using regular Chart.js with styling
});

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map(dataset => ({
    ...dataset,
    borderWidth: props.chartType === 'line' ? 3 : 1,
    tension: 0.2,
    pointStyle: 'circle',
    pointRadius: 5,
    pointHoverRadius: 8,
    barThickness: props.chartType === 'bar' ? 'flex' : undefined,
    yAxisID: dataset.useSecondaryAxis ? 'y2' : 'y1'
  }))
}));

const chartType = computed(() => {
  return props.chartType === 'bar' ? Bar : Line;
});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      labels: {
        font: {
          family: "'Patrick Hand', cursive",
          size: 14
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#1f2937',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: function(context) {
          const dataset = context.dataset;
          const unit = dataset.useSecondaryAxis ? props.secondaryUnit : props.primaryUnit;
          return `${dataset.label}: ${context.parsed.y.toFixed(2)}${unit}`;
        }
      },
      bodyFont: {
        family: "'Patrick Hand', cursive"
      },
      titleFont: {
        family: "'Architects Daughter', cursive"
      }
    }
  },
  scales: {
    y1: {
      type: 'linear',
      display: true,
      position: 'left',
      ticks: {
        font: {
          family: "'Patrick Hand', cursive",
        },
        callback: function(value) {
          return value.toFixed(2);
        }
      },
      grid: {
        drawBorder: true,
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1,
        drawTicks: true
      },
      title: {
        display: true,
        text: props.primaryUnit || '',
        font: {
          family: "'Patrick Hand', cursive",
          size: 14
        }
      }
    },
    y2: {
      type: 'linear',
      display: true,
      position: 'right',
      ticks: {
        font: {
          family: "'Patrick Hand', cursive",
        },
        callback: function(value) {
          return value.toFixed(2);
        }
      },
      grid: {
        drawBorder: true,
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1,
        drawTicks: true
      },
      title: {
        display: true,
        text: props.secondaryUnit || '',
        font: {
          family: "'Patrick Hand', cursive",
          size: 14
        }
      }
    },
    x: {
      ticks: {
        font: {
          family: "'Patrick Hand', cursive",
        }
      },
      grid: {
        display: false
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>