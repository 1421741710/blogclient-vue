import {nextTick, ref} from "vue";
import {useStore} from '@/stores/store.js'
import router from '@/router'
import {ElMessage} from 'element-plus';

export const createWebSocket = (url,onMessage) => {
    const store = useStore()
    const ws = new WebSocket(url)
    const isConnected = ref(false)
    const data = ref('')

    // 创建心跳定时器并立即启动
    const heartbeatInterval = ref(60000)
    const heartBeatTimer = setInterval(()=>{
        if (isConnected.value){
            sendHeartbeat()
        }else {
            stopHeartbeat()
        }
    },heartbeatInterval.value)

    //发送心跳包的函数
    function sendHeartbeat(){
        const da = {
            type:"HEARTBEAT",
            message:store.user.token
        }
        ws.send(JSON.stringify(da))
    }

    // 停止心跳循环
    function stopHeartbeat() {
        if (heartBeatTimer){
            clearInterval(heartBeatTimer);
        }
    }

    //系统通知
    function handleSystemNotice(message){
        onMessage('SystemNotice',message)
    }

    //token过期
    function handleVerifyToken(message){
        store.removeStore()
        ElMessage.error('需要重新登录')
        window.location.reload()
    }

    //登出
    function handleUserLoggedOut(message){
        ws.close()
        nextTick(()=>{
            store.removeStore()
            ElMessage.error('同一账号登录')
            router.push('/login')
        })
    }

    //日志
    function handleLogEniry(message){

    }

    //实时统计
    function handlePrivateMessage(message){
        onMessage('PrivateMessage',message)
    }


    //连接成功回调
    ws.addEventListener('open',()=>{
        isConnected.value = true
        sendHeartbeat()
    })

    //接收消息回调
    ws.addEventListener('message',(event)=>{
        data.value = event.data
        const da = JSON.parse(data.value)
        switch (da.type){
            case 'SYSTEM_NOTICE':   //系统通知
                handleSystemNotice(da.message)
                break;
            case 'VERIFY_TOKEN':   //token过期
                handleVerifyToken(da.message)
                break;
            case 'USER_LOGGED_OUT': //登出
                handleUserLoggedOut(da.message)
                break;
            case 'PRIVATE_MESSAGE':
                handlePrivateMessage(da.message)
                break;
            default:
                return
        }
    })

    // 错误处理
    ws.addEventListener('error', (error) => {
        console.error('错误信息:', error);
    });

    // 关闭连接回调
    ws.addEventListener('close', () => {
        isConnected.value = false;
        stopHeartbeat()
        // 可以在此处设置重连逻辑
    });


    // 提供关闭连接的方法
    function close() {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    }

    // 提供发送消息的方法
    function sendMessage(message){
        if (isConnected.value){
            ws.send(message)
        }else {
            console.warn('WebSocket is not connected, cannot send message.');
        }
    }

    // 返回一个对象，包含状态和方法
    return {
        isConnected,
        sendMessage,
        close,
    };

}

// 用于自动重连的函数（可选）
export function reconnectWebSocket(url, interval = 5000) {
    let wsInstance;

    function connect() {
        wsInstance = createWebSocket(url);
        // 当连接断开时尝试重新连接
        wsInstance.isConnected.subscribe(isConn => {
            if (!isConn) {
                setTimeout(connect, interval);
            }
        });
    }

    connect();

    return wsInstance;
}