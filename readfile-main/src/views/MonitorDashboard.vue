<template>
    <div class="dashboard">
      <!-- 顶部标题与时间 -->
      <!-- <header class="dashboard-header">
        <h1>翻墙监控驾驶舱</h1>
        <span class="timestamp">{{ now }}</span>
      </header> -->

      <header class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon class="home-icon"><House /></el-icon>
          翻墙监控驾驶舱
        </el-breadcrumb-item>
        <span class="timestamp">{{ now }}</span>
        <!-- <el-breadcrumb-item>网站访问行为</el-breadcrumb-item> -->
      </el-breadcrumb>
    </header>
  
      <!-- 核心指标区 -->
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="6" v-for="metric in metrics" :key="metric.label">
          <el-card class="metric-card" shadow="never">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }}</div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 图表区 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :span="12">
          <el-card shadow="never">
            <div ref="trendChart" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <div ref="topUsersChart" class="chart"></div>
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
              <el-table-column prop="" label="操作" width="120">
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
  import { LineChart, BarChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
  } from 'echarts/components';
  
  echarts.use([
    CanvasRenderer,
    LineChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
  ]);
  
  const now = ref(new Date().toLocaleString());
  setInterval(() => (now.value = new Date().toLocaleString()), 1_000);
  
  const metrics = ref([
    { label: '实时会话数', value: 120 },
    { label: '今日翻墙次数', value: 345 },
    { label: '阻断次数', value: 56 },
    { label: '高危用户数', value: 8 },
  ]);
  
  const recentEvents = ref([
    { time: '2025-07-15 14:00', user: '张三', ip: '10.1.2.3', category: 'VPN' },
    { time: '2025-07-15 13:55', user: '李四', ip: '10.1.4.5', category: 'TOR' },
    { time: '2025-07-15 13:50', user: '王五', ip: '10.1.6.7', category: 'HTTP Proxy' },
  ]);
  
  const trendChart = ref(null);
  const topUsersChart = ref(null);
  
  onMounted(() => {
    const trend = echarts.init(trendChart.value);
    trend.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '翻墙流量趋势',
        textStyle: { color: '#333' },
        left: 'center',
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
          areaStyle: { opacity: 0.05, color: '#409EFF' },
        },
      ],
    });
  
    const top = echarts.init(topUsersChart.value);
    top.setOption({
      backgroundColor: 'transparent',
      title: {
        text: 'Top5 翻墙用户',
        textStyle: { color: '#333' },
        left: 'center',
      },
      tooltip: { trigger: 'item' },
      xAxis: {
        type: 'category',
        data: ['张三', '李四', '王五', '赵六', '孙七'],
        axisLabel: { color: '#555' },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#555' },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLine: { lineStyle: { color: '#ccc' } },
      },
      series: [
        {
          name: '次数',
          type: 'bar',
          data: [34, 29, 25, 22, 18],
          barWidth: '50%',
          itemStyle: { color: '#67C23A' },
        },
      ],
    });
  });
  
  function block(row) {
    console.log('Blocking user', row);
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
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #dcdfe6;
  }
  
  .timestamp {
    font-size: 0.875rem;
    color: #666;
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
  