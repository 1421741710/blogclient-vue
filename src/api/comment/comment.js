import request from '@/utils/request.js'

export const commentService = (id) => {
    return request.get('/comment/findByComment',{params:{id:id}})
}

export const commentInsert = (json) => {
    return request.post('/comment/insert',json,{headers:{'Content-Type': 'application/json'}})
}