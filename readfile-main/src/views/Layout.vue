<template>
    <!-- 带 Element‑Plus 布局的整合页面 -->
    <div class="common-layout">
      <el-container>
        <!-- 顶部 -->
        <el-header class="header">文本文件处理平台</el-header>
  
        <el-container>
          <!-- 侧边栏，可放导航 -->
          <el-aside width="200px" class="aside">
            <el-menu default-active="1">
              <el-menu-item index="1">上传解析</el-menu-item>
              <el-menu-item index="2">其他功能</el-menu-item>
            </el-menu>
          </el-aside>
  
          <!-- 主内容：上传 + 表格展示组件 -->
          <el-main class="main">
            <upload-and-parse-text />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>
  
  <script setup>
  // 引入上传+解析组件
  import UploadAndParseText from './components/UploadAndParseText.vue';
  </script>
  
  <style scoped>
  .common-layout {
    min-height: 100vh;
    background: #f5f7fa;
  }
  
  .header {
    background: #409eff;
    color: #fff;
    text-align: center;
    font-size: 1.5rem;
    line-height: 60px;
  }
  
  .aside {
    background: #fff;
    border-right: 1px solid #ebeef5;
    padding: 0;
  }
  
  .main {
    padding: 1.5rem;
    background: #fff;
  }
  </style>

