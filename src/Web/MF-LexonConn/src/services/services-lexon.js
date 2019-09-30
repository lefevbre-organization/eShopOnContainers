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

export const getClassifications = (userId, companyId, mailId) => {
  return new Promise((resolve, reject) => {
    //const url = `${config.url.API_ACCOUNTS}/${config.api.CLASSIFICATIONS}/${userId}/${companyId}/${mailId}`;
    const url = `${config.url.API_ACCOUNTS}/${config.api.CLASSIFICATIONS}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

// idUser, idCompany, idMail, idRelated, idType
export const removeClassification = (
  userId,
  companyId,
  mailId,
  relatedId,
  typeId
) => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_ACCOUNTS}/${config.api.CLASSIFICATIONS_REMOVE}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}&idRelated=${relatedId}&idType=${typeId}`;
    //const url = `${config.url.API_ACCOUNTS}/${config.api.CLASSIFICATIONS_REMOVE}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};
