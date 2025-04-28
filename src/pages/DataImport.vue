<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
    <main class="w-full max-w-2xl mx-auto px-4">
      <HandDrawnCard>
        <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">健康数据导入</h1>
        
        <form class="flex items-center justify-center w-full" @submit.prevent>
          <label 
            for="excel-upload"
            class="group flex flex-col items-center justify-center w-full h-80 hand-drawn-border bg-amber-50 hover:bg-amber-100 cursor-pointer transition-all duration-300 hover:shadow-xl relative overflow-hidden"
            role="button"
            aria-label="上传健康数据Excel文件"
          >
            <div class="absolute inset-0 border-4 border-dashed border-gray-400 m-6 rounded-lg"></div>
            <div class="flex flex-col items-center justify-center pt-5 pb-6 z-10">
              <div class="w-20 h-20 mb-6 hand-drawn-border bg-white flex items-center justify-center" aria-hidden="true">
                <span class="text-4xl">📄</span>
              </div>
              <h2 class="mb-4 text-2xl text-gray-800 font-bold">点击或拖拽您的健康数据Excel文件到这里上传</h2>
              <p class="mb-6 text-lg text-gray-600">支持 .xlsx 格式的文件</p>
              <section class="w-full max-w-lg mx-auto px-4">
                <h3 class="text-base text-gray-600 text-center mb-4">Excel表格列名：</h3>
                <ul class="flex flex-wrap justify-center gap-2" aria-label="必需的Excel列名">
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">测量时间</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">体重(kg)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">体脂率(%)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">内脏脂肪指数</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">肌肉率(%)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">蛋白质(%)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">水分率(%)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">身体年龄</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">骨量(kg)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">基础代谢(kcal)</span></li>
                  <li><span class="px-3 py-1.5 bg-white hand-drawn-border text-sm">BMI</span></li>
                </ul>
              </section>
            </div>
            <input 
              id="excel-upload"
              type="file" 
              class="hidden" 
              accept=".xlsx"
              @change="handleFileUpload"
              aria-label="选择Excel文件"
            >
          </label>
        </form>
      </HandDrawnCard>
      
      <div 
        v-if="showSuccess" 
        class="mt-6 p-4 hand-drawn-border bg-green-100 flex items-center justify-center mx-auto"
        role="alert"
        aria-live="polite"
      >
        <p class="text-green-700 text-lg">✨ 数据保存成功！</p>
      </div>
      
      <div 
        v-if="showError" 
        class="mt-6 p-4 hand-drawn-border bg-red-100 flex items-center justify-center mx-auto"
        role="alert"
        aria-live="assertive"
      >
        <p class="text-red-700 text-lg">❌ {{ errorMessage }}</p>
      </div>
      
      <div v-if="showProgress" class="mt-6">
        <ProgressBar :progress="importProgress" label="导入进度" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { useMetricsStore } from '../stores/metricsStore';
import HandDrawnCard from '../components/HandDrawnCard.vue';
import ProgressBar from '../components/ProgressBar.vue';

const metricStore = useMetricsStore();
const router = useRouter();
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const importProgress = ref(0);
const showProgress = ref(false);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  showProgress.value = true;
  importProgress.value = 0;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      importProgress.value = 20;

      const workbook = XLSX.read(data, { type: 'array' });
      importProgress.value = 40;

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      importProgress.value = 60;

      // 验证数据格式
      if (!validateExcelData(jsonData)) {
        showError.value = true;
        errorMessage.value = 'Excel文件格式不正确，请确保包含所有必要的列';
        showProgress.value = false;
        return;
      }

      importProgress.value = 80;

      // 导入数据
      jsonData.forEach(row => {
        metricStore.addMetrics({
          date: formatExcelDate(row['测量时间']),
          weight: row['体重(kg)'],
          bodyFat: row['体脂率(%)'],
          visceralFat: row['内脏脂肪指数'],
          muscleRate: row['肌肉率(%)'],
          protein: row['蛋白质(%)'],
          waterRate: row['水分率(%)'],
          bodyAge: row['身体年龄'],
          boneMass: row['骨量(kg)'],
          bmr: row['基础代谢(kcal)'],
          bmi: row['BMI']
        });
      });

      importProgress.value = 100;
      showSuccess.value = true;
      
      setTimeout(() => {
        showSuccess.value = false;
        showProgress.value = false;
        router.push('/details');
      }, 2000);

    } catch (error) {
      showError.value = true;
      errorMessage.value = '文件处理失败，请确保文件格式正确';
      showProgress.value = false;
    }
  };
  reader.readAsArrayBuffer(file);
}

function validateExcelData(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  const requiredColumns = [
    '测量时间', '体重(kg)', '体脂率(%)', '内脏脂肪指数', '肌肉率(%)',
    '蛋白质(%)', '水分率(%)', '身体年龄', '骨量(kg)', '基础代谢(kcal)', 'BMI'
  ];
  return requiredColumns.every(col => Object.keys(data[0]).includes(col));
}

function formatExcelDate(date) {
  // 处理Excel日期格式，确保返回YYYY-MM-DD格式
  if (typeof date === 'string') {
    return date;
  }
  const d = new Date(Math.round((date - 25569) * 86400 * 1000));
  return d.toISOString().split('T')[0];
}
</script>