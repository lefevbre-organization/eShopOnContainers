import { config, PROXY_CORS, PARAMS_ACCOUNTS } from "../constants";
// import data from "../data.json";

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

export const getAccountsWithUserEncrypt = async userId => {
  try {
    const user = await getUser(userId)
    const result = await getAccountsWithUserNoEncrypt(user.N_ENTRADA);
    return result;
  } catch(err) {
    throw err;
  }
};

export const getAccountsWithUserNoEncrypt = async userId => {
  const url = `${window.API_ACCOUNTS}/${PARAMS_ACCOUNTS}/${userId}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    let result = await response.json();

    if (result) {
      if (result.errors.length === 0) {
        let accounts = [];
        if (result.data && result.data.accounts) {
          accounts = result.data.accounts.map(ac => ({ ...ac, provider: ac.provider.toUpperCase(), user: userId }))
        }
        return {
          user: { ID_ENTRADA: userId },
          accounts
        };
      } else {
        let errors;
        result.errors.forEach(function (error) {
          errors = `${error} `
        });

        // Creates the user
        result = await createUser(userId);

        if (result) {
          if (result.errors.length === 0) {
            let accounts = [];
            if (result.data && result.data.accounts) {
              accounts = result.data.accounts.map(ac => ({ ...ac, provider: ac.provider.toUpperCase(), user: userId }))
            }
            return {
              user: { ID_ENTRADA: userId },
              accounts
            };
          } else {
            result.errors.forEach(function (error) {
              errors = `${error} `
            });
            throw errors
          }
        }
        return result;
      }
    }
  } catch (err) {
    throw err;
  }
};

export const createUser = async userId => {
  try {
    const url = `${window.API_ACCOUNTS}/${PARAMS_ACCOUNTS}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "user": userId,
        "state": true,
        "configUser": {
          "getContacts": false,
          "defaultAdjunction": "onlyAttachments",
          "defaultEntity": "contacts"
      },
        "accounts": []
      })
    })
    const user = await response.json();
    return user;
  } catch (err) {
    throw err;
  }
}

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

export const deleteAccountByUserAndEmail = (encrypt, userId, provider, email) => {
  return new Promise((resolve, reject) => {
    if (encrypt === "1") {
      getUser(userId).then(user => {
        if (user.ID_ENTRADA != null) {
          const url = `${window.API_ACCOUNTS}/api/v2/accounts/usermail/${userId}/account/delete/${provider}/${email}`;
          fetch(url, {
            method: "POST"
          })
            .then(data => data.json())
            .then(result => {
              if (result.errors.length === 0) {
                resolve({
                  data: result.data
                });
              } else {
                let errors;
                result.errors.forEach(function (error) {
                  errors = `${error} `
                });
                reject(errors);
              }
            })
            .catch(error => {
              reject(error);
            });
        } else {
          resolve("Error ->");
        }
      });
    } else {
      const url = `${window.API_ACCOUNTS}/api/v2/accounts/usermail/${userId}/account/delete/${provider}/${email}`;
      fetch(url, {
        method: "POST"
      })
        .then(data => data.json())
        .then(result => {
          if (result.errors.length === 0) {
            resolve({
              data: result.data
            });
          } else {
            let errors = [];
            result.errors.forEach(function (error) {
              errors.push(error.message)
            });
            reject(errors);
          }
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};
