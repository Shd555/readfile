<template>
  <div class="incident-response-wrapper">
    <!-- 面包屑导航 -->
    <header class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
          <el-icon class="home-icon"><House /></el-icon>
          翻墙监控驾驶舱
        </el-breadcrumb-item>
        <el-breadcrumb-item>联动与处置</el-breadcrumb-item>
      </el-breadcrumb>
    </header>

    <!-- 区域筛选 -->
    <div class="zone-filter" style="margin-bottom: 16px;">
      <el-radio-group v-model="selectedZone" @change="filterUsers">
        <el-radio-button label="全部" />
        <el-radio-button label="教学区" />
        <el-radio-button label="生活区" />
      </el-radio-group>
    </div>

    <!-- 主体内容 -->
    <div class="incident-response">
      <!-- 搜索栏：分字段搜索 -->
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <el-input
          v-model="searchName"
          placeholder="姓名"
          clearable
          style="max-width: 240px;"
          @keyup.enter="fetchOnlineUsers"
        />
        <el-input
          v-model="searchId"
          placeholder="学号"
          clearable
          style="max-width: 240px;"
          @keyup.enter="fetchOnlineUsers"
        />
        <el-input
          v-model="searchPhone"
          placeholder="手机号"
          clearable
          style="max-width: 240px;"
          @keyup.enter="fetchOnlineUsers"
        />
        <el-button type="primary" icon="Search" @click="fetchOnlineUsers">搜索</el-button>
      </div>

      <!-- 在线用户表格 -->
      <el-table
        :data="filteredUsers"
        stripe
        style="width: 100%"
        height="300"
        @row-click="selectUser"
      >
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="studentId" label="学号" width="200" />
        <el-table-column prop="phone" label="手机号" width="200" />
        <el-table-column prop="ip" label="IP 地址" width="200" />
        <el-table-column prop="device" label="设备" width="200" />
        <el-table-column prop="zone" label="区域" />
        <el-table-column prop="status" label="状态" width="200" />
      </el-table>

      <!-- 操作区 -->
      <div v-if="activeUser" class="action-panel">
        <h3>当前选择：{{ activeUser.username }} ({{ activeUser.ip }})</h3>

        <el-space wrap style="margin-bottom: 12px;">
          <!-- 深澜套餐调整 -->
          <el-select v-model="newPackage" placeholder="选择套餐" style="width: 160px;">
            <el-option label="异常套餐 A（深澜）" value="pkg_abnormal_a" />
            <el-option label="异常套餐 B（深澜）" value="pkg_abnormal_b" />
          </el-select>
          <el-button type="warning" @click="updatePackage" :loading="loading.package">修改深澜套餐</el-button>

          <!-- 派网封堵与解封 -->
          <el-button type="danger" @click="handleBlock" :loading="loading.block">派网封堵</el-button>
          <el-button type="success" @click="unblockUser" :loading="loading.unblock">解除封堵</el-button>
          <el-button type="danger" @click="disconnectUser" :loading="loading.disconnect">下线用户</el-button>

          <!-- 校务网整改 -->
          <el-button type="primary" @click="openRectification">发起校务网整改</el-button>
        </el-space>
      </div>
    </div>

    <!-- 整改抽屉 -->
    <el-drawer v-model="rectDrawer" title="发起整改流程" direction="rtl" size="400">
      <el-form :model="rectForm" label-width="90px">
        <el-form-item label="整改说明">
          <el-input v-model="rectForm.remark" type="textarea" rows="4" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="rectForm.deadline" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rectDrawer = false">取消</el-button>
        <el-button type="primary" @click="submitRectification" :loading="loading.rect">提交</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
// 引入 vue 工具和 Element Plus 提示组件
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟在线用户数据
const onlineUsers = ref([
  {
    username: '张三', ip: '10.1.2.3', device: 'Windows', zone: '教学区', status: '在线', count: 5,
    studentId: '2021012345', phone: '13800138000'
  },
  {
    username: '李四', ip: '10.1.4.5', device: 'macOS', zone: '生活区', status: '在线', count: 8,
    studentId: '2021023456', phone: '13900139000'
  },
])

// 当前选中用户对象
const activeUser = ref(null)

// 套餐选择值
const newPackage = ref('')

// 整改抽屉显示控制
const rectDrawer = ref(false)

// 整改表单
const rectForm = ref({ remark: '', deadline: '' })

// 区域选择
const selectedZone = ref('全部')

// 搜索字段
const searchName = ref('')
const searchId = ref('')
const searchPhone = ref('')

// 多条件过滤用户
const filteredUsers = computed(() => {
  let users = onlineUsers.value

  // 区域过滤
  if (selectedZone.value !== '全部') {
    users = users.filter(u => u.zone === selectedZone.value)
  }

  // 字段匹配
  if (searchName.value.trim()) {
    users = users.filter(u => u.username.includes(searchName.value.trim()))
  }
  if (searchId.value.trim()) {
    users = users.filter(u => u.studentId.includes(searchId.value.trim()))
  }
  if (searchPhone.value.trim()) {
    users = users.filter(u => u.phone.includes(searchPhone.value.trim()))
  }
  return users
})

// 各类操作加载状态
const loading = ref({
  disconnect: false,
  package: false,
  rect: false,
  block: false,
  unblock: false
})

// 搜索操作
function fetchOnlineUsers() {
  ElMessage.success('🔍 在线用户列表已刷新')
}

// 选中用户
function selectUser(row) {
  activeUser.value = row
}

// 用户下线操作
function disconnectUser() {
  loading.value.disconnect = true
  setTimeout(() => {
    loading.value.disconnect = false
    ElMessage.success('✅ 用户已下线')
  }, 1000)
}

// 派网封堵
function handleBlock() {
  loading.value.block = true
  setTimeout(() => {
    loading.value.block = false
    ElMessage.success('🚫 封堵已执行')
  }, 1000)
}

// 解封操作
function unblockUser() {
  loading.value.unblock = true
  setTimeout(() => {
    loading.value.unblock = false
    ElMessage.success('✅ 用户已解封')
  }, 1000)
}

// 套餐更新
function updatePackage() {
  if (!newPackage.value) return ElMessage.warning('请选择套餐')
  loading.value.package = true
  setTimeout(() => {
    loading.value.package = false
    ElMessage.success('📦 套餐已修改')
  }, 1000)
}

// 打开整改抽屉
function openRectification() {
  rectDrawer.value = true
}

// 提交整改操作
function submitRectification() {
  loading.value.rect = true
  setTimeout(() => {
    loading.value.rect = false
    rectDrawer.value = false
    ElMessage.success('📄 整改流程已发起')
  }, 1200)
}
</script>

<style scoped>
.breadcrumb-wrapper {
  padding: 10px 16px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}
.incident-response-wrapper {
  padding: 16px;
}
.incident-response {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.zone-filter {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 10px 16px;
}
.action-panel {
  margin-top: 16px;
  background: #f9fafc;
  padding: 12px 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}
</style>
