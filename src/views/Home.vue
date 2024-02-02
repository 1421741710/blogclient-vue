<script setup>
    import {Search, Position, UserFilled, Lock, Expand,Delete,CircleCloseFilled} from '@element-plus/icons-vue'
    // import router from '@/router'
    import { ElNotification } from 'element-plus'
    import {useStore} from '@/stores/store.js'
    import {ref, onMounted, onUnmounted, nextTick} from 'vue'
    import {historyService,deleteHistoryService,historyInsertService} from '@/api/history/history.js'
    import {favoritesService} from '@/api/favorites/favorites.js'
    import {articleSearchService} from '@/api/article/article.js'
    import {ElMessage} from 'element-plus';
    import { createWebSocket } from '@/utils/websocket.js'
    const receivedMessage = ref(null)
    const open = (msg) =>{
        ElNotification({
            title: '系统通知',
            dangerouslyUseHTMLString: true,
            message: msg,
        })
    }
    const handleMessage = (type,messageData) => {
        const data = JSON.parse(messageData)
        if (type === 'PrivateMessage'){
            const da = {
                type:'PrivateMessage',
                data:data
            }
            receivedMessage.value = da
            return
        }
        const content = data.content
        open(content)
    }

    const store = useStore()
    const search = ref(null)
    const flag = ref(false)
    const loginFlag = ref(false)
    const img = ref('https://music-1306786696.cos.ap-guangzhou.myqcloud.com/avatar20.png')
    const checkContent = () => {
        img.value = store.user.img
    }
    const logout = () => {
        loginFlag.value = false
        store.removeStore()
        ElMessage.success('退出成功')
        window.location.reload()
    }
    const ws = ref(null)
    onMounted(()=>{
        if (store.user.token){
            randomPath()
            loginFlag.value = true
            checkContent()
            getHistory()
            favoritesRequest()
            ws.value = createWebSocket('ws:'+location.host+'/socket/ws/'+store.user.id,handleMessage)
        }
    })
    onUnmounted(()=>{
        //关闭WebSocket连接
        if (ws.value){
            ws.value.close()
        }
    })
    const JumpGitHub = () => {
        window.open('https://github.com/1421741710/')
    }
    const getFocus = () => {
        if (history.value.length != 0){
            flag.value = true
        }
    }
    //初始化
    const history = ref([])
    //获取搜索历史
    const getHistory = async () => {
        const result = await historyService()
        history.value = result.data
    }
    const deleteHistory = async (id) => {
        await deleteHistoryService(id)
        await getHistory()
        if (history.value.length == 0){
            flag.value = false
        }
    }
    const flagInput = ref(false)
    const article = ref([])
    //输入框的值改变时触发
    const getArticle = async () => {
        if (search.value.length == 0){
            if (history.value.length != 0){
                flag.value = true
                return
            }
            flag.value = false
            flagInput.value = false
        }else{
            flagInput.value = true
            const result = await articleSearchService(search.value)
            if (result.data.length != 0){
                article.value = result.data
            }else{
                flagInput.value = false
            }
        }
    }
    // import router from '@/router'
    import { useRouter } from 'vue-router'
    const router = useRouter();
    const JumpCheckArticle = (id) => {
        historyInsert(id)
        flag.value = false
        flagInput.value = false
        router.push({ name: 'checkArticle', params: { id: id } });
    }
    const historyInsert = async (id) => {
        await historyInsertService(id)
        await getHistory()
    }
    const handleClickOutside = (event) => {
        flag.value = false
        flagInput.value = false
    }

    const favorites = ref([])
    const favoritesRequest = async () => {
        const result = await favoritesService()
        favorites.value = result.data
    }
    const checkLogin = () => {
        if (loginFlag.value)return
        ElMessage.success('请先登录')
        router.push('/login')
    }
    // const receivedMessage = ref({}); // 初始化接收的消息

    const handleSentMessage = (message) => {
        // 或者执行其他操作...
        ws.value.sendMessage(message)
    }
    import {useRoute} from 'vue-router'
    const route = useRoute()
    const path = ref('/article')
    const randomPath = () => {
        if (route.path != '/article' && route.path != '/message'){
            path.value = '/article'
            return
        }
        path.value = route.path
    }

    const dialogVisible = ref(false)

    const handleClose = async (done) => {
        try {
            // await ElMessageBox.confirm('是否确定关闭此对话框?')
            dialogVisible.value = false
            done()
        } catch {
            // 可以在这里处理错误
        }
    }

    //校验密码的函数
    const checkRePassword = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请再次确认密码'))
        } else if (value !== registerData.value.password) {
            callback(new Error('请确保两次输入的密码一样'))
        } else {
            callback()
        }
    }

    /* 邮箱 */
    var isEmail = (rule, value, callback) => {
        if (!value) {
            callback()
        } else {
            const reg =
                /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
            const email = reg.test(value)
            if (!email) {
                callback(new Error('邮箱格式如:admin@qq.com'))
            } else {
                callback()
            }
        }
    }

    const roles = {
        mailbox: [
            {validator: isEmail, trigger: 'blur'}
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            // { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
            {pattern: /^[a-zA-Z0-9]{5,16}$/, message: '用户名必须为5~16位大小写英文字母和数字组成', trigger: 'blur'}
        ],
        rePassword: [
            { validator: checkRePassword, trigger: 'blur' }
        ],
        captcha: [
            {required: true, message: '请输入验证码', trigger: 'blur'},
            {min: 5, max: 5, message: '长度为5位非空数字', trigger: 'blur'}
        ]
    }

    const info = ref({
        mailbox:null,
        password:null,
        newPassword:null,
        captcha:null
    })
    import {mailboxService} from '@/api/mailbox/mailbox.js'
    const message = ref('获取验证码')
    const number = ref(60)
    const flags = ref(false)
    const timer = ref(null)
    const getMailbox = async (mailbox) => {
        const reg =
            /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
        const email = reg.test(mailbox)
        if (!email) {
            ElMessage.error('邮箱格式如:admin@qq.com')
            return
        }
        if (flags.value){
            ElMessage.error('不能重新获取!请在'+number.value+'秒后再获取')
            return
        }
        const data = {
            mailbox:mailbox,
            type:3
        }
        const json = JSON.stringify(data)
        const result = await mailboxService(json)
        ElMessage.success(result.msg)
        timer.value = setInterval(()=>{
            if(number.value == 0){
                clearInterval(timer.value)
                flags.value = false
                number.value = 60
                message.value = '重新获取'
            }else {
                flags.value = true
                message.value = '获取验证码(' + number.value + ')'
                number.value -= 1
            }
        },1000)
    }
    import {updatePwdService} from '@/api/user/user.js'

    const updatePwd = async () => {
        const data = {
            mailbox:info.value.mailbox,
            password:info.value.password,
            captcha:info.value.captcha
        }
        const json = JSON.stringify(data)
        await updatePwdService(json)
        ElMessage.success('密码重置成功,重新登录!')
        store.removeStore()
        router.push('/login')
    }

</script>
<template>
    <div class="common-layout">
        <el-container>
            <el-header
                    style="padding: 0;background-color: white;
                    display: flex;justify-content: center;
                    height: 60px; position: fixed; top: 0; left: 0; right: 0;z-index: 100;">
                <div style="width: 95%;height: 60px;display: flex;">
                    <div class="header-left">
                        <img style="width: 110px;height: 30px;cursor: pointer;" src="@/assets/logo3.png" @click="router.replace('/')"/>
                    </div>
                    <div class="header-center" v-click-outside="handleClickOutside">
                        <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
                            <el-input size="large" @input="getArticle" type="text" clearable style="width: 90%;height: 40px;"
                                      @focus="getFocus" v-model="search" :prefix-icon="Search"
                                      placeholder="请输入要搜索文章标题" class="custom-rounded-input"/>
                        </div>
                        <div v-show="flag"
                             style="width: 90%;height: auto;background-color: white;margin: 0 5%;z-index: 500;position: absolute;border: 1px solid #cdcdcd;">
                            <div style="display: flex;justify-content: space-between;padding: 10px;color: orange;">
                                <span>搜索历史</span>
                                <div class="history">
                                    <el-icon>
                                        <Delete/>
                                    </el-icon>
                                    <span>清空</span>
                                </div>
                            </div>
                            <div class="search-item">
                                <ul style="padding: 10px 0;">
                                    <li v-for="(item,index) in history" :key="index" @click="JumpCheckArticle(item.articleId)">
                                        <div style="display: flex;justify-content: space-between;margin-bottom: 5px;align-items: center;">
                                            <span>{{item.title}}</span>
                                            <el-icon style="color: white;">
                                                <CircleCloseFilled @click.stop="deleteHistory(item.id)" />
                                            </el-icon>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div v-show="flagInput"
                             style="width: 90%;height: auto;background-color: white;margin: 0 5%;z-index: 500;position: absolute;border: 1px solid #cdcdcd;">
                            <div class="search-item">
                                <ul style="padding: 10px 0;">
                                    <li v-for="(item,index) in article" :key="index" @click="JumpCheckArticle(item.id)">
                                        <div style="display: flex;justify-content: space-between;margin-bottom: 5px;align-items: center;">
                                            <span>{{item.title}}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="header-right">
                        <el-menu :default-active="path" class="el-menu-demo" mode="horizontal" router>
                            <div style="display: flex;justify-content: center;align-items: center;cursor: pointer;margin-right: 20px;" >
                                <div v-if="!loginFlag">
                                    <img @click="router.push('/login')" style="width: 40px;height: 40px;" src="@/assets/default2.png"></img>
                                </div>
                                <el-dropdown v-else-if="loginFlag">
                                    <div>
                                        <el-avatar :src="img"></el-avatar>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu style="width: 120px;padding-bottom: 20px;">
                                            <div style="margin: 10px;text-align: center;">
                                                <span style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;width: 100px;">{{ store.user.name }}</span>
                                            </div>
                                            <hr style="margin: 10%;"/>
                                            <el-dropdown-item @click="router.push('/userinfo')" style="display: flex;justify-content: center;">
                                                <el-icon>
                                                    <UserFilled/>
                                                </el-icon>
                                                <span>个人中心</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item @click="dialogVisible = true" style="display: flex;justify-content: center;">
                                                <el-icon>
                                                    <Lock/>
                                                </el-icon>
                                                <span>修改密码</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item @click="logout" style="display: flex;justify-content: center;">
                                                <el-icon>
                                                    <Expand/>
                                                </el-icon>
                                                <span>退出登录</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                            <el-menu-item index="/article">
                                <span>博客</span>
                            </el-menu-item>
                            <el-menu-item :index="loginFlag ? '/message' : '/login'">
                                <span>消息</span>
                            </el-menu-item>
                            <el-menu-item @click="checkLogin">
                                <span v-if="!loginFlag">收藏</span>
                                <el-dropdown v-else-if="loginFlag">
                                    <div>
                                        <span>收藏</span>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu style="padding: 10px;">
                                            <span>收藏夹</span>
                                            <el-dropdown-item v-if="favorites" v-for="(item,index) in favorites" :key="index" @click.stop="JumpCheckArticle(item.articleId)">
                                                <span>{{ item.title }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item v-else>
                                                <span>无</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </el-menu-item>
                            <el-menu-item @click="checkLogin">
                                <span v-if="!loginFlag">历史</span>
                                <el-dropdown v-else-if="loginFlag">
                                    <div>
                                        <span>历史</span>
                                    </div>
                                    <template #dropdown>
                                        <el-dropdown-menu style="padding: 10px;">
                                            <span>搜索历史</span>
                                            <el-dropdown-item v-for="(item,index) in history" :key="index" @click.stop="JumpCheckArticle(item.articleId)">
                                                <span>{{ item.title }}</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </el-menu-item>
                            <el-menu-item @click="JumpGitHub">
                                <el-icon style="color:#000;">
                                    <Position/>
                                </el-icon>
                                <span>GitHub</span>
                            </el-menu-item>
                        </el-menu>
                    </div>
                    <el-dialog
                            v-model="dialogVisible"
                            title="修改邮箱"
                            width="35%"
                            :before-close="handleClose"
                    >
                        <div style="display: flex;justify-content: center;" >
                            <el-form label-position="right" label-width="80" :model="info" :rules="roles" >
                                <el-form-item label="邮 箱" prop="mailbox">
                                    <el-input style="width: 300px;" type="text" v-model="info.mailbox" placeholder="请输入邮箱"></el-input>
                                </el-form-item>
                                <el-form-item label="新密码" prop="password">
                                    <el-input style="width: 300px;" type="password" show-password v-model="info.password" placeholder="请输入新密码"></el-input>
                                </el-form-item>
                                <el-form-item label="确认密码" prop="newPassword">
                                    <el-input style="width: 300px;" type="password" show-password v-model="info.newPassword" placeholder="请再次输入密码"></el-input>
                                </el-form-item>
                                <el-form-item label="验证码" prop="captcha">
                                    <el-input style="width: 200px;" type="text" v-model="info.captcha" placeholder="请输入验证码"></el-input>
                                    <el-button style="width: 100px;" type="success" @click="getMailbox(info.mailbox)">{{ message }}</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                        <template #footer>
                  <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="updatePwd">确定</el-button>
                  </span>
                        </template>
                    </el-dialog>
                </div>
            </el-header>
            <el-main style="width: 100%;height: auto;display: flex;justify-content: center;padding: 0 20%;margin-top: 5%;margin-bottom: 30px;">
                <router-view :receivedMessage="receivedMessage" @sentMessage="handleSentMessage" :key="$route.fullPath"/>
            </el-main>
<!--            <el-footer>-->
<!--                <div>底部</div>-->
<!--            </el-footer>-->

        </el-container>
    </div>
</template>

<style scoped>
    .header-left {
        width: 33.99%;
        display: flex;
        justify-content: left;
        align-items: center;
    }

    .header-center {
        width: 33.99%;
        position: relative;
    }

    .header-right {
        width: 33.99%;
    }

    :deep(:focus-visible) {
        outline: none;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .search-item li{
        padding: 5px 10px;
        cursor: pointer;
    }
    .search-item li:hover{
        background-color: #cdcdcd;
        color: black;
    }
    .history{
        display: flex;
        align-items: center;
        color: #cdcdcd;
        font-size: 14px;
        cursor: pointer;
    }

</style>

<style lang="less">
  .custom-rounded-input{
    .el-input-group__prepend {
      border-radius: 95px;
      border: 1px solid #cdcdcd;
      box-shadow: 0 0 0 0px;
    }

    .el-input__wrapper {
      border-radius: 95px;
      border: 1px solid #cdcdcd;
      box-shadow: 0 0 0 0px;
    }

    .el-input-group__append {
      border-radius: 95px;
      border: 1px solid #cdcdcd;
      box-shadow: 0 0 0 0px;
    }
  }
</style>