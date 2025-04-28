import { defineStore } from 'pinia'
import { format } from 'date-fns'

export const useMetricsStore = defineStore('metrics', {
  state: () => ({
    bodyMetrics: [],
    metricDefinitions: {
      weight: { label: '体重', unit: 'kg', isGoodWhenDecreasing: true },
      bodyFat: { label: '体脂率', unit: '%', isGoodWhenDecreasing: true },
      visceralFat: { label: '内脏脂肪指数', unit: '', isGoodWhenDecreasing: true },
      muscleRate: { label: '肌肉率', unit: '%', isGoodWhenDecreasing: false },
      protein: { label: '蛋白质', unit: '%', isGoodWhenDecreasing: false },
      waterRate: { label: '水分率', unit: '%', isGoodWhenDecreasing: false },
      bodyAge: { label: '身体年龄', unit: '岁', isGoodWhenDecreasing: true },
      boneMass: { label: '骨量', unit: 'kg', isGoodWhenDecreasing: false },
      bmr: { label: '基础代谢', unit: 'kcal', isGoodWhenDecreasing: false },
      bmi: { label: '体质指数', unit: '', isGoodWhenDecreasing: true },
    }
  }),
  
  getters: {
    getLatestMetrics() {
      return this.bodyMetrics.length > 0 ? this.bodyMetrics[0] : null
    },
    
    getRecentMetrics() {
      return [...this.bodyMetrics]
        .slice(1, 8)  // 获取最近7次记录
        .map(metric => ({
          ...metric,
          label: format(new Date(metric.date), 'MM月dd日')
        }));
    },
    
    getPreviousMetrics() {
      const latest = this.getLatestMetrics
      if (!latest || this.bodyMetrics.length <= 1) return null
      
      const latestDate = new Date(latest.date)
      const latestHour = latestDate.getHours()
      
      // 定义时间段
      const getPeriod = (hour) => {
        if (hour >= 5 && hour < 9) return 'morning'    // 早上: 5:00-8:59
        if (hour >= 9 && hour < 13) return 'noon'      // 中午: 9:00-12:59
        if (hour >= 13 && hour < 18) return 'afternoon' // 下午: 13:00-17:59
        if (hour >= 18 && hour < 22) return 'evening'   // 晚上: 18:00-21:59
        return 'night'                                  // 凌晨/夜间: 22:00-4:59
      }
      
      const latestPeriod = getPeriod(latestHour)
      const latestYMD = format(latestDate, 'yyyy-MM-dd')
      
      for (let i = 1; i < this.bodyMetrics.length; i++) {
        const current = this.bodyMetrics[i]
        const currentDate = new Date(current.date)
        const currentHour = currentDate.getHours()
        const currentPeriod = getPeriod(currentHour)
        const currentYMD = format(currentDate, 'yyyy-MM-dd')
        
        // 如果是同一天但不同时间段，或者是不同天，则返回该记录
        if (
          (currentYMD === latestYMD && currentPeriod !== latestPeriod) ||
          currentYMD !== latestYMD
        ) {
          return current
        }
      }
      
      return null
    },
    
    getDateLabels() {
      return [...this.bodyMetrics].reverse().map(metric => format(new Date(metric.date), 'yyyy年MM月dd日'))
    },
    
    getMetricComparisons() {
      const latest = this.getLatestMetrics
      const previous = this.getPreviousMetrics
      
      if (!latest || !previous) return []
      
      const comparisons = []
      
      for (const [key, definition] of Object.entries(this.metricDefinitions)) {
        if (key === 'id' || key === 'date') continue
        
        const currentValue = latest[key]
        const previousValue = previous[key]
        const absoluteChange = currentValue - previousValue
        const percentChange = (absoluteChange / previousValue) * 100
        
        comparisons.push({
          key,
          label: definition.label,
          unit: definition.unit,
          currentValue,
          previousValue,
          absoluteChange,
          percentChange,
          isPositiveChange: definition.isGoodWhenDecreasing ? absoluteChange < 0 : absoluteChange > 0
        })
      }
      
      return comparisons
    },
    
    getMetricHistoryData() {
      const metricHistory = {}
      
      Object.keys(this.metricDefinitions).forEach(key => {
        if (key !== 'id' && key !== 'date') {
          metricHistory[key] = [...this.bodyMetrics].reverse().map(metric => metric[key])
        }
      })
      
      return metricHistory
    }
  },
  
  actions: {
    addMetrics(newMetrics) {
      const id = this.bodyMetrics.length > 0 
        ? Math.max(...this.bodyMetrics.map(m => m.id)) + 1 
        : 1
        
      this.bodyMetrics.push({
        id,
        ...newMetrics
      })
    }
  }
})