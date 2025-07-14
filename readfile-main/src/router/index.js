import { createRouter, createWebHistory } from 'vue-router'
import UploadAndParseText from '../views/UploadAndParseText.vue'
import TuWangBehaviorUpload from '../views/TuWangBehaviorUpload.vue'
import TuWangLogOff from '../views/TuWangLogOff.vue'
import OverseasUsage from '../views/OverseasUsage.vue'
import DeclassifyLog from '../views/DeclassifyLog.vue'

const routes = [
  { path: '/logs', redirect: '/logs/web' },
  { path: '/logs/web', component: UploadAndParseText },
  { path: '/logs/tuwang', component: TuWangBehaviorUpload },
  { path: '/logs/tuwang-offline', component: TuWangLogOff },
  { path: '/logs/overseas', component: OverseasUsage },
  { path: '/logs/declassify', component: DeclassifyLog },
  { path: '/users', component: { template: '<div>用户管理模块</div>' } },
  { path: '/system/logs', component: { template: '<div>系统日志模块</div>' } },
  { path: '/settings', component: { template: '<div>系统设置模块</div>' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
