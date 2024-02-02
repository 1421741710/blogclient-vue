import {defineStore} from 'pinia'
import {ref} from 'vue'


/*
    defineStore参数描述:
        第一个参数:给状态名起名,具有唯一性
        第二个参数:函数,可以把定义该状态中拥有的内容

    defineStore返回值描述:
        返回的是一个函数,将来可以调用该函数,得到第二个参数中返回的内容
 */
export const useUserInfoStore = defineStore('userinfo',()=>{
    //1.定义描述token
    const userinfo = ref({
        userId:null,
        name:null,
        img:null
    })

    //2.定义修改token的方法
    const setUserInfoStore = (newUserInfo)=>{
        userinfo.value.userId = newUserInfo.userId
        userinfo.value.name = newUserInfo.name
        userinfo.value.img = newUserInfo.img
    }

    //3.定义移除token的方法
    const removeUserInfoStore = ()=>{
        userinfo.value.userId = ''
        userinfo.value.name = ''
        userinfo.value.img = ''
    }

    return {
        userinfo,setUserInfoStore,removeUserInfoStore
    }

},{
    persist:true //持久化存储
})
