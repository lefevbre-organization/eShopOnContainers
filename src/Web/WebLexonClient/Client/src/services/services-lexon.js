import * as moment from 'moment'
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

export const getClassifications = async (
  user,
  companyId,
  bbdd,
  mailId,
  pageSize = 0,
  pageIndex = 1
) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS}`;
    const body = {
      idMail: mailId,
      pageSize,
      pageIndex: 1,
      bbdd,
      idUser: user.idUser
    }

    try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    return { classifications: result.data }
  }
  catch(err) {
    throw err;
  }

};

export const addClassification = async (
  user,
  company,
  listMails,
  relatedId,
  typeId
) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_ADD}`;
    console.log(listMails)
    const body = {
      listaMails: listMails.map(mail => {
        const m = moment(mail.sentDateTime).format('YYYY-MM-DD HH:mm:ss');
        console.log("addClassfication: " + m)
        return {
          provider: user.provider,
          mailAccount: user.account,
          uid: mail.id,
          subject: mail.subject,
          date: m
        }
      }),
      idType: typeId,
      idUser: user.idUser,
      idRelated: relatedId,
      bbdd: company.bbdd
    };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      const result = await response.json();
      if (
        result.errors.length > 0 ||
        (result.errors !== null &&
          result.errors !== undefined &&
          (result.data === null ||
            result.data === undefined))
      ) {
        throw new Error(result.errors)
      } else {
        return { classifications: result.data }
      }
    }
    catch(err) {
      throw err;
    }
};

export const removeClassification = async (
  idMail,
  idType,
  bbdd,
  user,
  idRelated,
  idCompany
) => {
    const url = `${window.API_GATEWAY}/${CLASSIFICATIONS_REMOVE}`;
    const body = {
      idMail: idMail,
      idType: idType,
      bbdd: bbdd,
      idUser: user.idUser,
      idRelated: idRelated,
      idCompany: idCompany,
      provider: user.provider,
      mailAccount: user.account
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      const result = await response.json();
      if (
        result.errors.length > 0 ||
        (result.errors !== null &&
          result.errors !== undefined &&
          (result.data === null ||
            result.data === undefined))
      ) {
        throw new Error(result.errors)
      } else {
        return { results: result.data }
      }
    }
    catch(err) {
      throw err;
    }
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

export const getResults = async (user, company, typeId, search) => {
    const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=100&pageIndex=1&search=${search}&idUser=${user.idUser}&idCompany=${company.idCompany}&bbdd=${company.bbdd}&idType=${typeId}`;
    const body = {
      pageSize: 100,
      pageIndex: 1,
      search,
      idUser: user.idUser,
      bbdd: company.bbdd,
      idType: typeId
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      const result = await response.json();
      return { results: result.data }
    }
    catch(err) {
      throw err;
    }
};

export const getCasefile = async (user, bbdd, company, typeId, search) => {
  const url = `${window.API_GATEWAY}/${RESULTS}`;
  const body = {
    search,
    idUser: user,
    bbdd: bbdd,
    idType: typeId
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    return { results: result.data }
  }
  catch(err) {
    throw err;
  }
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
