import request from '@/utils/request.js'

export const messageService = () => {
    return request.get('/user/message/findByMessage')
}

export const messageIdService = (id) => {
    return request.get('/user/message/findByMessageId',{params:{userId:id}})
}

export const messageSendingService = (json) => {
    return request.patch('/user/message/insertMessage',json,{headers:{'Content-Type': 'application/json'}})
}