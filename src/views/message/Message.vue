<script setup>
    import {ref, onMounted, nextTick, watch,onUnmounted} from 'vue'
    import {useStore} from '@/stores/store.js'
    import {useUserInfoStore} from '@/stores/userinfo.js'
    import {messageService, messageIdService, messageSendingService} from '@/api/message/message.js'
    import {notificationsService} from '@/api/notifications/notifications.js'
    import {ElMessage} from 'element-plus'
    import router from '@/router'

    const props = defineProps({
        receivedMessage: {
            type: Object,
            default: null,
        }
    })

    const store = useStore()
    const userInfoStore = useUserInfoStore()
    const number = ref(0)
    const message = ref([
        {
            senderUserId: null,
            recipientUserId: null,
            name: null,
            img: null,
            content: null,
            state: null,
            createTime: null
        }
    ])
    const notifications = ref([
        {
            content: null,
            createTime: null,
            status: null
        }
    ])
    const messageRequest = async () => {
        const result = await messageService()
        message.value = result.data
        if (message.value.length >= 1) {
            await messageIdRequest(message.value[0].senderUserId)
            for (let i = 0; i < message.value.length; i++) {
                message.value[i].createTime = message.value[i].createTime.substring(11)
            }
        }
        if (userInfoStore.userinfo.userId){
            const data = {
                senderUserId: userInfoStore.userinfo.userId,
                recipientUserId: store.user.id,
                name: userInfoStore.userinfo.name,
                img: userInfoStore.userinfo.img,
                content: null,
                state: null,
                createTime: null
            }
            const index = message.value.findIndex(message => message.senderUserId === userInfoStore.userinfo.userId);
            if (index >= 0){
                number.value = index
                items.value = message.value[index]
                messageIdRequest(message.value[index].senderUserId)
            }else{
                message.value.unshift(data)
                number.value = 0
                items.value = message.value[0]
                messageIdRequest(message.value[0].senderUserId)
            }
        }else{
            items.value = message.value[0]
        }
        userInfoStore.removeUserInfoStore()
    }
    const timers = ref(null)
    const notFlags = ref(true)
    const messageList = ref([])
    const messageIdRequest = async (id) => {
        const result = await messageIdService(id)
        messageList.value = result.data
        messageScroll()
        let number = 0
        timers.value = setInterval(() => {
            if (number == 10000) {
                clearInterval(timer.value)
                number = 0
            }
            if (messageList.value) {
                notFlags.value = false
                clearInterval(timers.value)
                messageScroll()

            }
            number += 1000
        }, 1000)

    }
    const sound = ref(null)
    const playNotificationSound = () => {
        if (sound.value) {
            try {
                sound.autoplay = true;
                sound.value.currentTime = 0; // 重置到开头播放
                sound.value.play();
            } catch (error) {
                console.error('Error playing notification sound:', error);
            }
        }
    }
    let unsubscribe = () => {}
    onMounted(() => {
        if (store.user.token) {
            sound.value = new Audio("https://music-1306786696.cos.ap-guangzhou.myqcloud.com/%E6%8F%90%E7%A4%BA%E9%9F%B3.mp3")
            messageRequest()
        } else {
            ElMessage.error('需要登录')
            router.push('/')
        }
        unsubscribe = watch(
            () => props.receivedMessage,
            (newMessage) => {
                if (newMessage) {
                    playNotificationSound()
                    const messages = newMessage.data
                    if (items.value.senderUserId == messages.senderUserId) {
                        items.value.content = messages.content
                        messageList.value.push(messages)
                    } else {
                        for (let i = 0; i < message.value.length; i++) {
                            if (message.value[i].senderUserId == messages.senderUserId && message.value.length >= 2) {
                                if (i == 0) {
                                    message.value[i].content = messages.content
                                    return
                                }
                                const newContent = {...message.value[i]}
                                message.value[i] = {...message.value[1]}
                                message.value[1] = newContent
                                message.value[1].content = messages.content
                                messageScroll()
                                return
                            } else {
                                message.value.push(messages)
                            }
                        }
                    }
                    // messageScroll()
                }
            },
            {immediate: true}
        )
    })
    const activeName = ref('first')
    const timer = ref(null)
    const notFlag = ref(true)
    const handleClick = async (tab, event) => {
        if (tab.props.name == "second") {
            await notificationsRequest()
            let number = 0
            timer.value = setInterval(() => {
                if (number == 10000) {
                    clearInterval(timer.value)
                    number = 0
                }
                if (notifications.value) {
                    notFlag.value = false
                    clearInterval(timer.value)
                    messageScroll()

                }
                number += 1000
            }, 1000)
        }
    }
    const showScrollbar = ref(false)
    const scrollTimeout = ref(null)
    const handleScroll = () => {
        showScrollbar.value = true; // 当滚动时显示滚动条
        clearTimeout(scrollTimeout.value);

        // 设置一个定时器，在一定时间后隐藏滚动条
        scrollTimeout.value = setTimeout(() => {
            showScrollbar.value = false;
        }, 2000); // 2000毫秒后隐藏滚动条，你可以根据需要调整这个时间
    }
    const notCrateTime = ref('')
    const notificationsRequest = async () => {
        const result = await notificationsService()
        notifications.value = result.data
        // notCrateTime.value = notifications.value[notifications.value.length-1].createTime.substring(11)
        notCrateTime.value = notifications.value[notifications.value.length - 1]?.createTime?.substring(11) || '';
    }
    const items = ref({})
    const JumpChat = async (index, item) => {
        number.value = index
        items.value = item
        await messageIdRequest(items.value.senderUserId)
    }
    const content = ref('')
    const emojiFalg = ref(false)
    const emoji = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉',
        '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛',
        '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐',
        '😑', '😶', '🫥', '😒', '😏', '🙄', '😬', '😮‍💨'
    ]
    const JumpEmoji = () => {
        emojiFalg.value = true
    }
    const handleClickOutside = (event) => {
        emojiFalg.value = false
    }
    const emit = defineEmits(['sentMessage']); // 声明要发出的事件

    const sendMessage = (message) => {
        emit('sentMessage', message);
    }

    const sendingMessage = async () => {
        const data = {
            senderUserId: store.user.id,
            recipientUserId: items.value.senderUserId,
            content: content.value,
            img: userInfoStore.userinfo.img,
            name: userInfoStore.userinfo.name
        }
        const json = JSON.stringify(data)
        const websocketMessage = {
            type: 'PRIVATE_MESSAGE',
            id: items.value.senderUserId,
            message: json
        }
        const websocketJson = JSON.stringify(websocketMessage)
        sendMessage(websocketJson)
        await messageSendingService(json)
        messageList.value.push(data)
        if (message.value.length >= 2) {
            for (let i = 0; i < message.value.length; i++) {
                if (message.value[i].senderUserId == items.value.senderUserId) {
                    nextTick(() => {
                        const messages = message.value[i]
                        message.value[i] = {...message.value[0]}
                        message.value[0] = messages
                        message.value[0].content = content.value
                        items.value = {...message.value[0]}
                        number.value = 0
                        content.value = ''
                        messageScroll()
                    })
                    return
                }
            }
        }
        content.value = ''
        messageScroll()
    }
    const messageListRef = ref(null)
    const messageScroll = () => {
        nextTick(() => {
            messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        })
    }
</script>

<template>
    <el-card style="width: 100%;">
        <template #header>
            <h3>消息</h3>
        </template>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="私信" name="first">
                <div v-if="message.length >= 1"
                     style="width: 100%;min-height:500px;display: flex;border: 1px solid #d9d9d9;border-radius: 5px;">
                    <div style="width: 30%;border-right: 1px solid #d9d9d9;">
                        <ul style="width: 100%;height: 100%;">
                            <li class="item-li" v-for="(item,index) in message" :key="index"
                                style="cursor: pointer;padding: 10px 5px;"
                                :style="{backgroundColor:index == number ? '#cdcdcd' : ''}"
                                @click="JumpChat(index,item)">
                                <div style="display: flex;justify-content:left;align-items:center;">
                                    <div style="margin-left: 10px;">
                                        <img style="width: 40px;height: 40px;border: 1px solid #d9d9d9;"
                                             :src="item.img"></img>
                                    </div>
                                    <div style="width:calc(100% - 60px);margin-left: 10px;margin-top:5px;">
                                        <div style="display: flex;justify-content: space-between;">
                                            <span style="font-size: 14px;color: black;">{{ item.name }}</span>
                                            <span style="font-size: 12px;color: #999999;margin-right: 10px;">{{
                                                    item.createTime
                                                }}</span>
                                        </div>
                                        <div style="font-size: 12px;color: #999999;">
                                            <p>{{ item.content }}</p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div style="width: 70%;">
                        <div style="height: 50px;border-bottom: 1px solid #d9d9d9;display: flex;align-items: center;">
                            <span style="margin-left: 10px;font-size: 15px;font-weight: bold;">{{ items.name }}</span>
                        </div>
                        <div ref="messageListRef"
                             @scroll="handleScroll" class="scroll-container"
                             style="height: 300px;border-bottom: 1px solid #d9d9d9;">
                            <ul v-if="!notFlags" style="padding-bottom: 20px;">
                                <li v-for="(item,index) in messageList" :key="index">
                                    <div v-if="item.senderUserId != store.user.id"
                                         style="display: flex;align-items: center;font-size: 14px;">
                                        <el-avatar style="margin-right: 10px;margin-left: 10px;" :src="items.img"/>
                                        <p style="background-color: #f9f9f9;padding: 10px;border-radius: 10px;">
                                            {{ item.content }}</p>
                                    </div>
                                    <div v-else
                                         style="display: flex;justify-content: right;align-items: center;font-size: 14px;">
                                        <p style="background-color: #95ec69;padding: 10px;border-radius: 10px;">
                                            {{ item.content }}</p>
                                        <el-avatar style="margin-right: 10px;margin-left: 10px;" :src="store.user.img"/>
                                    </div>
                                    <div v-if="index % 5 == 0"
                                         style="display: flex;justify-content: center;font-size: 12px;color: #cccccc;">
                                        <span>{{ item.createTime }}</span>
                                    </div>
                                </li>
                            </ul>
                            <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;"
                                 v-else v-loading="notFlags">
                                <span v-show="number == 10000">网络超时!</span>
                            </div>
                        </div>
                        <div style="height: calc(100% - 350px);position: relative;">
                            <ul v-click-outside="handleClickOutside" v-show="emojiFalg"
                                style="width:240.31px;height:auto;display: flex;flex-wrap: wrap;
                                background-color: #d9d9d9;border-radius: 5px;padding: 10px;
                                position: absolute;top: -255px;left: 10px;">
                                <li v-for="(item,index) in emoji" :key="index" class="emoji-bqb"
                                    style="width: calc(240.31px - (34.33px * 6));text-align: center;cursor: pointer;">
                                    <span style="font-size: 25px;" @click="content += item">{{ item }}</span>
                                </li>
                            </ul>
                            <div class="emoji-bq" style="font-size: 25px;cursor: pointer;">
                                <el-icon style="margin-right: 10px;margin-left: 10px;" @click.stop="JumpEmoji">
                                    <i class="iconfont icon-IMweb_expression"></i>
                                </el-icon>
                                <el-icon>
                                    <i class="iconfont icon-IMweb_picture"></i>
                                </el-icon>
                            </div>
                            <div>
                                <el-input resize="none" class="content-input" type="textarea"
                                          maxlength="1000" :autosize="{ minRows: 4, maxRows: 4 }"
                                          placeholder="请输入内容" v-model="content" show-word-limit
                                          @keydown.enter="sendingMessage"></el-input>
                                <div style="display: flex;justify-content: end;">
                                    <el-button
                                            style="margin-right: 10px;margin-bottom: 10px;font-size: 12px;color: #07c160;"
                                            type="info" @click="sendingMessage" plain>发送(ENTER)
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <el-empty description="无私信"/>
                </div>
            </el-tab-pane>
            <el-tab-pane label="系统通知" name="second">
                <div v-if="notifications.length >= 1"
                     style="width:100%;height: 500px;border: 1px solid #d9d9d9;display: flex;">
                    <div style="width: 30%;border-right: 1px solid #d9d9d9;">
                        <div style="display: flex;justify-content:left;align-items:center;border-bottom: 1px solid #d9d9d9;padding: 20px 5px;background-color: #d9d9d9;">
                            <div style="margin-left: 10px;">
                                <el-avatar
                                        src="https://music-1306786696.cos.ap-guangzhou.myqcloud.com/logo2.png"></el-avatar>
                            </div>
                            <div style="width:calc(100% - 60px);margin-left: 10px;margin-top:5px;">
                                <div style="display: flex;justify-content: space-between;">
                                    <span style="font-size: 14px;color: black;">个人博客系统通知</span>
                                    <span style="font-size: 12px;color: #999999;margin-right: 10px;">{{
                                            notCrateTime
                                        }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="width: 70%;">
                        <div style="height: 50px;border-bottom: 1px solid #d9d9d9;display: flex;align-items: center;">
                            <span style="margin-left: 10px;font-size: 15px;font-weight: bold;">个人博客系统通知</span>
                        </div>
                        <div ref="messageListRef" @scroll="handleScroll" class="scroll-container"
                             style="height: 450px;">
                            <ul v-if="!notFlag" style="margin: 10px;">
                                <li v-for="(msg,index) in notifications" :key="index">
                                    <div style="display: flex;justify-content: left;">
                                        <el-avatar style="margin-right: 10px;"
                                                   src="https://music-1306786696.cos.ap-guangzhou.myqcloud.com/logo2.png"/>
                                        <div style="padding: 10px;margin-bottom: 20px;background-color: #f9f9f9;border-radius: 10px;">
                                            <p v-html="msg.content" style="font-size:14px;margin-bottom: 10px;"></p>
                                            <span style="font-size: 12px;color: #cccccc;">{{ msg.createTime }}</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;"
                                 v-else v-loading="notFlag">
                                <span v-show="number == 10000">网络超时!</span>
                            </div>
                        </div>
                    </div>
                </div>
                <el-empty v-else description="空空如也"></el-empty>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<style scoped>
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .item-li:hover {
        background-color: #d9d9d9;
    }

    .emoji-bqb:hover {
        background-color: #e9e9e9;
    }

    ::v-deep .el-tabs__nav-wrap::after {
        height: 0px;
    }
</style>

<style>
    .scroll-container {
        overflow-y: auto;
        /* 其他样式，根据你的需要设置 */
    }

    /* 根据showScrollbar变量来动态设置滚动条的显示与隐藏 */
    .scroll-container::-webkit-scrollbar {
        width: 5px;
    }

    .scroll-container::-webkit-scrollbar-thumb {
        background-color: white;
        border-radius: 6px;
    }

    .scroll-container::-webkit-scrollbar-track {
        background-color: white;
    }

    .scroll-container:hover::-webkit-scrollbar-thumb {
        background-color: #d9d9d9;
    }

    .demo-tabs > .el-tabs__content {
        padding: 5px;
        /*color: #6b778c;*/
        /*font-size: 32px;*/
        /*font-weight: 600;*/
    }
</style>

<style lang="less">

  .content-input {
    // 默认状态样式更改
    //height: 42px;
    --el-input-bg-color: rgba(0, 0, 0, 0) !important;
    --el-input-border-color: none !important;
    --el-input-focus-border-color: none !important;
    --el-input-hover-border-color: none !important;

    ///* 只更改具有.el-input类名的元素的占位符文本样式 */
    //:deep .el-input__inner::placeholder {
    //  font-size: 14px;
    //  font-weight: 500;
    //  color: #3E534F;
    //}
  }

</style>