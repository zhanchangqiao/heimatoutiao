import axios from 'axios'
import JSONbig from 'json-bigint'
import router from '@/router/index.js'
import { Message } from 'element-ui'
const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn',
  transformResponse: [function (data) {
    // 对 data 进行任意转换处理
    try {
      return JSONbig.parse(data)
    } catch {
      return data
    }
  }]
})
// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  const token = window.localStorage.getItem('token')
  // 如果有登录用户信息，则统一设置 token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})
// 响应拦截器
// Add a response interceptor
request.interceptors.response.use(function (response) {
  // 所有响应码为 2xx 的响应都会进入这里

  // response 是响应处理
  // 注意：一定要把响应结果 return，否则真正发请求的位置拿不到数据
  return response
}, function (error) {
  const { status } = error.response
  // 任何超出 2xx 的响应码都会进入这里
  if (status === 401) {
    // 跳转到登录页面
    // 清除本地存储中的用户登录状态
    window.localStorage.removeItem('user')
    router.push('/login')
    Message.error('登录状态无效，请重新登录')
  } else if (status === 403) {
    // token 未携带或已过期
    Message({
      type: 'warning',
      message: '没有操作权限'
    })
  } else if (status === 400) {
    // 客户端参数错误
    Message.error('参数错误，请检查请求参数')
  } else if (status >= 500) {
    Message.error('服务端内部异常，请稍后重试')
  }

  return Promise.reject(error)
})
export default request
