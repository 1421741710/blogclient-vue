import request from '@/utils/request.js'

export const notificationsService = () => {
    return request.get('/user/notifications/findByNotifications')
}