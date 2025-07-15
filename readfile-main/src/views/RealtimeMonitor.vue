<template>
    <div class="realtime-monitor">
        <!-- 顶部标题与时间 -->
      <header class="breadcrumb-wrapper">
        <el-breadcrumb separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
            <el-icon class="home-icon"><House /></el-icon>
            翻墙监控驾驶舱
          </el-breadcrumb-item>
          <el-breadcrumb-item>实时监控</el-breadcrumb-item>
        </el-breadcrumb>
      </header>
      <!-- 实时日志流 + 控制按钮 -->
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="never" header="Kafka 实时日志流">
            <div class="log-controls">
              <el-button-group>
                <el-button size="small" @click="scrollPaused = !scrollPaused">
                  <el-icon>
                    <component :is="scrollPaused ? CaretRight : VideoPause" />
                  </el-icon>
                  {{ scrollPaused ? '恢复滚动' : '暂停滚动' }}
                </el-button>
                <el-button size="small" @click="downloadLogs">
                  <el-icon><Download /></el-icon>
                  导出日志
                </el-button>
              </el-button-group>
            </div>
            <div class="log-stream" ref="logContainer">
              <div v-for="(log, idx) in logs" :key="idx" class="log-line">{{ log }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" header="高危行为监测">
            <div ref="warningChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 异常会话 + 告警设置 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="16">
          <el-card shadow="never" header="异常会话列表">
            <el-table :data="sessionData" height="300" stripe>
              <el-table-column prop="time" label="时间" width="150" />
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="ip" label="IP 地址" width="150" />
              <el-table-column prop="risk" label="风险等级" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.risk === '高' ? 'danger' : 'warning'">
                    {{ scope.row.risk }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="proto" label="协议" width="120" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never" header="告警推送设置">
            <el-form label-width="100px" :model="alarmConfig" @change="saveAlarmConfig">
              <el-form-item label="邮件告警">
                <el-switch v-model="alarmConfig.email" />
              </el-form-item>
              <el-form-item label="短信告警">
                <el-switch v-model="alarmConfig.sms" />
              </el-form-item>
              <el-form-item label="钉钉告警">
                <el-switch v-model="alarmConfig.dingtalk" />
              </el-form-item>
              <el-form-item label="阈值(次数)">
                <el-input-number v-model="alarmConfig.threshold" :min="1" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveAlarmConfig">保存</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import * as echarts from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { LineChart } from 'echarts/charts'
  import { TooltipComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
  import { ElMessage } from 'element-plus'
  import { CaretRight, VideoPause, Download } from '@element-plus/icons-vue'
  
  echarts.use([
    CanvasRenderer,
    LineChart,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    TitleComponent
  ])
  
  const logs = ref([])
  const logContainer = ref(null)
  const scrollPaused = ref(false)
  let logCounter = 0
  function pushLog() {
    const now = new Date().toLocaleTimeString()
    logs.value.push(`[${now}] 模拟日志条目 ${++logCounter}`)
    if (logs.value.length > 100) logs.value.shift()
    if (!scrollPaused.value) {
      nextTick(() => {
        const el = logContainer.value
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
  function downloadLogs() {
    const blob = new Blob([logs.value.join('\n')], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `realtime-logs-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  
  const warningChart = ref(null)
  function initWarningChart() {
    const chart = echarts.init(warningChart.value)
    chart.setOption({
      title: { text: '高危行为次数(最近10分钟)', left: 'center', textStyle: { color: '#333' } },
      tooltip: { trigger: 'axis' },
      grid: { left: '6%', right: '4%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 10 }, (_, i) => `${i * 1}min`),
        axisLabel: { color: '#555' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#555' },
        splitLine: { lineStyle: { color: '#eee' } },
      },
      series: [
        {
          name: '高危行为数',
          type: 'line',
          data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 10) + 1),
          areaStyle: { opacity: 0.08 },
          lineStyle: { width: 2, color: '#f56c6c' },
        },
      ]
    })
  }
  
  const sessionData = ref([
    { time: '14:03:12', user: '张三', ip: '10.1.2.3', risk: '高', proto: 'SS' },
    { time: '14:02:07', user: '李四', ip: '10.1.4.5', risk: '中', proto: 'TOR' },
  ])
  
  const alarmConfig = reactive({ email: true, sms: false, dingtalk: true, threshold: 5 })
  function saveAlarmConfig() {
    ElMessage.success('告警配置已保存 (示例)')
  }
  
  onMounted(() => {
    initWarningChart()
    setInterval(pushLog, 1500)
    setInterval(initWarningChart, 10000)
  })
  </script>
  
  <style scoped>
  .realtime-monitor {
    padding: 16px;
  }
  .breadcrumb-wrapper {
    margin-bottom: 12px;
    background: #fff;
    padding: 10px 16px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  .log-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }
  .log-stream {
    height: 300px;
    overflow-y: auto;
    background: #0d1117;
    color: #c9d1d9;
    font-family: monospace;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #30363d;
  }
  .log-line {
    white-space: pre-wrap;
    font-size: 13px;
  }
  .chart {
    width: 100%;
    height: 300px;
  }
  </style>
  