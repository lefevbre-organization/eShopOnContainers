import { config, PROXY_CORS, RESULT_OK } from "../constants";
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
        console.log("error ->", error);
        // resolve(data.accounts);
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
            .then(result => {
              if (result.status === RESULT_OK) {
                resolve({
                  user: user,
                  accounts: result.result
                });
              } else {
                console.log("Error ->", result.description);
                resolve({
                  user: user,
                  accounts: []
                });
              }
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
      .then(result => {
        if (result.status === RESULT_OK) {
          resolve({
            user: { ID_ENTRADA: userId },
            accounts: result.result
          });
        } else {
          console.log("Error ->", result.description);
          resolve({
            user: { ID_ENTRADA: userId },
            accounts: []
          });
        }
      })
      .catch(error => {
        reject(error);
        // resolve({
        //   user: { ID_ENTRADA: userId },
        //   accounts: data.accounts
        // });
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

export const deleteAccountByUserAndProvider = (encrypt, userId, provider) => {
  return new Promise((resolve, reject) => {
    if (encrypt === "1") {
      getUser(userId).then(user => {
        if (user.ID_ENTRADA != null) {
          const url = `${config.url.API_ACCOUNTS}/${config.api.DELETACCOUNTBYUSERANDPROVIDER}/${user.ID_ENTRADA}/${provider}`;
          fetch(url, {
            method: "GET"
          })
            .then(data => data.json())
            .then(result => {
              if (result.status === RESULT_OK) {
                resolve("OK");
              } else {
                console.log("Error ->", result.description);
                resolve("Error ->", result.description);
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
      const url = `${config.url.API_ACCOUNTS}/${config.api.DELETACCOUNTBYUSERANDPROVIDER}/${userId}/${provider}`;
      fetch(url, {
        method: "GET"
      })
        .then(data => data.json())
        .then(result => {
          if (result.status === RESULT_OK) {
            resolve("OK");
          } else {
            console.log("Error ->", result.description);
            resolve("Error ->", result.description);
          }
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

export const deleteAccountByUserAndEmail = (encrypt, userId, email) => {
  return new Promise((resolve, reject) => {
    if (encrypt === "1") {
      getUser(userId).then(user => {
        if (user.ID_ENTRADA != null) {
          const url = `${config.url.API_ACCOUNTS}/${config.api.DELETACCOUNTBYUSERANDEMAIL}/${user.ID_ENTRADA}/${email}`;
          fetch(url, {
            method: "GET"
          })
            .then(data => data.json())
            .then(result => {
              if (result.status === RESULT_OK) {
                resolve("OK");
              } else {
                console.log("Error ->", result.description);
                resolve("Error ->", result.description);
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
      const url = `${config.url.API_ACCOUNTS}/${config.api.DELETACCOUNTBYUSERANDEMAIL}/${userId}/${email}`;
      fetch(url, {
        method: "GET"
      })
        .then(data => data.json())
        .then(result => {
          if (result.status === RESULT_OK) {
            resolve("OK");
          } else {
            console.log("Error ->", result.description);
            resolve("Error ->", result.description);
          }
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};
