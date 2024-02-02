import request from '@/utils/request.js'

export const articleUserService = (json) => {
    return request.patch('/user/articleUser/LikeTrempl',json,{headers:{'Content-Type': 'application/json'}})
}