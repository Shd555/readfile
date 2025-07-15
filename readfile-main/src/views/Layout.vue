<template>
    <!-- 最外层布局容器 -->
    <div class="common-layout">
      <!-- Element Plus 容器组件 -->
      <el-container>
  
        <!-- 顶部栏 -->
        <el-header class="header">
          <div class="header-left">
            <span class="title">网络流量分析识别系统</span>
          </div>
          <div class="header-right">
            <el-button
              icon="Menu"
              circle
              size="small"
              class="toggle-button"
              @click="isCollapse = !isCollapse"
            />
          </div>
        </el-header>
  
  
        <!-- 中间区域：侧边栏 + 主内容区域 -->
        <el-container class="full-height">
  
          <!-- 侧边菜单栏 -->
          <el-aside :width="isCollapse ? '64px' : '220px'" class="aside full-height">
            <el-menu
              :default-active="$route.path"
              :collapse="isCollapse"
              :collapse-transition="false"  
              router
              background-color="#1E282D"
              text-color="#ffffff"
              active-text-color="#ffd04b"
            >
              <!-- 日志管理子菜单 -->
              <el-sub-menu index="/logs">
                <template #title>
                  <el-icon><Location /></el-icon>
                  <span>日志管理</span>
                </template>
                <el-menu-item index="/logs/web" class="sub-menu-item">网站访问行为</el-menu-item>
                <el-menu-item index="/logs/tuwang" class="sub-menu-item">突网行为</el-menu-item>
                <el-menu-item index="/logs/tuwang-offline" class="sub-menu-item">突网行为下线日志</el-menu-item>
                <el-menu-item index="/logs/overseas" class="sub-menu-item">境外app使用行为</el-menu-item>
                <el-menu-item index="/logs/declassify" class="sub-menu-item">解密数据</el-menu-item>
              </el-sub-menu>

              <!-- 翻墙监控驾驶舱 -->
              <!-- <el-menu-item index="/dashboard">
                <el-icon><Monitor /></el-icon>
                <span>翻墙监控驾驶舱</span>
              </el-menu-item>-->
              <!-- 翻墙监控驾驶舱子菜单 -->
              <el-sub-menu index="/dashboard">
                <template #title>
                  <el-icon><Monitor /></el-icon>
                  <span>翻墙监控驾驶舱</span>
                </template>
                <el-menu-item index="/dashboard/overview" class="sub-menu-item">驾驶舱总览</el-menu-item>
                <!-- <el-menu-item index="/dashboard/behavior" class="sub-menu-item">行为分类分析</el-menu-item> -->
                <el-menu-item index="/dashboard/realtime" class="sub-menu-item">实时监控</el-menu-item>
                <el-menu-item index="/dashboard/response" class="sub-menu-item">联动与处置</el-menu-item>
                <el-menu-item index="/dashboard/policy" class="sub-menu-item">策略与黑白名单</el-menu-item>
                <el-menu-item index="/dashboard/profile" class="sub-menu-item">用户画像</el-menu-item>
              </el-sub-menu>

  
              <!-- 系统日志 -->
              <el-menu-item index="/system/logs">
                <el-icon><Document /></el-icon>
                <span>系统日志</span>
              </el-menu-item>
  
              <!-- 系统设置 -->
              <el-menu-item index="/settings">
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </el-menu-item>
            </el-menu>
          </el-aside>
  
          <!-- 主体内容区域 -->
          <el-main class="main">
            <router-view /> <!-- 根据路由展示页面内容 -->
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>
  
  <script setup>
  // 引入响应式 API
  import { ref } from 'vue'
  
  // 引入 Element Plus 图标
  import { Document, Menu as IconMenu, Location, Setting , Monitor ,Menu} from '@element-plus/icons-vue'
  
  
  // 折叠菜单栏状态
  const isCollapse = ref(false)
  </script>
  
  <style scoped>
  /* 页面最外层布局 */
  .common-layout {
    min-height: 100vh;
    background: #f5f7fa;
  }
  
  /* 主体区域高度控制 */
  .full-height {
    height: calc(100vh - 60px);
  }
  
  /* 顶部栏样式 */
  .header {
    background: #3c8dbc;
    color: #fff;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
    height: 50px;
    line-height: 60px;
  }
  .header-left .title {
    font-weight: bold;
    line-height: 1; /* 避免影响居中 */
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .toggle-button:hover {
    /* background-color: rgba(255, 255, 255, 0.2); */
    background-color: rgba(0, 0, 0, 0.1);
    color: #fff;
  }
  
  .toggle-button {
    position: absolute;
    left: 230px; 
    top: 33px;
    transform: translateY(-50%);
    transition: background-color 0.3s ease;
  }
  
  /* 侧边栏样式 */
  .aside {
    background: #1E282D;
    color: #fff;
    border-right: 1px solid #1E282D;
    overflow-y: auto;
  }
  
  /* 菜单字体颜色强制白色 */
  .el-menu-item,
  .el-sub-menu__title {
    color: #ffffff !important;
  }
  
  /* 菜单 hover 背景 */
  .el-menu-item:hover,
  .el-sub-menu__title:hover {
    background-color: #1f2d3d !important;
  }
  
  /* 子菜单默认背景 */
  :deep(.el-menu-item.sub-menu-item) {
    background-color: #1b2c35;
  }
  
  /* 子菜单 hover 背景 */
  :deep(.el-menu-item.sub-menu-item:hover) {
    background-color: #3d566e !important;
  }
  
  /* 主体内容区域样式 */
  .main {
    padding: 1rem;
    background: #eef1f6;
    overflow-y: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  </style>
  