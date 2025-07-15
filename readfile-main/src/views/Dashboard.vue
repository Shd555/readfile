<template>
  <div class="dashboard-all-in-one">
    <overview-cards :data="overviewData" />
    <flow-monitor :data="flowData" />
    <user-analysis :users="userList" @viewDetail="viewUser" />
    <alarm-center :alarms="alarmList" />
    <rectification-flow :records="rectificationRecords" />
    <trend-board :trend-data="trendData" :heat-map="heatMapData" />
    <log-export :logs="logData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const overviewData = ref([])
const flowData = ref([])
const userList = ref([])
const alarmList = ref([])
const rectificationRecords = ref([])
const trendData = ref([])
const heatMapData = ref([])
const logData = ref([])

function viewUser(user) {
  console.log('查看用户详情:', user)
}

onMounted(() => {
  overviewData.value = [
    { title: '今日翻墙人次', value: 38 },
    { title: '本月累计翻墙', value: 642 },
    { title: '当前异常用户', value: 5 },
    { title: '待整改人数', value: 12 },
  ]

  flowData.value = Array.from({ length: 24 }, (_, i) => ({
    timestamp: `${i}:00`,
    value: Math.floor(Math.random() * 100 + 50)
  }))

  userList.value = [
    { name: '张三', ip: '10.1.1.12' },
    { name: '李四', ip: '10.1.1.34' },
    { name: '王五', ip: '10.1.1.56' }
  ]

  alarmList.value = [
    { time: '2025-07-15 12:00', user: '张三', type: '涉政访问' },
    { time: '2025-07-15 12:10', user: '李四', type: 'VPN异常' },
  ]

  rectificationRecords.value = [
    { title: '发起整改', desc: '由学工部发起整改流程' },
    { title: '提交审核', desc: '二级学院提交确认材料' },
    { title: '等待解封', desc: '等待管理员手动解封' },
  ]

  trendData.value = Array.from({ length: 7 }, (_, i) => ({
    date: `07-${i + 10}`,
    value: Math.floor(Math.random() * 200)
  }))

  heatMapData.value = [
    { name: 'United States', value: 130 },
    { name: 'Singapore', value: 85 },
    { name: 'Russia', value: 40 }
  ]

  logData.value = [
    { time: '2025-07-15 11:00', user: 'admin', action: '下线', detail: '用户张三因翻墙被下线' },
    { time: '2025-07-15 11:30', user: 'admin', action: '发起整改', detail: '发起用户王五整改流程' }
  ]
})
</script>

<script>
export default {
  components: {
    OverviewCards: {
      props: ['data'],
      template: `
        <div class='cards'>
          <div class='card' v-for='item in data' :key='item.title'>
            <div class='value'>{{ item.value }}</div>
            <div class='label'>{{ item.title }}</div>
          </div>
        </div>`
    },
    FlowMonitor: {
      props: ['data'],
      template: `<div class='chart'>[流量图] {{ data.length }} 条</div>`
    },
    UserAnalysis: {
      props: ['users'],
      emits: ['viewDetail'],
      template: `
        <table>
          <tr><th>姓名</th><th>IP</th><th>操作</th></tr>
          <tr v-for='u in users' :key='u.ip'>
            <td>{{ u.name }}</td><td>{{ u.ip }}</td>
            <td><button @click="$emit('viewDetail', u)">详情</button></td>
          </tr>
        </table>`
    },
    AlarmCenter: {
      props: ['alarms'],
      template: `<ul><li v-for='a in alarms' :key='a.time'>[告警] {{ a.user }} - {{ a.type }}</li></ul>`
    },
    RectificationFlow: {
      props: ['records'],
      template: `<ol><li v-for='r in records' :key='r.title'>{{ r.title }}: {{ r.desc }}</li></ol>`
    },
    TrendBoard: {
      props: ['trendData', 'heatMap'],
      template: `<div>[趋势图: {{ trendData.length }}] [热图: {{ heatMap.length }}]</div>`
    },
    LogExport: {
      props: ['logs'],
      template: `<div>[日志导出] 共 {{ logs.length }} 条</div>`
    }
  }
}
</script>

<style scoped>
.dashboard-all-in-one {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  color: #fff;
}
.cards {
  display: flex;
  gap: 1rem;
}
.card {
  background: #222;
  padding: 1rem;
  border-radius: 8px;
  width: 120px;
  text-align: center;
}
.value {
  font-size: 1.5rem;
  color: #0ff;
}
.label {
  font-size: 0.9rem;
  color: #aaa;
}
</style>