<template>
  <div class="container">
    <div class="breadcrumb-wrapper">
      <el-breadcrumb separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/logs/web' }">
          <el-icon class="home-icon"><House /></el-icon>
          日志管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>解密数据日志</el-breadcrumb-item>
      </el-breadcrumb>
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
        height="550px"
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
        <!-- 新增序号列，跨页连续编号 -->
        <el-table-column
          type="index"
          :index="indexMethod"
          label="序号"
          width="60"
          align="center"
        />
        <!-- 动态生成其余列 -->
        <el-table-column
          v-for="(header, index) in headers"
          :key="index"
          :prop="fields[index]"
          :label="header"
        />
      </el-table>
      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total,jumper"
          :page-size="DeclassifyLogDTO.pageSize"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
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

const DeclassifyLogDTO = reactive({
  page: 1,
  pageSize: 5,
  uid: "",
  flowId: "",
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

//+++
/** 序号生成函数：保持跨页连续编号 */
const indexMethod = (index) =>
  (WebAccessLogDTO.page - 1) * WebAccessLogDTO.pageSize + index + 1;

const handleCurrentChange = (newPage) => {
  DeclassifyLogDTO.page = newPage;
  fetchDeclassifyLogs();
};

const handleSizeChange = (newSize) => {
  WebAccessLogDTO.pageSize = newSize;
  WebAccessLogDTO.page = 1;
  fetchWebAccessLogs();
};

const choose = () => {
  WebAccessLogDTO.page = 1; // 重置页码
  fetchDeclassifyLogs();
};
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
  overflow: auto;
}
.breadcrumb-wrapper {
  margin-bottom: 12px;
  background: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
