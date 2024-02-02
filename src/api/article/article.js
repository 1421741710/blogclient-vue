import request from '@/utils/request.js'


export const articleService = () => {
    return request.get('/user/article/findByArticle')
}

export const articleIdService = (id) => {
    return request.get('/user/article/findByArticleId',{params:{"id":id}})
}

export const articleSearchService = (title) => {
    return request.get('/article/searchArticle',{params:{'title':title}})
}

export const publicArticleRequest = () => {
    return request.get('/article/findByArticle')
}

export const publicArticleIdService = (id) => {
    return request.get('/article/findByArticleId',{params:{"id":id}})
}