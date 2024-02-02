import {createRouter,createWebHistory} from 'vue-router'

import LoginVue from '@/views/Login.vue'
import HomeVue from '@/views/Home.vue'
import ArticleVue from '@/views/article/Article.vue'
import CheckArticleVue from '@/views/article/CheckArticle.vue'
import UserInfoVue from '@/views/userinfo/UserInfo.vue'
import MessageVue from '@/views/message/Message.vue'


//定义路由关系
const routes = [
    {path: '/login',component:LoginVue},
    {
        path: '/',
        name: 'home',
        component: HomeVue,
        children: [
            {path: '/article', name: 'article', component: ArticleVue},
            {path: '/checkArticle/:id', name: 'checkArticle', component: CheckArticleVue},
            {path: '/userinfo', name: 'userinfo', component: UserInfoVue},
            {path: '/message', name: 'message', component: MessageVue},

        ],
        redirect: '/article'
    }
]

//创建路由器
const router = createRouter({
    history:createWebHistory(),
    routes:routes
})

//导出路由
export default router