import * as moment from 'moment';
import {
  COMPANIES,
  CLASSIFICATIONS,
  CLASSIFICATIONS_ADD,
  CLASSIFICATIONS_REMOVE,
  TYPES,
  RESULTS,
  USER,
} from '../constants';

import * as encodings from 'text-encoding';
if (!global.TextDecoder) {
  global.TextDecoder = encodings.TextDecoder;
}
export const getCompanies = (user) => {
  return new Promise((resolve, reject) => {
    const url = `${window.API_GATEWAY}/${COMPANIES}?idUser=${user.idUser}`;

    fetch(url, {
      method: 'GET',
    })
      .then((data) => data.json())
      .then((result) => {
        resolve({
          companies: result.data,
          errors: result.errors,
        });
      })
      .catch((error) => {
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
    idUser: user.idUser,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return { classifications: result.data };
  } catch (err) {
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
  console.log(listMails);
  const body = {
    listaMails: listMails.map((mail) => {
      const m = moment(mail.sentDateTime).format('YYYY-MM-DD HH:mm:ss');
      console.log('addClassfication: ' + m);
      return {
        provider: user.provider,
        mailAccount: user.account,
        uid: mail.id,
        folder: mail.folder,
        subject: mail.subject,
        date: m,
      };
    }),
    idType: typeId,
    idUser: user.idUser,
    idRelated: relatedId,
    bbdd: company.bbdd,
  };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (
      result.errors.length > 0 ||
      (result.errors !== null &&
        result.errors !== undefined &&
        (result.data === null || result.data === undefined))
    ) {
      throw new Error(result.errors);
    } else {
      return { classifications: result.data };
    }
  } catch (err) {
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
    mailAccount: user.account,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (
      result.errors.length > 0 ||
      (result.errors !== null &&
        result.errors !== undefined &&
        (result.data === null || result.data === undefined))
    ) {
      throw new Error(result.errors);
    } else {
      return { results: result.data };
    }
  } catch (err) {
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
      method: 'GET',
    })
      .then((data) => data.json())
      .then((result) => {
        resolve({
          types: result.data.filter(
            (entity) => !typesHidden.includes(entity.idEntity)
          ),
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getResults = async (
  user,
  company,
  typeId,
  search,
  pageSize,
  page
) => {
  const ps = pageSize || 100;
  const cp = page || 1;
  const url = `${window.API_GATEWAY}/${RESULTS}?pageSize=${ps}&pageIndex=${cp}&search=${search}&idUser=${user.idUser}&idCompany=${company.idCompany}&bbdd=${company.bbdd}&idType=${typeId}`;
  const body = {
    pageSize: ps,
    pageIndex: cp,
    search,
    idUser: user.idUser,
    bbdd: company.bbdd,
    idType: typeId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 404) {
      return { results: { data: [], count: 0 } };
    }

    const result = await response.json();
    if (response.status === 400) {
      throw result;
    }

    console.log(result);
    if (result.errors.length > 0) {
      throw result;
    }

    return { results: result.data };
  } catch (err) {
    throw err;
  }
};

export const getCasefile = async (user, bbdd, company, typeId, search) => {
  const url = `${window.API_GATEWAY}/${RESULTS}`;
  const body = {
    search,
    idUser: user,
    bbdd: bbdd,
    idType: typeId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return { results: result.data };
  } catch (err) {
    throw err;
  }
};

export const getUser = async (userNavision) => {
  const url = `${window.API_GATEWAY}/${USER}/?idUserNavision=${userNavision}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const result = await response.json();
    const user = result.data;

    const url2 = `${window.URL_GET_ACCOUNTS}/${user.idNavision}`;
    const response2 = await fetch(url2, { method: 'GET' });
    const result2 = await response2.json();

    return { user, config: result2.data.configUser };
  } catch (err) {
    throw err;
  }
};

export const saveUserConfig = (config, userId) => {
  return new Promise((resolve, reject) => {
    const url = `${window.URL_GET_ACCOUNTS}/${userId}/config/addorupdate`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(config),
    })
      .then((data) => data.json())
      .then((result) => {
        resolve({
          user: result.data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getFolderTree = async (
  idFolder,
  bbdd,
  idUser,
  includeFiles = false
) => {
  const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/folders/nested`;
  const body = {
    idFolder,
    nestedLimit: 0,
    includeFiles,
    bbdd,
    idUser,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    return { result };
  } catch (err) {
    throw err;
  }
};

export const createFolder = async (
  idParent,
  name,
  idEntity,
  idType,
  bbdd,
  idUser
) => {
  const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/folders/add`;
  const body = {
    idParent,
    name,
    idEntity,
    idType,
    bbdd,
    idUser,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    return { result };
  } catch (err) {
    throw err;
  }
};

export const uploadFile = async (
  idFolder,
  idEntity,
  idType,
  idActuation,
  bbdd,
  idUser,
  nameFile,
  contentFile
) => {

  // Check namefile
  debugger;
  if(nameFile.length > 255) {
    const extension = nameFile.split('.').pop();
    const name = nameFile.substring(0, nameFile.length - (extension.length + 1));
    const final = name.substring(0, 250) + "." + extension;
    nameFile = final;
  }

  const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/files/post`;
  const body = {
    idParent: idFolder,
    idEntity,
    idType,
    bbdd,
    idUser,
    idActuation,
    name: nameFile,
    contentFile,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return { response };
  } catch (err) {
    throw err;
  }
};

export const downloadFile = async (
  idEntity,
  bbdd,
  idUser,
  progressCallback
) => {
  const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/entities/files/get`;
  const body = {
    idEntity,
    bbdd,
    idUser,
  };

  try {
    let progress = 0;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      return response;
    }
    const contentLength = +response.headers.get('Content-Length');
    progressCallback &&
      progressCallback({ length: contentLength, progress: progress });

    const reader = response.body.getReader();
    let receivedLength = 0; // received that many bytes at the moment
    let chunks = []; // array of received binary chunks (comprises the body)

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      receivedLength += value.length;

      progress = Math.ceil((receivedLength * 100) / contentLength);
      progressCallback && progressCallback({ progress: progress });
    }

    let chunksAll = new Uint8Array(receivedLength); // (4.1)
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    }

    let result = new TextDecoder('utf-8').decode(chunksAll);

    // We're done!
    let commits = JSON.parse(result);
    progressCallback && progressCallback({ progress: 100 });

    return { ...commits, status: 200 };
  } catch (err) {
    throw err;
  }
};

export const getRawAddon = async (addonData) => {
  const url =
    `${window.URL_GET_ACCOUNTS}/${addonData.idClienteNav}/raw?` +
    'provider=' +
    addonData.provider +
    '&account=' +
    addonData.account +
    '&messageId=' +
    addonData.messageById;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();

    return { result };
  } catch (err) {
    throw err;
  }
};

export const getUserContacts = async (bbdd, idUser) => {
  const url = `${window.API_GATEWAY}/api/v1/lex/Lexon/classifications/contact/all`;
  const body = {
    bbdd,
    idUser,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    return { result };
  } catch (err) {
    throw err;
  }
};
