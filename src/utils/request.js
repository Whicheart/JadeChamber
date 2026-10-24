import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
})

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
