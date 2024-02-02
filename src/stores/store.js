import {defineStore} from 'pinia'
import {ref} from 'vue'


/*
    defineStore参数描述:
        第一个参数:给状态名起名,具有唯一性
        第二个参数:函数,可以把定义该状态中拥有的内容

    defineStore返回值描述:
        返回的是一个函数,将来可以调用该函数,得到第二个参数中返回的内容
 */
export const useStore = defineStore('user',()=>{
    //1.定义描述token
    const user = ref({
        id:null,
        name:null,
        img:null,
        token:null
    })

    //2.定义修改token的方法
    const setStore = (newUser)=>{
        user.value.id = newUser.id != null ? newUser.id : user.value.id
        user.value.name = newUser.name != null ? newUser.name : user.value.name
        user.value.img = newUser.img != null ? newUser.img : user.value.img
        user.value.token = newUser.token != null ? newUser.token : user.value.token
    }

    //3.定义移除token的方法
    const removeStore = ()=>{
        user.value.id = ''
        user.value.name = ''
        user.value.img = ''
        user.value.token = ''
    }

    return {
        user,setStore,removeStore
    }

},{
    persist:true //持久化存储
})
