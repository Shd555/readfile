<template>
  <div class="container">
    <div class="page-header">
      <h1> 网站访问行为</h1>
    </div>
    <!-- 过滤条件 -->
    <!-- <div class="filter-box">
      <label>
        开始时间：<input type="date" v-model="WebAccessLogDTO.begin" />
      </label>
      <label>
        结束时间：<input type="date" v-model="WebAccessLogDTO.end" />
      </label>
      <label style="margin-left: 10px">
        手机号：<input
          type="text"
          v-model="WebAccessLogDTO.phoneNumber"
          placeholder="模糊匹配"
        />
      </label>
      <el-button size="small" style="margin-left: 10px" @click="choose"
        >筛选</el-button
      >
      <el-button
        size="small"
        type="primary"
        @click="exportToCSV"
        style="margin-left: 10px"
        >导出</el-button
      >
    </div> -->
    <div class="filter-box">
      <label>
        开始时间：<input type="date" v-model="WebAccessLogDTO.begin" />
      </label>
      <label>
        结束时间：<input type="date" v-model="WebAccessLogDTO.end" />
      </label>
      <label>
        手机号：<input type="text" v-model="WebAccessLogDTO.phoneNumber" placeholder="模糊匹配" />
      </label>
      <el-button size="small" class="filter-btn" @click="choose">筛选</el-button>
      <el-button size="small" type="primary" class="export-btn" @click="exportToCSV">导出</el-button>
    </div>


    <!-- 文件上传 -->
    <!-- <input type="file" accept=".txt" @change="onFileChange" /> -->
    <label class="custom-upload-btn">点击选择文件
        <input type="file" accept=".txt" @change="onFileChange" hidden />
    </label>

    <!-- 上传状态 -->
    <!-- <p v-if="uploading">正在上传...</p>
    <p v-if="uploadError" class="error">{{ uploadError }}</p> -->

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



      <!-- <el-table :key="tableKey" :data="tableData" style="width: 100%">
        <el-table-column
          v-for="(header, index) in headers"
          :key="index"
          :prop="fields[index]"
          :label="header"
        />
      </el-table> -->
      <!-- 分页组件 -->
      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next"
          :current-page="WebAccessLogDTO.page"
          :page-size="WebAccessLogDTO.pageSize"
          :total="total.value"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import axios from "axios";

const tableKey = ref(0);
const WebAccessLogDTO = reactive({
  page: 1,
  pageSize: 5,
  uid: "",
  phoneNumber: "",
  begin: "",
  end: "",
});
const tableData = ref([]);
const total = ref(10);
const headers = [
  "时间",
  "手机号",
  "IMSI",
  "IMEI",
  "ADSL账号",
  "访问网站名称",
  "访问网站网址",
  "网站类型",
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
  "下行包大小(Byte)",
  "可信度",
];
const fields = [
  "time",
  "phoneNumber",
  "imsi",
  "imei",
  "adslAccount",
  "siteName",
  "siteUrl",
  "siteType",
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
  "downBytes",
  "credibility",
];



//分页
const visibleData = ref([]);
const updateVisibleData = () => {
  const start = (WebAccessLogDTO.page - 1) * WebAccessLogDTO.pageSize;
  const end = start + WebAccessLogDTO.pageSize;
  visibleData.value = allMockData.value.slice(start, end);
};

//实际代
const handleCurrentChange = (newPage) => {
  WebAccessLogDTO.page = newPage;
  // tableKey.value++
  fetchWebAccessLogs();
};

const choose = () => {
  // WebAccessLogDTO.page = 1 // 重置页码
  //   tableKey.value++
  fetchWebAccessLogs();
};

const fetchWebAccessLogs = async () => {
  try {
    const res = await axios.post(
      "http://localhost:8080/WebAccessLog/list",
      WebAccessLogDTO
    );
    tableData.value = res.data.data.records;
    total.value = res.data.data.total;
    tableKey.value++; // 每次加一，强制表格刷新
  } catch (err) {
    console.error("获取日志失败", err);
  }
};

//导出
const exportToCSV = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/WebAccessLog/export",
      WebAccessLogDTO,
      {
        responseType: "blob", // 重要，告诉axios以blob方式处理返回数据
        headers: {
          "Content-Type": "application/json",
        },
      }
    ); // 从响应头获取文件名，后端最好设置 Content-Disposition: attachment; filename=xxx.xlsx

    const contentDisposition = response.headers["content-disposition"];
    let fileName = "导出网站访问行为数据.xlsx"; // 默认文件名

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length > 1) {
        fileName = decodeURIComponent(fileNameMatch[1]);
      }
    } // 创建 blob 对象并生成下载链接

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click(); // 释放内存

    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  } catch (error) {
    console.error("导出失败:", error);
  }
};

// 上传文件
const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios.post(
      "http://localhost:8080/WebAccessLog/parse",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    WebAccessLogDTO.uid = res.data.data;

    fetchWebAccessLogs(); // 上传成功后刷新列表
  } catch (err) {}
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
