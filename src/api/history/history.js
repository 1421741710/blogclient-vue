import request from '@/utils/request.js'

export const historyService = () => {
    return request.get('/user/history/findByHistory')
}

export const deleteHistoryService = (id) => {
    const url = '/user/history/' + id
    return request.delete(url)
}

export const historyInsertService = (id) => {
    const url = '/user/history/insert/' + id
    return request.put(url)
}