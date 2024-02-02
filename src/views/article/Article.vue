<script setup>
    import {onMounted, ref} from 'vue'
    import {articleService,publicArticleRequest} from '@/api/article/article.js'
    import {articleUserService} from '@/api/articleUser/articleUser.js'
    import {useStore} from '@/stores/store.js'
    const store = useStore()
    const article = ref([])
    const flag = ref(false)
    const articleRequest = async () => {
        const result = ref(null)
        if (flag.value){
            result.value = await articleService()
        }else{
            result.value = await publicArticleRequest()
        }
        article.value = result.value.data
    }
    onMounted(()=>{
        if (store.user.token){
            flag.value = true
        }
        articleRequest(flag.value)
    })
    import {ElMessage} from 'element-plus';
    const likeRequest = async (id,likeTremple,index) => {
        if (flag.value){
            const data = {
                articleId:id,
                likeTremple:likeTremple
            }
            const json = JSON.stringify(data)
            await articleUserService(json)
            // await articleRequest()
            article.value[index].likeTremple = article.value[index].likeTremple == likeTremple ? 0 : likeTremple
        }else{
            ElMessage.success('请先登录')
            router.push('/login')
        }
    }
    import { useRouter } from 'vue-router'
    const router = useRouter();
    const JumpCheckArticle = (id) => {
        router.push({ name: 'checkArticle', params: { id: id } });
    }

</script>
<template>
    <el-card style="width: 100%;">
        <template #header>
            <h3>文章</h3>
        </template>
        <ul style="width: 100%">
            <li v-for="(item,index) in article" :key="index" style="padding: 10px 0;cursor: pointer;" @click="JumpCheckArticle(item.id)">
                <div style="width: 100%;height: 120px;display: flex;">
                    <div style="width: 25%;height: 100%;margin-left: 10px;">
                        <img style="width: 100%;height: 100%" :src="item.img"/>
                    </div>
                    <div style="width: 75%;height: 100%;margin-left: 10px;">
                        <span style="font-weight: bold;">{{item.title}}</span>
                        <p style="display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;overflow: hidden;font-size: 13px;height: 52px;">{{item.secondary}}</p>
                        <div style="display: flex;justify-content: start;font-size: 14px;">
                            <div :class="{ 'no-hover': item.likeTremple === 1 }" class="content-one" :style="{color:item.likeTremple === 1 ? 'red' : '#555666'}" @click.stop="likeRequest(item.id,1,index)">
                                <el-icon style="margin-right: 5px;">
                                    <i class="iconfont icon-zan"></i>
                                </el-icon>
                                <span>点赞</span>
                            </div>
                            <div :class="{ 'no-hover': item.likeTremple === 2 }" :style="{color:item.likeTremple === 2 ? 'red' : '#555666'}" class="content-one" @click.stop="likeRequest(item.id,2,index)">
                                <el-icon style="margin-right: 5px;">
                                    <i class="iconfont icon-cai"></i>
                                </el-icon>
                                <span>踩</span>
                            </div>
                            <div style="color: #555666">
                                <span>作者:#LUO#</span>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </el-card>
</template>

<style scoped>
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li:hover{
        background-color: #f9f9f9;
    }
    .content-one{
        margin-right: 20px;
    }
    /*.content-one:hover{*/
    /*    color: #cdcdcd !important;*/
    /*}*/

    .content-one:hover:not(.no-hover) {
        color: #cdcdcd !important;
    }

</style>