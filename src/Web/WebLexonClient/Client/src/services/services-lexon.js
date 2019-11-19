import {
  COMPANIES,
  CLASSIFICATIONS,
  CLASSIFICATIONS_ADD,
  CLASSIFICATIONS_REMOVE,
  TYPES,
  RESULTS
} from "../constants";

export const getCompanies = userId => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${COMPANIES}?idUser=${userId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          companies: result.data
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getClassifications = (userId, companyId, mailId) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result.data
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
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_ADD}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}&idRelated=${relatedId}&idType=${typeId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result.data
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
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_REMOVE}?idUser=${userId}&idCompany=${companyId}&idMail=${mailId}&idRelated=${relatedId}&idType=${typeId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result.data
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getTypes = () => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${TYPES}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          types: result.data
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getResults = (userId, companyId, typeId, search) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${RESULTS}?idUser=${userId}&idCompany=${companyId}&idType=${typeId}&search=${search}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          results: result.data
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};
