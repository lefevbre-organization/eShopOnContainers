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
          companies: result.data,
          errors: result.errors
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
  company,
  listMails,
  relatedId,
  typeId
) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_ADD}`;
    const classification = {
      listaMails: ["listMails"],
      idType: typeId,
      //idUser: userId,
      idUser: "449",
      idRelated: relatedId,
      idCompany: company.idCompany,
      bbdd: company.bbdd
    };


    fetch(url, {
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(classification)
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          classifications: result.data
        });
      })
      .catch(error => {
        console.log("Error ->", error);
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
    // const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=100&pageIndex=1&search=${search}&idUser=${userId}&idCompany=${companyId}&idType=${typeId}`;
    const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=100&pageIndex=1&search=${search}&idUser=449&idCompany=${companyId}&idType=${typeId}`;
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
