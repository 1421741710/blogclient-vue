import request from '@/utils/request.js'


export const userLoginService = (data) => {
    const params = new URLSearchParams();
    for (let key in data){
        params.append(key,data[key])
    }
    return request.post('/user/login',data);
}

export const userRegisterService = (json) => {
    return request.post('/user/register',json,{headers:{'Content-Type': 'application/json'}});
}

export const updateMailboxService = (json) => {
    return request.patch('/user/updateMailbox',json,{headers:{'Content-Type': 'application/json'}})
}

export const updatePwdService = (json) => {
    return request.patch('/user/updatePwd',json,{headers:{'Content-Type': 'application/json'}})
}