<template>
    <div class="incident-response-wrapper">
      <!-- 面包屑导航（独立顶栏） -->
      <header class="breadcrumb-wrapper">
        <el-breadcrumb separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
            <el-icon class="home-icon"><House /></el-icon>
            翻墙监控驾驶舱
          </el-breadcrumb-item>
          <el-breadcrumb-item>联动与处置</el-breadcrumb-item>
        </el-breadcrumb>
      </header>
  
      <!-- 主体内容区 -->
      <div class="incident-response">
        <!-- 在线用户搜索栏 -->
        <el-input
          v-model="searchQuery"
          placeholder="输入用户名 / IP / 账号 搜索在线用户"
          clearable
          style="max-width: 360px; margin-bottom: 16px;"
          @keyup.enter="fetchOnlineUsers"
        >
          <template #append>
            <el-button @click="fetchOnlineUsers" icon="Search" />
          </template>
        </el-input>
  
        <!-- 在线用户列表 -->
        <el-table :data="onlineUsers" stripe style="width: 100%" height="300" @row-click="selectUser">
          <el-table-column prop="username" label="用户名" width="140" />
          <el-table-column prop="ip" label="IP 地址" width="180" />
          <el-table-column prop="device" label="设备" />
          <el-table-column prop="status" label="状态" width="120" />
        </el-table>
  
        <!-- 操作台 -->
        <div v-if="activeUser" class="action-panel">
          <h3>当前选择：{{ activeUser.username }} ({{ activeUser.ip }})</h3>
          <el-button type="danger" @click="disconnectUser" :loading="loading.disconnect">下线用户</el-button>
          <el-select v-model="newPackage" placeholder="选择异常套餐" style="width: 160px; margin: 0 8px;">
            <el-option label="异常套餐 A" value="pkg_abnormal_a" />
            <el-option label="异常套餐 B" value="pkg_abnormal_b" />
          </el-select>
          <el-button type="warning" @click="updatePackage" :loading="loading.package">修改套餐</el-button>
          <el-button type="primary" @click="openWarningPreview">预览警示页面</el-button>
          <el-button @click="openRectification">发起整改</el-button>
        </div>
      </div>
  
      <!-- 警示页面预览弹窗 -->
      <el-dialog v-model="warnDialog" title="警示页面预览" width="600">
        <div class="warning-preview">
          <h2>⚠️ 翻墙行为警示</h2>
          <p>用户：{{ activeUser?.username }} ({{ activeUser?.ip }})</p>
          <p>本月累计翻墙次数：{{ activeUser?.count }}</p>
          <p>请遵守校园网络管理规定，立即停止翻墙行为。</p>
        </div>
        <template #footer>
          <el-button @click="warnDialog = false">关闭</el-button>
        </template>
      </el-dialog>
  
      <!-- 整改流程抽屉 -->
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
  // (保持原有 setup 逻辑不变)
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const onlineUsers = ref([
    { username: '张三', ip: '10.1.2.3', device: 'Windows', status: '在线', count: 5 },
    { username: '李四', ip: '10.1.4.5', device: 'macOS', status: '在线', count: 8 },
  ])
  const searchQuery = ref('')
  const activeUser = ref(null)
  const newPackage = ref('')
  const warnDialog = ref(false)
  const rectDrawer = ref(false)
  const rectForm = ref({ remark: '', deadline: '' })
  const loading = ref({ disconnect: false, package: false, rect: false })
  
  function fetchOnlineUsers() {
    ElMessage.success('🔍 已刷新在线用户列表 (示例)')
  }
  function selectUser(row) {
    activeUser.value = row
  }
  function disconnectUser() {
    if (!activeUser.value) return
    loading.value.disconnect = true
    setTimeout(() => {
      loading.value.disconnect = false
      ElMessage.success('✅ 用户已下线')
    }, 1000)
  }
  function updatePackage() {
    if (!activeUser.value || !newPackage.value) return ElMessage.warning('请选择套餐')
    loading.value.package = true
    setTimeout(() => {
      loading.value.package = false
      ElMessage.success('📦 套餐已调整')
    }, 1000)
  }
  function openWarningPreview() {
    if (!activeUser.value) return ElMessage.warning('请先选择用户')
    warnDialog.value = true
  }
  function openRectification() {
    if (!activeUser.value) return ElMessage.warning('请先选择用户')
    rectDrawer.value = true
  }
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
    margin-bottom: 16px; /* 👉 与内容区留白 */
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
  .action-panel {
    margin-top: 16px;
    background: #f9fafc;
    padding: 12px 16px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
  }
  .warning-preview {
    text-align: center;
  }
  .warning-preview h2 {
    margin-bottom: 12px;
    color: #f56c6c;
  }
  </style>
  