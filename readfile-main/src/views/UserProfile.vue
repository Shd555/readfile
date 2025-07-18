<template>
  <div class="user-profile">
    <!-- 顶部标题与时间 -->
    <header class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
          <el-icon class="home-icon"><House /></el-icon>
          翻墙监控驾驶舱
        </el-breadcrumb-item>
        <el-breadcrumb-item>用户画像</el-breadcrumb-item>
      </el-breadcrumb>
    </header>

    <!-- 搜索栏：姓名 / 学号 / 手机号 -->
    <div class="search-inputs">
      <!-- <el-input
        v-model="query.name"
        placeholder="请输入用户名"
        clearable
        style="max-width: 240px; margin-right: 10px;"
      /> -->
      <el-input
        v-model="query.studentId"
        placeholder="请输入学号"
        clearable
        style="max-width: 240px; margin-right: 10px;"
      />
      <el-input
        v-model="query.phone"
        placeholder="请输入手机号"
        clearable
        style="max-width: 240px; margin-right: 10px;"
      />
      <el-button @click="searchUser" icon="Search">搜索</el-button>
    </div>

    <!-- 用户基本信息卡片 -->
    <el-card v-if="user" shadow="hover" class="user-info">
      <h3>👤 用户基本信息</h3>
      <p>用户名：{{ user.name }}</p>
      <p>IP 地址：{{ user.ip }}</p>
      <p>设备类型：{{ user.device }}</p>
      <p>最近登录：{{ user.lastLogin }}</p>
      <p>风险等级：<el-tag :type="user.risk === '高' ? 'danger' : 'warning'">{{ user.risk }}</el-tag></p>
      <p>学号：{{ user.studentId }}</p>
      <p>手机号：{{ user.phone }}</p>
      <p>学院：{{ user.college }}</p>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 协议使用分布图 -->
      <el-col :span="12">
        <el-card header="使用协议分布">
          <div ref="protocolChart" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 热点访问分类图 -->
      <el-col :span="12">
        <el-card header="访问类别分布">
          <div ref="categoryChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为时间线图 -->
    <el-card header="用户行为时间线" style="margin-top: 20px;">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timeline"
          :key="index"
          :timestamp="item.time"
          :type="item.type"
          placement="top"
        >
          {{ item.event }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Search } from '@element-plus/icons-vue';

const query = ref({ name: '', studentId: '', phone: '' })
const user = ref(null)
const protocolChart = ref(null)
const categoryChart = ref(null)
const timeline = ref([])

function searchUser() {
  // 模拟条件匹配（可换成后端接口）
  if (
    // query.value.name === '张三' ||
    query.value.studentId === '2021123456' ||
    query.value.phone === '13812345678'
  ) {
    user.value = {
      name: '张三',
      ip: '10.1.2.3',
      device: 'Windows 10',
      lastLogin: '2025-07-15 13:45',
      risk: '高',
      studentId: '2021123456',
      phone: '13812345678',
      college: '计算机学院'
    }
    timeline.value = [
      { time: '13:45', event: '登录系统', type: 'success' },
      { time: '13:50', event: '访问境外站点 Google', type: 'warning' },
      { time: '13:55', event: '触发告警规则：VPN连接', type: 'danger' }
    ]
    nextTick(() => {
      renderProtocolChart()
      renderCategoryChart()
    })
  } else {
    user.value = null
    timeline.value = []
  }
}

function renderProtocolChart() {
  const chart = echarts.init(protocolChart.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      top: '3%',
      left: 'center',
      type: 'scroll',
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        name: '协议使用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12
        },
        labelLine: {
          length: 10,
          length2: 15
        },
        data: [
          { value: 40, name: 'VPN' },
          { value: 30, name: 'TOR' },
          { value: 20, name: 'SS' },
          { value: 10, name: 'HTTP Proxy' }
        ]
      }
    ]
  })
}

function renderCategoryChart() {
  const chart = echarts.init(categoryChart.value)
  chart.setOption({
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['社交', '加密货币', '开发者论坛', '邮件', '其他']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [30, 25, 18, 10, 8],
        type: 'bar',
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  })
}
</script>

<style scoped>
.user-profile {
  padding: 16px;
}
.breadcrumb-wrapper {
  margin-bottom: 12px;
  background: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.search-inputs {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.user-info {
  margin-bottom: 20px;
  line-height: 1.8;
}
.chart {
  width: 100%;
  height: 300px;
}
</style>
