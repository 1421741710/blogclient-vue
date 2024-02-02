<script setup>
    import {Clock, ChatLineSquare} from '@element-plus/icons-vue'
    import {useRoute} from 'vue-router'
    import {useStore} from '@/stores/store.js'
    import {articleIdService, publicArticleIdService} from '@/api/article/article.js'
    import {favoritesAddService} from '@/api/favorites/favorites.js'
    import {commentService, commentInsert} from '@/api/comment/comment.js'
    import {ref, onMounted, nextTick} from "vue";
    import router from '@/router'

    const route = useRoute()
    const id = route.params.id
    const store = useStore()
    const flag = ref(false)
    const article = ref({})
    const comment = ref({})
    const img = ref('https://music-1306786696.cos.ap-guangzhou.myqcloud.com/avatar20.png')
    onMounted(() => {
        if (id == null) {
            router.push('/article')
        }
        if (store.user.token) {
            flag.value = true
            img.value = store.user.img
        }
        articleRequest()
        commentRequest()
    })
    // 代码高亮
    import hljs from 'highlight.js';
    // 在组件的<script setup>或<script>标签内
    import 'highlight.js/styles/agate.css';
    import {articleUserService} from "@/api/articleUser/articleUser.js";
    import {ElMessage} from "element-plus";

    const hljsFlag = ref(false)
    const articleRequest = async () => {
        const result = ref(null)
        if (flag.value) {
            result.value = await articleIdService(id)
        } else {
            result.value = await publicArticleIdService(id)
        }
        article.value = result.value.data
        nextTick(() => {
            const contentElement = document.querySelectorAll('.ql-syntax')
            contentElement.forEach((block) => {
                if (!hljsFlag.value) {
                    hljs.highlightElement(block)
                    block.setAttribute('style', 'padding:20px;')
                }
            })
            hljsFlag.value = true
        })
    }
    const likeRequest = async (id, likeTremple) => {
        if (flag.value) {
            const data = {
                articleId: id,
                likeTremple: likeTremple
            }
            const json = JSON.stringify(data)
            await articleUserService(json)
            await articleRequest(id)
        } else {
            ElMessage.success('请先登录')
            router.push('/login')
        }
    }
    const favoritesRequest = async (id) => {
        if (flag.value) {
            await favoritesAddService(id)
            await articleRequest()
        }
    }
    const commentRequest = async () => {
        const result = await commentService(id)
        comment.value = result.data
        comments.value = comment.value.data
    }
    const comments = ref([])
    const JumpComment = () => {
        drawer.value = true
    }
    const drawer = ref(false)
    const beforeCloseHandlerOne = (done) => {
        drawer.value = false
        commentContent.value = ''
        done()
    }
    const commentContent = ref('')
    const commentArticle = async () => {
        if (flag.value) {
            const data = {
                userId: store.user.id,
                articleId: id,
                comment: commentContent.value
            }
            const json = JSON.stringify(data)
            await commentInsert(json)
            nextTick(async () => {
                await commentRequest()
            })
            ElMessage.success("评论成功")
            commentContent.value = ''
        } else {
            ElMessage.success('请先登录')
            router.push('/login')
        }
    }
    import {useUserInfoStore} from '@/stores/userinfo.js'
    const userInfoStore = useUserInfoStore()
    const JumpMessage = (item) => {
        userInfoStore.removeUserInfoStore()
        const data = {
            userId:item.userId,
            name:item.name,
            img:item.img
        }
        userInfoStore.setUserInfoStore(data)
        router.push('/message')
    }

</script>

<template>
    <el-card style="width: 100%;">
        <template #header>
            <h1>{{ article.title }}</h1>
        </template>
        <div>
            <div style="display: flex;justify-content: left;align-items: center;background-color: #f8f8f8;padding: 15px 5px;color: #999AAA;">
                <span style="margin-right: 15px;">#LUO#</span>
                <span style="display: flex;justify-content: left;align-items: center;font-size: 13px;margin-right: 15px;">
                    <el-icon>
                        <Clock/>
                    </el-icon>
                    <span style="margin-left: 3px;">于{{ article.createTime }} 发布</span>
                </span>
                <span style="margin-right: 15px;cursor: pointer;" @click="favoritesRequest(article.id)">
                    <i :style="{color:article.favorites == 1 ? 'red' : '#555666'}" class="iconfont icon-shoucang"></i>
                    <span> 收藏 {{ article.favorite }}</span>
                </span>
                <span style="cursor: pointer;" @click="likeRequest(article.id,1)">
                    <i :style="{color:article.likeTremple == 1 ? 'red' : '#555666'}" class="iconfont icon-zan"></i>
                    <span> 点赞数 {{ article.likes }}</span>
                </span>
            </div>
            <div>
                <p v-html="article.content"></p>
            </div>
        </div>
        <template #footer>
            <div style="width: 100%;display: flex;align-items: center;">
                <div style="width: 50%;display: flex;justify-content: left;align-items: center;">
                    <el-avatar src="https://music-1306786696.cos.ap-guangzhou.myqcloud.com/avatar20.png"></el-avatar>
                    <span style="margin-left: 10px;">#LUO#</span>
                </div>
                <div class="footer-item" style="width: 50%;display: flex;justify-content:end;align-items: center;">
                    <div @click="likeRequest(article.id,1)">
                        <el-tooltip
                                class="box-item"
                                effect="light"
                                content="点赞"
                                placement="top-start"
                        >
                            <el-icon :style="{color:article.likeTremple == 1 ? 'red' : '#999AAA'}">
                                <i class="iconfont icon-zan"></i>
                            </el-icon>
                        </el-tooltip>
                        <span>{{ article.likes }}</span>
                    </div>
                    <div @click="likeRequest(article.id,2)">
                        <el-tooltip
                                class="box-item"
                                effect="light"
                                content="踩"
                                placement="top-start"
                        >
                            <el-icon :style="{color:article.likeTremple == 2 ? 'red' : '#999AAA'}">
                                <i style="margin: 0;" class="iconfont icon-cai"></i>
                            </el-icon>
                        </el-tooltip>
                    </div>
                    <div @click="favoritesRequest(article.id)">
                        <el-tooltip
                                class="box-item"
                                effect="light"
                                content="收藏"
                                placement="top-start"
                        >
                            <el-icon :style="{color:article.favorites == 1 ? 'red' : '#555666'}">
                                <i class="iconfont icon-shoucang"></i>
                            </el-icon>
                        </el-tooltip>
                        <span>{{ article.favorite }}</span>
                    </div>
                    <div @click="JumpComment">
                        <el-tooltip
                                class="box-item"
                                effect="light"
                                content="评论"
                                placement="top-start"
                        >
                            <el-icon>
                                <i class="iconfont icon-liaotian"></i>
                            </el-icon>
                        </el-tooltip>
                        <span>{{ comment.number }}</span>
                    </div>
                </div>
            </div>
        </template>
        <el-drawer class="check-item" :before-close="beforeCloseHandlerOne" size="500" v-model="drawer"
                   direction="rtl">
            <template #header>
                <h3>评论</h3>
            </template>
            <div style="display: flex;width: 100%;height: auto;">
                <el-avatar style="width: 40px;height: 40px;" :src="img"/>
                <div style="margin-left: 10px;">
                    <el-input type="textarea" v-model="commentContent" show-word-limit style="width: 410px;"
                              :autosize="{minRows:6,maxRows:6}" maxlength="1000" placeholder="请输入评论内容"/>
                    <div style="display: flex;justify-content: end;margin: 20px 0">
                        <el-button type="primary" @click="commentArticle">评论</el-button>
                    </div>
                </div>
            </div>
            <div>
                <ul>
                    <li v-for="(item,index) in comments" :key="index" style="margin-bottom: 10px;">
                        <div style="display: flex;color: #777888;font-size: 14px;">
                            <el-dropdown v-if="item.userId != store.user.id" placement="top">
                                <el-avatar style="cursor: pointer;" :src="item.img"/>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="JumpMessage(item)">私信</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>

                            <el-avatar v-else style="cursor: pointer;" :src="item.img"/>

                            <div style="margin-left: 10px;">
                                <span style="margin-right: 10px;">{{ item.name }}</span>
                                <span>{{ item.createTime }}</span>
                                <p style="color: black;">{{ item.comment }}</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </el-drawer>
    </el-card>
</template>

<style scoped>
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .footer-item div {
        margin-right: 20px;
        cursor: pointer;
    }

    .footer-item i {
        margin-right: 5px;
    }
    .example-showcase .el-dropdown-link {
        cursor: pointer;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
    }
</style>