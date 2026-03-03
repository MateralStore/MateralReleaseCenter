/// <reference types="vite/client" />
import { DefaultRequestAdapter } from '@microsoft/kiota-bundle'
import { createRCDSAPI, type RCDSAPI } from './RCDSAPI/rCDSAPI'
import { createRCESAPI, type RCESAPI } from './RCESAPI/rCESAPI'
import { createRCSCAPI, type RCSCAPI } from './RCSCAPI/rCSCAPI'
import { ZhiTuAuthenticationProvider } from './AuthenticationProvider'

// 网关基础地址
export let GATEWAY_BASE_URL = ''

// 创建认证提供者
const authenticationProvider = new ZhiTuAuthenticationProvider()

export let rcscApiClient : RCSCAPI;

/**
 * 创建 RCES API 客户端
 * @param apiPath 环境中心服务的 API 路径（如 MRCESAPI）
 */
export function createRCESClient(apiPath: string): RCESAPI {
  const requestAdapter = new DefaultRequestAdapter(authenticationProvider)
  requestAdapter.baseUrl = `${GATEWAY_BASE_URL}/${apiPath}`
  return createRCESAPI(requestAdapter)
}

/**
 * 创建 RCDS API 客户端
 * @param apiPath 发布中心服务的 API 路径（如 MRCDSAPI）
 */
export function createRCDSClient(apiPath: string): RCDSAPI {
  const requestAdapter = new DefaultRequestAdapter(authenticationProvider)
  requestAdapter.baseUrl = `${GATEWAY_BASE_URL}/${apiPath}`
  return createRCDSAPI(requestAdapter)
}

const requestAdapter = new DefaultRequestAdapter(authenticationProvider)
if (import.meta.env.DEV) {
  requestAdapter.baseUrl = `http://winserver.devserver.ink:10010`
}
else {
  requestAdapter.baseUrl = `${window.location.protocol}//${window.location.host}`
}
const defaultRCDSClient = createRCSCAPI(requestAdapter)
defaultRCDSClient.serverCenterAPI.server.getBaseUrl.get().then(info => {
  GATEWAY_BASE_URL = info?.data ?? ''  
// 创建 RCSC API 客户端（固定使用服务中心）
  const rcscRequestAdapter = new DefaultRequestAdapter(authenticationProvider)
  rcscRequestAdapter.baseUrl = `${GATEWAY_BASE_URL}/MRCSCAPI`
  rcscApiClient = createRCSCAPI(rcscRequestAdapter)
}).catch(error => {
  console.error('获取网关地址失败：', error)
})

// 导出类型
export type { RCDSAPI, RCESAPI, RCSCAPI }
