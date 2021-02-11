import * as moment from 'moment';
import jwt_decode from 'jwt-decode';

export const getUser = async (userId, useCache = true) => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}`;
  let url2 = `${window.API_GATEWAY}/api/v1/utils/Lexon/token/lexon?addTerminatorToToken=true`;
  if(window.currentUser && window.currentUser.env) {
    url += `?env=${window.currentUser.env}`;
    url2 += `&env=${window.currentUser.env}`
  }

  try {
    const res = await fetch(url, {
      method: 'GET'
    });
    const user = await res.json();
    const res2 = await fetch(url2, { method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          idClienteNavision: userId
      })
    });
    const navUser = await res2.json();
    user.data.lexonUserId = navUser.data.idUser;
    const userData = jwt_decode(navUser.data.token, {complete: true});
    user.data.tokenDecoded = userData;

    return user;
  } catch (err) {
    throw err;
  }
};



export const addOrUpdateAccount = async (userId, account) => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}/account/addorupdate`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(account)
    });

    const user = await res.json();
    return user;
  } catch (err) {
    throw err;
  }
};

export const resetDefaultAccount = async userId => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}/account/reset`;

  try {
    const res = await fetch(url, {
      method: 'POST'
    });

    const user = await res.json();
    return user;
  } catch (err) {
    throw err;
  }
};

export const classifyEmail = async (
  id,
  subject,
  date,
  to,
  folder,
  provider,
  account,
  bbdd,
  userId
) => {
  const m = moment(date).format('YYYY-MM-DD HH:mm:ss');

  let url = `${window.API_GATEWAY}/api/v1/lex/Lexon/classifications/contacts/add`;

  const classification = {
    contactList: [...to],
    mail: {
      provider: provider,
      mailAccount: account,
      uid: id,
      subject: subject,
      date: m,
      folder
    },
    bbdd: bbdd,
    idUser: userId
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classification)
    });
    const data = await response.json();

    return data;
  } catch (err) {
    throw err;
  }
};

export const getEventTypes = async (account) => {
    let url = `${window.URL_GET_EVENTSTYPE}/ev/get`;

    let value = {
        "email": account
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(value),
        });

        const user = await res.json();
        return user;
    } catch (err) {
        throw err;
    }
};

export const addorUpdateEventType = async (eventType) => {
    let url = `${window.URL_GET_EVENTSTYPE}/ev/eventtype/add`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventType),
        });
        const eventtype = await res.json();
        return eventtype;
    } catch (err) {
        throw err;
    }
};


export const deleteEventType = async (eventType) => {   
    let url = `${window.URL_GET_EVENTSTYPE}/ev/eventtype/delete`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventType),
        });
        const eventtype = await res.json();
        return eventtype;
    } catch (err) {
        throw err;
    }
};
