<template>
  <div class="dashboard">
    <!-- 顶部标题与时间 -->
    <header class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
          <el-icon class="home-icon"><House /></el-icon>
          翻墙监控驾驶舱
        </el-breadcrumb-item>
        <el-breadcrumb-item>驾驶舱总览</el-breadcrumb-item>
        <span class="timestamp">{{ now }}</span>
      </el-breadcrumb>
    </header>

    <!-- 导出按钮 -->
    <div class="export-bar">
      <el-button size="small" type="primary" @click="exportUsers">
        <el-icon><Download /></el-icon>
        导出用户信息
      </el-button>
    </div>

    <!-- 实时统计卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :span="6" v-for="metric in metrics" :key="metric.label">
        <el-card class="metric-card" shadow="never">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-value">{{ metric.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表区：翻墙流量趋势 & VPN 使用趋势 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="trendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="vpnTrendChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高危分类饼图 & 学院翻墙热力图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="categoryPieChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div ref="deptHeatMap" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 事件列表 -->
    <el-row :gutter="20" class="tables-row">
      <el-col :span="24">
        <el-card shadow="never">
          <el-table :data="recentEvents" style="width: 100%" height="300">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="user" label="用户" width="180" />
            <el-table-column prop="ip" label="IP 地址" width="180" />
            <el-table-column prop="category" label="翻墙类型" width="180" />
            <!-- 新增列：访问类型 -->
            <el-table-column prop="pie" label="访问类型" width="180" />
            <!-- 新增列：学院 -->
            <el-table-column prop="college" label="所属学院" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" type="danger" @click="block(scope.row)">阻断</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 导入 Vue 的响应式 API
import { ref, onMounted } from 'vue'
// 导入 axios 用于与后端交互
import axios from 'axios'

// 导入 echarts 所需模块
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent
} from 'echarts/components'

// 引入 Element Plus 图标
import { House, Download } from '@element-plus/icons-vue'

// 注册 ECharts 使用的组件
echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent
])

// 实时更新时间
const now = ref(new Date().toLocaleString())
setInterval(() => (now.value = new Date().toLocaleString()), 1000)

// 仪表盘四个关键指标
const metrics = ref([
  { label: '实时会话数', value: 0 },
  { label: '今日翻墙次数', value: 0 },
  { label: '阻断次数', value: 0 },
  { label: '高危用户数', value: 0 }
])

// 最近翻墙事件表格数据
const recentEvents = ref([])

// 图表绑定的 DOM ref
const trendChart = ref(null)
const vpnTrendChart = ref(null)
const categoryPieChart = ref(null)
const deptHeatMap = ref(null)

// 导出用户信息为 CSV 文件
function exportUsers() {
  const header = '时间,用户,IP地址,翻墙类型,访问类型,所属学院\n'
  const rows = recentEvents.value
    .map(u => `${u.time},${u.user},${u.ip},${u.category},${u.pie},${u.college}`)
    .join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `user-info-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// 阻断用户请求
function block(row) {
  console.log('🚫 阻断用户:', row)
  axios.post('/api/dashboard/block', {
    user: row.user,
    ip: row.ip
  }).then(() => {
    alert(`用户 ${row.user} 已阻断`)
  }).catch(err => {
    alert('阻断失败: ' + err)
  })
}

// 页面加载时拉取数据并初始化图表
onMounted(async () => {
  // 拉取顶部关键指标数据
  const metricsRes = await axios.get('/api/dashboard/metrics')
  metrics.value = [
    { label: '实时会话数', value: metricsRes.data.sessions },
    { label: '今日翻墙次数', value: metricsRes.data.tunnelCountToday },
    { label: '阻断次数', value: metricsRes.data.blockCount },
    { label: '高危用户数', value: metricsRes.data.dangerousUsers }
  ]

  // 获取最近翻墙事件列表
  const eventsRes = await axios.get('/api/dashboard/recent-events')
  recentEvents.value = eventsRes.data

  // 并发获取图表所需数据
  const [trendRes, vpnRes, pieRes, deptRes] = await Promise.all([
    axios.get('/api/dashboard/tunnel-traffic-trend'),   //趋势图
    axios.get('/api/dashboard/vpn-trend'),              //vpn趋势
    axios.get('/api/dashboard/category-distribution'),  //分类饼图
    axios.get('/api/dashboard/college-tunnel-stats')
  ])

  // 初始化翻墙流量趋势图
  const trend = echarts.init(trendChart.value)
  trend.setOption({
    backgroundColor: 'transparent',
    title: { text: '翻墙流量趋势', left: 'center', textStyle: { color: '#333' } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trendRes.data.x },
    yAxis: { type: 'value', name: 'MB' },
    series: [{
      name: '流量(MB)',
      type: 'line',
      smooth: true,
      data: trendRes.data.y,
      lineStyle: { width: 2, color: '#409EFF' },
      areaStyle: { opacity: 0.08, color: '#409EFF' }
    }]
  })

  // VPN 连接趋势图
  const vpnTrend = echarts.init(vpnTrendChart.value)
  vpnTrend.setOption({
    backgroundColor: 'transparent',
    title: { text: 'VPN 使用趋势', left: 'center', textStyle: { color: '#333' } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: vpnRes.data.x },
    yAxis: { type: 'value', name: '连接数' },
    series: [{
      name: 'VPN 连接数',
      type: 'line',
      smooth: true,
      data: vpnRes.data.y,
      lineStyle: { width: 2, color: '#e67e22' },
      areaStyle: { opacity: 0.08, color: '#e67e22' }
    }]
  })

  // 高危访问分类饼图
  const pieChart = echarts.init(categoryPieChart.value)
  pieChart.setOption({
    backgroundColor: 'transparent',
    title: { text: '高危访问分类分布', left: 'center', textStyle: { color: '#333' } },
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      name: '类型',
      type: 'pie',
      radius: ['40%', '70%'],
      data: pieRes.data
    }]
  })

  // 学院翻墙热力图（柱状图）
  const heat = echarts.init(deptHeatMap.value)
  heat.setOption({
    backgroundColor: 'transparent',
    title: { text: '各学院翻墙行为热度', left: 'center', textStyle: { color: '#333' } },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: deptRes.data.map(i => i.name),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: '次数' },
    series: [{
      name: '翻墙次数',
      type: 'bar',
      data: deptRes.data.map(i => i.value),
      barWidth: '55%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ff7875' },
          { offset: 1, color: '#ffd666' }
        ])
      }
    }]
  })
})


</script>

<style scoped>
.dashboard {
  background: linear-gradient(145deg, #f0f2f5, #e5e9f2);
  min-height: 100vh;
  color: #333;
  padding: 1rem;
  box-sizing: border-box;
}
.breadcrumb-wrapper {
  margin-bottom: 12px;
  background: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.export-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.timestamp {
  font-size: 0.875rem;
  color: #666;
  margin-left: 16px;
  align-self: center;
}
.metric-card {
  background: #fff;
  border: 1px solid #dcdfe6;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.metric-label {
  font-size: 1rem;
  color: #666;
}
.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
  color: #409EFF;
}
.chart {
  width: 100%;
  height: 320px;
}
.el-card {
  background: #fff !important;
  border: 1px solid #dcdfe6 !important;
}
</style>