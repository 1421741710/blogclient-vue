import request from '@/utils/request.js'

export const userInfoService = () => {
    return request.get('/user/userinfo/findByUserInfo')
}

export const updateUserInfoService = (json) => {
    return request.patch('/user/userinfo/update',json,{headers:{'Content-Type': 'application/json'}})
}