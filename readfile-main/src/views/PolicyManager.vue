<template>
    <div class="policy-manager">
        <header class="breadcrumb-wrapper">
        <el-breadcrumb separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/dashboard/overview' }">
            <el-icon class="home-icon"><House /></el-icon>
            翻墙监控驾驶舱
          </el-breadcrumb-item>
          <el-breadcrumb-item>策略与黑白名单</el-breadcrumb-item>

        </el-breadcrumb>
      </header>
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>策略与黑白名单管理</span>
            <el-switch v-model="globalEnable" inline-prompt active-text="启用" inactive-text="停用" />
          </div>
        </template>
  
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 策略规则管理 -->
          <el-tab-pane label="策略规则" name="rules">
            <el-button type="primary" size="small" @click="openRuleDialog">新增策略</el-button>
            <el-table :data="ruleList" style="margin-top: 12px;" stripe>
              <el-table-column prop="name" label="策略名称" />
              <el-table-column prop="condition" label="触发条件" />
              <el-table-column prop="action" label="动作" />
              <el-table-column prop="enabled" label="状态" width="90">
                <template #default="scope">
                  <el-tag :type="scope.row.enabled ? 'success' : 'info'">{{ scope.row.enabled ? '启用' : '停用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="scope">
                  <el-button size="small" @click="editRule(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRule(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
  
          <!-- 黑名单管理 -->
          <el-tab-pane label="黑名单" name="black">
            <el-upload :before-upload="beforeUpload('black')" drag>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">拖拽或 <em>点击上传</em> TXT / CSV</div>
            </el-upload>
            <el-button size="small" type="danger" style="margin: 8px 0;" @click="batchDelete('black')">批量删除</el-button>
            <el-table :data="blacklist" height="300" row-key="id" stripe @selection-change="updateSelection('black')" show-selection>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="value" label="IP / 用户 / 域名" />
              <el-table-column prop="remark" label="备注" />
            </el-table>
          </el-tab-pane>
  
          <!-- 白名单管理 -->
          <el-tab-pane label="白名单" name="white">
            <el-upload :before-upload="beforeUpload('white')" drag>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">拖拽或 <em>点击上传</em> TXT / CSV</div>
            </el-upload>
            <el-button size="small" type="danger" style="margin: 8px 0;" @click="batchDelete('white')">批量删除</el-button>
            <el-table :data="whitelist" height="300" row-key="id" stripe @selection-change="updateSelection('white')" show-selection>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="value" label="IP / 用户 / 域名" />
              <el-table-column prop="remark" label="备注" />
            </el-table>
          </el-tab-pane>
  
          <!-- 规则执行日志 -->
          <el-tab-pane label="规则执行日志" name="logs">
            <el-table :data="logsData" height="400" stripe>
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="rule" label="命中策略" />
              <el-table-column prop="target" label="目标 (用户/IP)" />
              <el-table-column prop="action" label="执行动作" />
              <el-table-column prop="result" label="结果" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
  
      <!-- 策略新增/编辑对话框 -->
      <el-dialog v-model="ruleDialog.visible" title="策略编辑" width="500px">
        <el-form :model="ruleDialog.form" label-width="90px">
          <el-form-item label="策略名称">
            <el-input v-model="ruleDialog.form.name" />
          </el-form-item>
          <el-form-item label="触发条件">
            <el-input v-model="ruleDialog.form.condition" placeholder="示例: 翻墙次数 > 5" />
          </el-form-item>
          <el-form-item label="动作">
            <el-select v-model="ruleDialog.form.action" placeholder="选择动作">
              <el-option label="阻断" value="阻断" />
              <el-option label="警告" value="警告" />
              <el-option label="限速" value="限速" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用状态">
            <el-switch v-model="ruleDialog.form.enabled" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="ruleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  
  // 全局开关
  const globalEnable = ref(true)
  
  // Tabs
  const activeTab = ref('rules')
  
  /******************* 策略规则数据 *******************/
  const ruleList = reactive([
    { id: 1, name: '翻墙次数>5', condition: '翻墙次数>5', action: '阻断', enabled: true },
    { id: 2, name: '夜间翻墙', condition: '时间段: 22:00-06:00', action: '警告', enabled: false }
  ])
  
  const ruleDialog = reactive({ visible: false, editIndex: -1, form: { id: null, name: '', condition: '', action: '', enabled: true } })
  function openRuleDialog() {
    ruleDialog.visible = true
    ruleDialog.editIndex = -1
    ruleDialog.form = { id: Date.now(), name: '', condition: '', action: '', enabled: true }
  }
  function editRule(row) {
    ruleDialog.visible = true
    ruleDialog.editIndex = ruleList.findIndex(r => r.id === row.id)
    ruleDialog.form = { ...row }
  }
  function saveRule() {
    if (ruleDialog.editIndex === -1) {
      ruleList.push({ ...ruleDialog.form })
    } else {
      ruleList[ruleDialog.editIndex] = { ...ruleDialog.form }
    }
    ruleDialog.visible = false
    ElMessage.success('策略已保存')
  }
  function deleteRule(index) {
    ruleList.splice(index, 1)
    ElMessage.success('策略已删除')
  }
  
  /******************* 黑白名单数据 *******************/
  let idCounter = 1
  const blacklist = reactive([
    { id: idCounter++, value: '10.1.2.3', remark: '违规 VPN' }
  ])
  const whitelist = reactive([
    { id: idCounter++, value: '10.2.2.2', remark: '科研 VPN' }
  ])
  const selectedRows = reactive({ black: [], white: [] })
  
  function beforeUpload(type) {
    return (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const lines = e.target.result.split(/\r?\n/).filter(Boolean)
        lines.forEach(line => {
          const list = type === 'black' ? blacklist : whitelist
          list.push({ id: idCounter++, value: line.trim(), remark: '批量导入' })
        })
        ElMessage.success('导入成功')
      }
      reader.readAsText(file)
      return false
    }
  }
  function updateSelection(type) {
    return (rows) => {
      selectedRows[type] = rows
    }
  }
  function batchDelete(type) {
    const list = type === 'black' ? blacklist : whitelist
    if (selectedRows[type].length === 0) return ElMessage.warning('请选择条目')
    selectedRows[type].forEach(row => {
      const index = list.findIndex(item => item.id === row.id)
      if (index !== -1) list.splice(index, 1)
    })
    selectedRows[type] = []
    ElMessage.success('删除成功')
  }
  
  /******************* 规则执行日志 *******************/
  const logsData = reactive([
    { time: '14:00:02', rule: '翻墙次数>5', target: '张三 (10.1.2.3)', action: '阻断', result: '成功' },
    { time: '13:50:31', rule: '夜间翻墙', target: '李四 (10.2.3.4)', action: '警告', result: '已提醒' }
  ])
  </script>
  
  <style scoped>
  .policy-manager {
    padding: 16px;
  }
  .breadcrumb-wrapper {
    margin-bottom: 12px;
    background: #fff;
    padding: 10px 16px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>