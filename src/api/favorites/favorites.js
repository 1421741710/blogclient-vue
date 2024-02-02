import request from '@/utils/request.js'

export const favoritesAddService = (id) => {
    const url = '/user/favorites/insert/' + id
    return request.put(url)
}

export const favoritesService = () => {
    return request.get('/user/favorites/findByFavorites')
}