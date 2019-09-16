import { config, PROXY_CORS } from "../constants";

export const getAccounts = (userId, encrypt) => {
  if (encrypt === "1") {
    return new Promise((resolve, reject) => {
      getAccountsWithUserEncrypt(userId)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  return new Promise((resolve, reject) => {
    getAccountsWithUserNoEncrypt(userId)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getAccountsWithUserEncrypt = userId => {
  return new Promise((resolve, reject) => {
    getUser(userId)
      .then(user => {
        user.ID_ENTRADA != null
          ? console.log(`User [${userId}] exists: ${user.ID_ENTRADA}`)
          : console.log(`User [${userId}] NOT exists`);

        if (user.ID_ENTRADA != null) {
          const url = `${config.url.API_ACCOUNTS}/${config.api.ACCOUNTS}/${user.ID_ENTRADA}`;
          fetch(url, {
            method: "GET"
          })
            .then(data => data.json())
            .then(accounts => {
              resolve({
                user: user,
                accounts: accounts
              });
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve({
            user: null,
            accounts: []
          });
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getAccountsWithUserNoEncrypt = userId => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_ACCOUNTS}/${config.api.ACCOUNTS}/${userId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(accounts => {
        resolve({
          user: { ID_ENTRADA: userId },
          accounts: accounts
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

const getUser = userId => {
  const url = `${PROXY_CORS}${config.login.URL_DECRYPTED_USER}${userId}`;

  return new Promise((resolve, reject) => {
    let base64 = require("base-64");
    let headers = new Headers();
    headers.append(
      "Authorization",
      "Basic " + base64.encode(config.login.USER + ":" + config.login.PWD)
    );

    fetch(url, {
      method: "GET",
      headers: headers
    })
      .then(data => data.json())
      .then(user => {
        console.log("user found ->", user);
        resolve(user);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const deleteAccountByUserAndProvider = (userId, provider) => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_ACCOUNTS}/${config.api.DELETACCOUNTBYUSERANDPROVIDER}/${userId}/${provider}`;
    fetch(url, {
      method: "GET"
    })
    .then(_ => {
        resolve('OK');        
      })
      .catch(error => {
        reject(error);
      });
  });
};


