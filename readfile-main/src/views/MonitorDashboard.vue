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
              <el-table-column prop="category" label="翻墙类型" />
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
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { LineChart, BarChart, PieChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    VisualMapComponent,
  } from 'echarts/components';
  
  import { House } from '@element-plus/icons-vue';
  
  echarts.use([
    CanvasRenderer,
    LineChart,
    BarChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    VisualMapComponent,
  ]);
  
  /* 实时时间 */
  const now = ref(new Date().toLocaleString());
  setInterval(() => (now.value = new Date().toLocaleString()), 1_000);
  
  function exportUsers() {
  const header = '时间,用户,IP地址,翻墙类型,访问类型，所属学院\n';
  const rows = recentEvents.value.map(u => `${u.time},${u.user},${u.ip},${u.category},${u.pie},${u.college}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `user-info-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

  /* 实时统计数据 */
  const metrics = ref([
    { label: '实时会话数', value: 120 },
    { label: '今日翻墙次数', value: 345 },
    { label: '阻断次数', value: 56 },
    { label: '高危用户数', value: 8 },
  ]);
  
  /* 事件列表示例数据 */
  const recentEvents = ref([
    { time: '2025-07-15 14:00', user: '张三', ip: '10.1.2.3', category: 'VPN' ,pie:'涉恐',college:"计算机学院"},
    { time: '2025-07-15 13:55', user: '李四', ip: '10.1.4.5', category: 'TOR',pie:'涉暴',college:"外语学院" },
    { time: '2025-07-15 13:50', user: '王五', ip: '10.1.6.7', category: 'HTTP Proxy',pie:'涉政',college:"体育学院" },
  ]);
  
  /* Chart refs */
  const trendChart = ref(null);
  const vpnTrendChart = ref(null);
  const categoryPieChart = ref(null);
  const deptHeatMap = ref(null);
  
  onMounted(() => {
    /* 翻墙流量趋势折线图 */
    const trend = echarts.init(trendChart.value);
    trend.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '翻墙流量趋势',
        left: 'center',
        textStyle: { color: '#333' },
      },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['13:30', '13:35', '13:40', '13:45', '13:50', '13:55', '14:00'],
        axisLabel: { color: '#555' },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      yAxis: {
        type: 'value',
        name: 'MB',
        axisLabel: { color: '#555' },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      series: [
        {
          name: '流量(MB)',
          type: 'line',
          smooth: true,
          data: [120, 132, 101, 134, 90, 230, 210],
          lineStyle: { width: 2, color: '#409EFF' },
          areaStyle: { opacity: 0.08, color: '#409EFF' },
        },
      ],
    });
  
    /* VPN 使用趋势折线图 */
    const vpnTrend = echarts.init(vpnTrendChart.value);
    vpnTrend.setOption({
      backgroundColor: 'transparent',
      title: {
        text: 'VPN 使用趋势',
        left: 'center',
        textStyle: { color: '#333' },
      },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['13:30', '13:35', '13:40', '13:45', '13:50', '13:55', '14:00'],
        axisLabel: { color: '#555' },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      yAxis: {
        type: 'value',
        name: '连接数',
        axisLabel: { color: '#555' },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      series: [
        {
          name: 'VPN 连接数',
          type: 'line',
          smooth: true,
          data: [60, 72, 68, 75, 70, 120, 110],
          lineStyle: { width: 2, color: '#e67e22' },
          areaStyle: { opacity: 0.08, color: '#e67e22' },
        },
      ],
    });
  
    /* 高危分类饼图 */
    const pie = echarts.init(categoryPieChart.value);
    pie.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '高危访问分类分布',
        left: 'center',
        textStyle: { color: '#333' },
      },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: { color: '#666' },
      },
      series: [
        {
          name: '类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            color: '#333',
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 10, name: '涉政' },
            { value: 8, name: '涉恐' },
            { value: 6, name: '涉爆' },
            { value: 5, name: '邪教' },
          ],
        },
      ],
    });
  
    /* 学院翻墙热力图（柱状图模拟热度） */
    const heat = echarts.init(deptHeatMap.value);
    heat.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '各学院翻墙行为热度',
        left: 'center',
        textStyle: { color: '#333' },
      },
      tooltip: {},
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['计算机学院', '外语学院', '经管学院', '法学院', '理学院'],
        axisLabel: { color: '#555', rotate: 30 },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      yAxis: {
        type: 'value',
        name: '次数',
        axisLabel: { color: '#555' },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      visualMap: {
        show: false,
        min: 0,
        max: 100,
      },
      series: [
        {
          name: '翻墙次数',
          type: 'bar',
          data: [70, 52, 40, 32, 20],
          barWidth: '55%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ff7875' },
              { offset: 1, color: '#ffd666' },
            ]),
          },
        },
      ],
    });
  });
  
  /* 阻断操作 */
  function block(row) {
    console.log('🚫 阻断用户:', row);
    // TODO: 调用后端接口进行阻断处理
  }
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