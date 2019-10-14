import { config } from "../constants";

export const getCompanies = userId => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_GATEWAY}/${config.api.COMPANIES}?idUser=${userId}`;
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
    const url = `${config.url.API_GATEWAY}/${config.api.CLASSIFICATIONS}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}`;
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
export const addClassification = (
  userId,
  companyId,
  mailId,
  relatedId,
  typeId
) => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_GATEWAY}/${config.api.CLASSIFICATIONS_ADD}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}&idRelated=${relatedId}&idType=${typeId}`;
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
    const url = `${config.url.API_GATEWAY}/${config.api.CLASSIFICATIONS_REMOVE}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}&idRelated=${relatedId}&idType=${typeId}`;
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

export const getTypes = () => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_GATEWAY}/${config.api.TYPES}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          types: result
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getResults = (userId, companyId, typeId, search) => {
  return new Promise((resolve, reject) => {
    const url = `${config.url.API_GATEWAY}/${config.api.RESULTS}?idUser=${userId}&idCompany=${companyId}&idType=${typeId}&search=${search}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          results: result
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};
