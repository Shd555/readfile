<template>
  <div class="container">
    <!-- <div class="page-header">
      <h1>突网行为</h1>
    </div> -->
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon class="home-icon"><House /></el-icon>
          日志管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>突网行为</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 过滤条件 -->
    <div class="filter-box">
      <label>
        开始时间：<input type="date" v-model="TunnelAccessLogDTO.begin" />
      </label>
      <label>
        结束时间：<input type="date" v-model="TunnelAccessLogDTO.end" />
      </label>
      <label>
        手机号：<input type="text" v-model="TunnelAccessLogDTO.phoneNumber" placeholder="模糊匹配" />
      </label>
      <label>
        流ID：<input type="text" v-model="TunnelAccessLogDTO.flowId" placeholder="模糊匹配" />
      </label>
      <el-button size="small" type="primary" class="export-btn" @click="choose">筛选</el-button>
      <el-button size="small" type="primary" class="export-btn" @click="exportToCSV">导出</el-button>
    </div>

    <!-- 文件上传 -->
    <label class="custom-upload-btn">点击选择文件
      <input type="file" accept=".txt" @change="onFileChange" hidden />
    </label>

    <!-- 表格展示 -->
    <div class="table-wrapper">
      <el-table
        :key="tableKey"
        :data="tableData"
        height="calc(100vh - 230px)"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: 'bold' }"
        :cell-style="{ whiteSpace: 'nowrap' }"
        :highlight-current-row="true"
      >
        <el-table-column
          v-for="(header, index) in headers"
          :key="index"
          :prop="fields[index]"
          :label="header"
        />
      </el-table>

      <!-- 分页组件 -->
      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total,jumper"
          :current-page="TunnelAccessLogDTO.page"
          :page-size="TunnelAccessLogDTO.pageSize"
          :total="total.value"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";

const tableKey = ref(0);
const tableData = ref([]);
const total = ref(10);
const TunnelAccessLogDTO = reactive({
  page: 1,
  pageSize: 5,
  uid: "",
  phoneNumber: "",
  flowId: "",
  begin: "",
  end: "",
});

const headers = [
  "时间",
  "流ID", 
  "手机号", 
  "IMSI", 
  "IMEI", 
  "ADSL账号", 
  "客户端IP", 
  "服务器IP",
  "客户端地区", 
  "服务器地区", 
  "隧道类型", 
  "运营商", 
  "工具", 
  "客户端口", 
  "服务器端口",
  "上行包大小(Byte)", 
  "下行包大小(Byte)"
];
const fields = [
  "time", 
  "flowId", 
  "phoneNumber", 
  "imsi", 
  "imei", 
  "adslAccount", 
  "clientIp", 
  "serverIp",
  "clientRegion", 
  "serverRegion", 
  "tunnelType", 
  "operator", 
  "tool", 
  "clientPort", 
  "serverPort",
  "upBytes", 
  "downBytes"
];

const handleCurrentChange = (newPage) => {
  TunnelAccessLogDTO.page = newPage;
  fetchTunnelAccessLogs();
};
//+++
const handleSizeChange = (newSize) => {
  TunnelAccessLogDTO.pageSize = newSize;
  WebAccessLogDTO.page = 1;
  fetchWebAccessLogs();
};

const choose = () => {
  fetchTunnelAccessLogs();
};

const fetchTunnelAccessLogs = async () => {
  try {
    const res = await axios.post("http://localhost:8080/TunnelAccessLog/list", TunnelAccessLogDTO);
    tableData.value = res.data.data.records;
    total.value = res.data.data.total;
    tableKey.value++;
  } catch (err) {
    console.error("获取日志失败", err);
  }
};

const exportToCSV = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/TunnelAccessLog/export",
      TunnelAccessLogDTO,
      {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      }
    );

    const contentDisposition = response.headers["content-disposition"];
    let fileName = "导出突网行为日志.xlsx";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?/);
      if (match?.length > 1) fileName = decodeURIComponent(match[1]);
    }

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  } catch (err) {
    console.error("导出失败:", err);
  }
};

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post("http://localhost:8080/TunnelAccessLog/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    TunnelAccessLogDTO.uid = res.data.data;
    fetchTunnelAccessLogs();
  } catch (err) {
    console.error("上传失败", err);
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}
.breadcrumb-wrapper {
  margin-bottom: 12px;
  background: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
  padding-bottom: 10px;
}
.page-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.filter-box {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}
.filter-box label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.filter-box input[type="text"],
.filter-box input[type="date"] {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.custom-upload-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #409EFF;
  color: #fff;
  cursor: pointer;
  border-radius: 10px;
  margin-bottom: 16px;
  width: fit-content;
}

.table-wrapper {
  flex: 1;
}

.pager {
  margin-top: 10px;
  text-align: right;
}
</style>
