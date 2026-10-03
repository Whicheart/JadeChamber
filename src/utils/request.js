import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
})

// 统一解包后端 Result 信封：成功直接返回 data，失败抛出错误
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && !Array.isArray(body) && 'code' in body) {
      if (body.code === 200) return body.data
      return Promise.reject(new Error(body.msg || '请求失败'))
    }
    return body
  },
  (error) => Promise.reject(error),
)

export default request
