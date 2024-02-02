import request from '@/utils/request.js'

export const mailboxService = (json) => {
    return request.post('/emil/findByEmil',json,{headers:{'Content-Type': 'application/json'}})
}