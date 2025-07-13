<template>
  <div class="container">
    <div class="page-header">
      <h1>突网行为下线日志</h1>
    </div>

    <!-- 搜索条件 -->
    <div class="filter-box">
      <label>
        流ID：<input type="text" v-model="TunnelOfflineLogDTO.flowId" placeholder="模糊匹配" />
      </label>
      <label>
        下线时间：<input type="date" v-model="TunnelOfflineLogDTO.offlineTime" />
      </label>
      <el-button size="small" class="filter-btn" @click="choose">筛选</el-button>
      <el-button size="small" type="primary" class="export-btn" @click="exportToCSV">导出</el-button>
    </div>

    <!-- 文件上传 -->
    <label class="custom-upload-btn">点击选择文件
      <input type="file" accept=".txt" @change="onFileChange" hidden />
    </label>

    <!-- 上传状态 -->
    <p v-if="uploading">正在上传...</p>
    <p v-if="uploadError" class="error">{{ uploadError }}</p>

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
          layout="prev, pager, next"
          :current-page="TunnelOfflineLogDTO.page"
          :page-size="TunnelOfflineLogDTO.pageSize"
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
const TunnelOfflineLogDTO = reactive({
  page: 1,
  pageSize: 5,
  uid: "",
  flowId: "",
  offlineTime: "",
});

const tableData = ref([]);
const total = ref(10);
const headers = ["流ID", "下线时间", "流总大小"];
const fields = ["flowId", "offlineTime", "totalBytes"];

const handleCurrentChange = (newPage) => {
  TunnelOfflineLogDTO.page = newPage;
  fetchTunnelOfflineLogs();
};

const choose = () => {
  fetchTunnelOfflineLogs();
};

const fetchTunnelOfflineLogs = async () => {
  try {
    const res = await axios.post(
      "http://localhost:8080/TunnelOfflineLog/list",
      TunnelOfflineLogDTO
    );
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
      "http://localhost:8080/TunnelOfflineLog/export",
      TunnelOfflineLogDTO,
      {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const contentDisposition = response.headers["content-disposition"];
    let fileName = "导出突网行为下线日志.xlsx";
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
  } catch (error) {
    console.error("导出失败:", error);
  }
};

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post(
      "http://localhost:8080/TunnelOfflineLog/parse",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    TunnelOfflineLogDTO.uid = res.data.data;
    fetchTunnelOfflineLogs();
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

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
