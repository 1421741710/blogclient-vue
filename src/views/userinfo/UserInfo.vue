<script setup>
    import {Edit, Message, Plus, Iphone} from '@element-plus/icons-vue'
    import {onMounted, ref} from 'vue'
    import {ElMessage} from 'element-plus'
    import {uploadService} from '@/api/upload/upload.js'
    import {userInfoService, updateUserInfoService} from '@/api/userinfo/userinfo.js'
    import {updateMailboxService} from '@/api/user/user.js'
    import {useStore} from '@/stores/store.js'
    import router from '@/router'
    import { ElMessageBox } from 'element-plus'

    const store = useStore()
    const form = ref({
        id: null,
        name: null,
        mailbox: null,
        img: null,
        phone: null,
        address: null
    })
    const formsRef = ref(null)
    const roles = {
        name: [
            {required: true, message: '请输入昵称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度为5~20位非空字符', trigger: 'blur'}
        ],
        mailbox: [
            {validator: isEmail, trigger: 'blur'}
        ],
        img: [
            {required: true, message: '请选择图片', trigger: 'blur'}
        ],
        phone: [
            {required: true, message: '请输入电话号码', trigger: 'blur'},
            {min: 11, max: 11, message: '长度为11位非空数字', trigger: 'blur'}
        ],
        address: [
            {required: true, message: '请输入地址', trigger: 'blur'},
            {min: 5, max: 30, message: '长度为5~30位非空字符', trigger: 'blur'}
        ],
        captcha: [
            {required: true, message: '请输入验证码', trigger: 'blur'},
            {min: 5, max: 5, message: '长度为5位非空数字', trigger: 'blur'}
        ]
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
    const imageFlag = ref(null)
    //上传图片
    const beforeAvatarUpload = async (open) => {
        const result = await uploadService(open.file)
        form.value.img = result.data
        imageFlag.value = form.value.img
        ElMessage.success(result.msg)
    }
    onMounted(() => {
        if (store.user.token) {
            userInfoRequest()
        } else {
            ElMessage.success('请先登录')
            router.replace('/login')
        }
    })
    const userinfo = ref({
        id: null,
        name: null,
        mailbox: null,
        img: null,
        phone: null,
        address: null
    })
    const userInfoRequest = async () => {
        const result = await userInfoService()
        form.value = result.data
        userinfo.value = {...result.data}
        imageFlag.value = form.value.img
    }
    const updateUserInfo = async () => {
        userinfo.value.id = form.value.id
        userinfo.value.name = form.value.name != userinfo.value.name && form.value.name != null ? form.value.name : null
        userinfo.value.img = form.value.img != userinfo.value.img && form.value.img != null ? form.value.img : null
        userinfo.value.phone = form.value.phone != userinfo.value.phone && form.value.phone != null ? form.value.phone : null
        userinfo.value.address = form.value.address != userinfo.value.address && form.value.address != null ? form.value.address : null
        if (userinfo.value.phone == null && userinfo.value.address == null && userinfo.value.name == null && userinfo.value.img == null) {
            ElMessage.error('字段不能全部为空')
            return
        }
        const json = JSON.stringify(userinfo.value)
        await updateUserInfoService(json)
        ElMessage.success('修改成功')
        await userInfoRequest()
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
    const info = ref({
        mailbox:null,
        captcha:null
    })
    import {mailboxService} from '@/api/mailbox/mailbox.js'
    const message = ref('获取验证码')
    const number = ref(60)
    const flag = ref(false)
    const timer = ref(null)
    const getMailbox = async (mailbox) => {
        const reg =
            /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
        const email = reg.test(mailbox)
        if (!email) {
            ElMessage.error('邮箱格式如:admin@qq.com')
            return
        }
        if (flag.value){
            ElMessage.error('不能重新获取!请在'+number.value+'秒后再获取')
            return
        }
        const data = {
            mailbox:mailbox,
            type:2
        }
        const json = JSON.stringify(data)
        const result = await mailboxService(json)
        ElMessage.success(result.msg)
        timer.value = setInterval(()=>{
            if(number.value == 0){
                clearInterval(timer.value)
                flag.value = false
                number.value = 60
                message.value = '重新获取'
            }else {
                flag.value = true
                message.value = '获取验证码(' + number.value + ')'
                number.value -= 1
            }
        },1000)
    }
    const updateMailbox = async () => {
        const json = JSON.stringify(info.value)
        await updateMailboxService(json)
        ElMessage.success('修改成功')
        form.value.mailbox = info.value.mailbox
        dialogVisible.value = false
    }
</script>

<template>
    <el-card style="width: 100%;">
        <template #header>
            <h3>个人信息</h3>
        </template>
        <div style="display: flex;justify-content: center;">
            <el-form ref="formsRef"
                     label-position="top"
                     label-width="100%"
                     :model="form"
                     style="overflow: auto;"
                     :rules="roles">
                <el-form-item prop="img">
                    <div style="width: 100%;display: flex;justify-content: center;margin-bottom: 10px;">
                        <el-upload
                                class="avatar-uploader"
                                :http-request="beforeAvatarUpload"
                                :show-file-list="false"
                        >
                            <el-avatar v-if="imageFlag" style="width: 150px;height: 150px;" :src="form.img"
                                       class="avatar"/>
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus/>
                            </el-icon>
                        </el-upload>
                    </div>
                </el-form-item>
                <el-form-item label="昵称" prop="name">
                    <el-input style="width: 300px;margin-bottom: 10px;" :prefix-icon="Edit" type="text"
                              v-model="form.name" placeholder="请输入昵称"/>
                </el-form-item>
                <el-form-item label="邮箱">
                    <div style="width:100%;display: flex;justify-content: center;">
                        <el-input style="width: 230px;margin-bottom: 10px;" :prefix-icon="Message" type="text"
                                  v-model="form.mailbox" disabled placeholder="请输入邮箱"/>
                        <el-button type="info" style="width: 70px;" @click="dialogVisible = true" plain>修改邮箱</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input style="width: 300px;margin-bottom: 10px;" :prefix-icon="Iphone" type="text"
                              v-model="form.phone" placeholder="请输入电话号码"/>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input style="width: 300px;margin-bottom: 10px;" type="textarea" v-model="form.address"
                              placeholder="请输入地址"/>
                </el-form-item>
                <el-form-item>
                    <div style="width:100%;display: flex;justify-content: center;">
                        <el-button type="primary" style="width: 100px;" @click="updateUserInfo">修改</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <el-dialog
                v-model="dialogVisible"
                title="修改邮箱"
                width="35%"
                :before-close="handleClose"
        >
            <div style="display: flex;justify-content: center;" >
                <el-form label-position="right" label-width="70" :model="info" :rules="roles" >
                    <el-form-item label="邮 箱" prop="mailbox">
                        <el-input style="width: 300px;" type="text" v-model="info.mailbox" placeholder="请输入邮箱"></el-input>

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
                    <el-button type="primary" @click="updateMailbox">确定</el-button>
                  </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<style scoped>

</style>

<style>
    .avatar-uploader .el-upload {
        border: 1px dashed var(--el-border-color);
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
    }

    .avatar-uploader .el-upload:hover {
        border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 150px;
        height: 150px;
        text-align: center;
    }
</style>