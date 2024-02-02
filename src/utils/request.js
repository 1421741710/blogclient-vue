//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import {ElMessage} from 'element-plus';
//定义一个变量,记录公共的前缀  ,  baseURL
// const baseURL = 'http://localhost:8848';
const baseURL = '/api';
const instance = axios.create({baseURL})

import router from '@/router'
import {useStore} from '@/stores/store.js'
//添加请求拦截器
instance.interceptors.request.use(
    (config)=>{
        //请求前的回调
        //添加token
        const store = useStore();
        //判断有没有token
        if (store.user.token){
            config.headers.Authorization = store.user.token
        }
        return config;
    },
    (err)=>{
        Promise.reject(err)
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result=>{
        if (result.data.code === 1){
            return result.data;
        }
        ElMessage.error(result.data.msg ? result.data.msg : '服务异常')
        return Promise.reject(result.data.msg)
    },
    err=>{
        //判断响应状态码,如果为401,则证明未登录,提示请登录,并跳转到登录页面
        if (err.response.status === 401){
            clear()
            // ElMessage.error("请先登录")
            router.push('/login')
        }else{
            ElMessage.error("服务器异常")
        }
        return Promise.reject(code);//异步的状态转化成失败的状态
    }
)

export default instance;