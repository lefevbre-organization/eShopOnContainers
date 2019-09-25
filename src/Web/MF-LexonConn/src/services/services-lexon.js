import { config } from "../constants";

export const getCompanies = userId => {
  return new Promise((resolve, reject) => {
    //const url = `${config.url.API_ACCOUNTS}/${config.api.COMPANIES}/${userId}`;
    const url = `${config.url.API_ACCOUNTS}/${config.api.COMPANIES}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          companies: result
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};
