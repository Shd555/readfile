<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <h1>网络流量分析识别系统</h1>
      </el-header>

      <el-container class="full-height">
        <el-aside :width="isCollapse ? '64px' : '220px'" class="aside full-height">
          <el-menu
            :default-active="$route.path"
            :collapse="isCollapse"
            router
            background-color="#2c3e50"
            text-color="#ffffff"
            active-text-color="#ffd04b"
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><Location /></el-icon>
                <span>日志管理</span>
              </template>
              <el-menu-item index="/logs/web">网站访问行为</el-menu-item>
              <el-menu-item index="/logs/tuwang">突网行为</el-menu-item>
              <el-menu-item index="/logs/tuwang-offline">突网行为下线日志</el-menu-item>
              <el-menu-item index="/logs/overseas">境外app使用行为</el-menu-item>
              <el-menu-item index="/logs/declassify">解密数据</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/users">
              <el-icon><IconMenu /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/system/logs">
              <el-icon><Document /></el-icon>
              <span>系统日志</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

const isCollapse = ref(false)
</script>

<style scoped>
.common-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.full-height {
  height: calc(100vh - 60px);
}

.header {
  background: #3c8dbc;
  color: #fff;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2rem;
  line-height: 60px;
  height: 60px;
}

.aside {
  background: #2c3e50;
  color: #fff;
  border-right: 1px solid #1f2d3d;
  overflow-y: auto;
}

.el-menu-item,
.el-sub-menu__title {
  color: #ffffff !important;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #1f2d3d !important;
}

.main {
  padding: 1.5rem;
  background: #fff;
  overflow-y: auto;
  height: 100%;
}
</style>
