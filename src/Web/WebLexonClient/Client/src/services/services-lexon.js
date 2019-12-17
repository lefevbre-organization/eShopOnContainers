import {
  COMPANIES,
  CLASSIFICATIONS,
  CLASSIFICATIONS_ADD,
  CLASSIFICATIONS_REMOVE,
  TYPES,
  RESULTS,
  USER
} from "../constants";

export const getCompanies = user => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${COMPANIES}?idUser=${user.idUser}`;

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

export const getClassifications = (
  user,
  companyId,
  bbdd,
  mailId,
  pageSize = 0,
  pageIndex = 1
) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS}?idUser=${user.idUser}&idCompany=${companyId}&bbdd=${bbdd}&idMail=${mailId}&pageSize=${pageSize}&pageIndex=${pageIndex}`;
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

export const addClassification = (
  user,
  company,
  listMails,
  relatedId,
  typeId
) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_ADD}`;
    const classification = {
      listaMails: listMails,
      idType: typeId,
      idUser: user.idUser,
      idRelated: relatedId,
      idCompany: company.idCompany,
      bbdd: company.bbdd
    };

    fetch(url, {
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json"
      },
      method: "PUT",
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

export const removeClassification = (
  idMail,
  idType,
  bbdd,
  user,
  idRelated,
  idCompany
) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_REMOVE}`;
    const classification = {
      idMail: idMail,
      idType: 1,
      // idType: idType,
      bbdd: bbdd,
      idUser: user.idUser,
      idRelated: idRelated,
      idCompany: idCompany
    };

    fetch(url, {
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json"
      },
      method: "PUT",
      body: JSON.stringify(classification)
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          results: result.data
        });
      })
      .catch(error => {
        console.log("Error ->", error);
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

export const getResults = (user, company, typeId, search) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=100&pageIndex=1&search=${search}&idUser=${user.idUser}&idCompany=${company.idCompany}&bbdd=${company.bbdd}&idType=${typeId}`;
    //const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=100&pageIndex=1&search=${search}&idUser=449&idCompany=${companyId}&idType=${typeId}`;
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

export const getCasefile = (user, bbdd, company, typeId, search) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${RESULTS}?search=${search}&idUser=${user}&idCompany=${company}&bbdd=${bbdd}&idType=${typeId}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          results:
            result.data !== null &&
            result.data.data !== null &&
            Array.isArray(result.data.data) &&
            result.data.data.length > 0
              ? result.data.data[0]
              : null
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getUser = userNavision => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${USER}/?idUserNavision=${userNavision}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          user: result.data
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};
