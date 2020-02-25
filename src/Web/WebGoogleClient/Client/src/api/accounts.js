import * as moment from 'moment'


export const getUser = async (userId) => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}`;
    const url2 = `${window.API_GATEWAY}/api/v1/lex/Lexon/user?idUserNavision=${userId}`;

    try {
        const res = await fetch(url, {method: "GET"});
        const user = await res.json();
        const res2 = await fetch(url2, {method: "GET"});
        const navUser = await res2.json();
        user.data.lexonUserId = navUser.data.idUser

        return user;
    } catch(err) {
        throw err;
    }
}

export const addOrUpdateAccount = async (userId, account) => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}/account/addorupdate`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(account)
        });
        
        const user = await res.json();
        return user;
    } catch(err) {
        throw err;
    }
}

export const resetDefaultAccount = async (userId) => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}/account/reset`;
         
    try {
        const res = await fetch(url, {
            method: "POST"
        });
        
        const user = await res.json();
        return user;
    } catch(err) {
        throw err;
    }
}

export const classifyEmail = async (id, subject, date, to, provider, account, bbdd, userId) => { 
    const m = moment(date).format('YYYY-MM-DD HH:mm:ss'); 
    const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/classifications/contacts/add`;
    const classification = {
        "contactList": [
            ...to
        ],
        "mail": {
            "provider": provider,
            "mailAccount": account,
            "uid": id,
            "subject": subject,
            "date": m
        },
        "bbdd": bbdd,
        "idUser": userId
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(classification)
        })
        const data = await response.json()

        return data
    } catch(err) {
        throw err
    }
}