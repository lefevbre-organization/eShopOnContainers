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
      // listaMails: listMails,
      listaMails: listMails.map(mail => {
        return mail.id;
      }),
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
        if (
          result.errors.length > 0 ||
          (result.errors !== null &&
            result.errors !== undefined &&
            (result.data === null ||
            result.data === undefined))
        ) {
          reject(result.errors);
        } else {
          resolve({
            classifications: result.data
          });
        }
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
      idType: idType,
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
        console.log("result ->", result);
        if (
          result.errors.length > 0 ||
          (result.errors !== null &&
            result.errors !== undefined &&
            (result.data === null ||
            result.data === undefined))
        ) {
          reject(result.errors);
        } else {
          resolve({
            results: result.data
          });
        }
      })
      .catch(error => {
        console.log("Error ->", error);
        reject(error);
      });
  });
};

export const getTypes = () => {
  const typesHidden = [4, 10, 11, 13, 14];
  // 0: {idEntity: 1, name: "Expedientes", extraElements: null}
  // 1: {idEntity: 2, name: "Clientes", extraElements: null}
  // 2: {idEntity: 3, name: "Contrarios", extraElements: null}
  // 3: {idEntity: 4, name: "Proveedores", extraElements: null}
  // 4: {idEntity: 5, name: "Abogados Propios", extraElements: null}
  // 5: {idEntity: 6, name: "Abogados Contrarios", extraElements: null}
  // 6: {idEntity: 7, name: "Procuradores Propios", extraElements: null}
  // 7: {idEntity: 8, name: "Procuradores Contrarios", extraElements: null}
  // 8: {idEntity: 9, name: "Notarios", extraElements: null}
  // 9: {idEntity: 10, name: "Juzgados", extraElements: null}
  // 10: {idEntity: 11, name: "Aseguradoras", extraElements: null}
  // 11: {idEntity: 12, name: "Otros", extraElements: null}
  // 12: {idEntity: 13, name: "Carpetas", extraElements: null}
  // 13: {idEntity: 14, name: "Documentos", extraElements: null}
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${TYPES}`;
    fetch(url, {
      method: "GET"
    })
      .then(data => data.json())
      .then(result => {
        resolve({
          types: result.data.filter(
            entity => !typesHidden.includes(entity.idEntity)
          )
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
