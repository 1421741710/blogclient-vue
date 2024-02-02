<script setup>
    import { User, Lock,Key,Message } from '@element-plus/icons-vue'
    import {nextTick, ref,onMounted} from 'vue'
    import { ElMessage } from 'element-plus'
    onMounted(()=>{
        if (store.user.token){
            router.replace('/')
        }
    })
    //控制注册与登录表单的显示， 默认显示注册
    const isRegister = ref(false)
    //定义数据模型
    const registerData = ref({
        username: '',
        password: '',
        rePassword: '',
        mailbox:'',
        verifyCode:''
    })
    const loginData = ref({
        username:'',
        password:'',
        captcha:''
    })

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

    //定义表单校验规则
    const rules = {
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            // { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
            {pattern: /^[a-z0-9]{5,16}$/,message: '用户名必须为5~16位小写字母和数字组成',trigger: 'blur'}
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            // { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
            {pattern: /^[a-zA-Z0-9]{5,16}$/, message: '用户名必须为5~16位大小写英文字母和数字组成', trigger: 'blur'}
        ],
        captcha: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 4, max: 4, message: '长度为4位非空字符', trigger: 'blur' }
        ],
        mailbox: [
            { validator: isEmail, trigger: 'blur' }
        ],
        verifyCode: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min: 5, max: 5, message: '长度为5位非空数字', trigger: 'blur' }
        ],
        rePassword: [
            { validator: checkRePassword, trigger: 'blur' }
        ]
    }
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
            type:1
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

    //调用后台接口,完成注册
    import { userRegisterService, userLoginService} from '@/api/user/user.js'
    const register = async () => {
        //registerData是一个响应式对象,如果要获取值,需要.value
        const json = JSON.stringify(registerData.value)
        let result = await userRegisterService(json);
        ElMessage.success(result.msg ? result.msg : '注册成功')
        await nextTick(() => {
            isRegister.value = true
        })
        if (timer.value){
            clearInterval(timer.value)
        }
    }

    const captcha = ref(null)
    const getCaptcha = async () => {
        captcha.value = 'http://localhost:8848/captcha/captcha.jpg?'+Date.now()
    }
    getCaptcha()
    //绑定数据,复用注册表单的数据模型
    //表单数据校验
    //登录函数
    import {useStore} from '@/stores/store.js'
    import {useRouter} from 'vue-router'
    const router = useRouter()
    const store = useStore();
    const login =async ()=>{
        if (store.user.token){
            router.replace('/')
        }
        //调用接口,完成登录
        let result =  await userLoginService(loginData.value);
        ElMessage.success(result.msg ? result.msg : '登录成功')
        //把得到的token存储到pinia中
        store.setStore(result.data)

        //跳转到首页 路由完成跳转
        router.replace('/')
    }

    //定义函数,清空数据模型的数据
    const clearRegisterData = ()=>{
        registerData.value={
            username:'',
            password:'',
            rePassword:''
        }
    }
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" show-password placeholder="请输入密码"
                              v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item prop="rePassword">
                    <el-input :prefix-icon="Lock" type="password" show-password placeholder="请输入再次密码"
                              v-model="registerData.rePassword"></el-input>
                </el-form-item>
                <el-form-item prop="mailbox" style="display: flex">
                    <el-input :prefix-icon="Message" style="width: 70%" placeholder="请输入邮箱" v-model="registerData.mailbox"></el-input>
                    <el-button type="success" style="width: 30%" @click="getMailbox(registerData.mailbox)">{{ message }}</el-button>
                </el-form-item>
                <el-form-item prop="verifyCode">
                    <el-input :prefix-icon="Key" placeholder="请输入验证码" v-model="registerData.verifyCode"></el-input>
                </el-form-item>
                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = false;clearRegisterData()">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else :model="loginData" :rules="rules">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="loginData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" show-password placeholder="请输入密码" v-model="loginData.password"></el-input>
                </el-form-item>
                <el-form-item prop="captcha" style="display: flex;">
                    <el-input name="password" style="width: 70%" :prefix-icon="Key" placeholder="请输入验证码" v-model="loginData.captcha"></el-input>
                    <img style="width: 30%;height: 40px;cursor: pointer;" :src="captcha" @click="getCaptcha"/>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = true;clearRegisterData()">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
  /* 样式 */
  .login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
      background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
      border-radius: 0 20px 20px 0;
    }

    .form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      user-select: none;

      .title {
        margin: 0 auto;
      }

      .button {
        width: 100%;
      }

      .flex {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>