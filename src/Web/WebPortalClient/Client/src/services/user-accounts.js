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

export const getAccountsWithUserEncrypt = userId => {
  return new Promise((resolve, reject) => {
    getUser(userId)
      .then(user => {
        user.ID_ENTRADA != null
          ? console.log(`User [${userId}] exists: ${user.ID_ENTRADA}`)
          : console.log(`User [${userId}] NOT exists`);

        if (user.ID_ENTRADA != null) {
          const url = `${window.API_ACCOUNTS}/${PARAMS_ACCOUNTS}/${user.N_ENTRADA}`;
          fetch(url, {
            method: "GET"
          })
          .then(data => data.json())
          .then(result => {
            if (result.errors.length === 0) {
              resolve({
                user: { ID_ENTRADA: user.N_ENTRADA },
                accounts: result.data.accounts
              });
            } else {
              let errors;
              result.errors.forEach(function(error) {
                errors = `${error} `
              });
              reject(errors);
            }
          })
          .catch(error => {
            reject(`${error.message} [${url}]`);
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
    const url = `${window.API_ACCOUNTS}/${PARAMS_ACCOUNTS}/${userId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        if (result.errors.length === 0) {
          let accounts = [];
          if(result.data && result.data.accounts) {
            accounts = result.data.accounts.map( ac=> ({ ...ac, provider: ac.provider.toUpperCase(), user: userId}) )
          }
          resolve({
            user: { ID_ENTRADA: userId },
            accounts
          });
        } else {
          let errors;
          result.errors.forEach(function(error) {
            errors = `${error} `
          });
          reject(errors);
        }
      })
      .catch(error => {
        reject(`${error.message} [${url}]`);
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
                result.errors.forEach(function(error) {
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
            let errors;
            result.errors.forEach(function(error) {
              errors = `${error} `
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
