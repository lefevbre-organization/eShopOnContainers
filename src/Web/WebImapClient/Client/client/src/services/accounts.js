
export const getUser = async (userId) => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}`;

    try {
        const res = await fetch(url, {
        method: "GET"
        });
        const user = await res.json();
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
