<template>
  <div class="container">
    <div class="page-header">
      <h1>解密数据日志</h1>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-box">
      <label>
        开始时间：<input type="date" v-model="DeclassifyLogDTO.begin" />
      </label>
      <label>
        结束时间：<input type="date" v-model="DeclassifyLogDTO.end" />
      </label>
      <label>
        流ID：<input type="text" v-model="DeclassifyLogDTO.flowId" placeholder="模糊匹配" />
      </label>
      <label>
        手机号：<input type="text" v-model="DeclassifyLogDTO.phoneNumber" placeholder="模糊匹配" />
      </label>
      <el-button size="small" class="filter-btn" @click="fetchDeclassifyLog">筛选</el-button>
      <el-button size="small" type="primary" class="export-btn" @click="exportToCSV">导出</el-button>
    </div>

    <!-- 文件上传 -->
    <label class="custom-upload-btn">点击选择文件
      <input type="file" accept=".txt" @change="onFileChange" hidden />
    </label>

    <!-- 表格展示 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        height="calc(100vh - 250px)"
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";

const tableKey = ref(0);
const tableData = ref([]);
const total = ref(10);

const DeclassifyLogDTO = reactive({
  page: 1,
  pageSize: 5,
  uid: null,
  flowId: null,
  phoneNumber: "",
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
  "客户端端口",
  "服务器IP",
  "服务器端口",
  "客户端地区",
  "服务器地区",
  "原始文件名",
  "包号",
  "网络协议",
  "应用层协议",
  "应用层信息",
  "主机名信息",
];

const fields = [
  "time",
  "flowId",
  "phoneNumber",
  "imsi",
  "imei",
  "adslAccount",
  "clientIp",
  "clientPort",
  "serverIp",
  "serverPort",
  "clientRegion",
  "serverRegion",
  "originalFileName",
  "packetIndex",
  "networkProtocol",
  "appProtocol",
  "appInfo",
  "hostName",
];

const fetchDeclassifyLog = async () => {
  try {
    const res = await axios.post("http://localhost:8080/DeclassifyLog/list", DeclassifyLogDTO);
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
      "http://localhost:8080/DeclassifyLog/export",
      DeclassifyLogDTO,
      {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      }
    );

    let fileName = "导出解密数据日志数据.xlsx";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?/);
      if (fileNameMatch?.length > 1) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    }

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
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
    const res = await axios.post("http://localhost:8080/DeclassifyLog/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    DeclassifyLogDTO.uid = res.data.data;
    fetchDeclassifyLog();
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
  overflow: auto;
}
</style>
