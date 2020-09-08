import history from '../routes/history';
import jwt_decode from 'jwt-decode';

export const getUser = async (userId) => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}`;
  let url2 = `${window.API_GATEWAY}/api/v1/lex/Lexon/user?idUserNavision=${userId}`;
  if(window.currentUser && window.currentUser.env) {
    url += `?env=${window.currentUser.env}`;
    url2 += `&env=${window.currentUser.env}`
  }

  try {
    const res = await fetch(url, { method: 'GET' });
    const user = await res.json();
    const res2 = await fetch(url2, { method: 'GET' });
    const navUser = await res2.json();
    user.data.lexonUserId = navUser.data.idUser;
    const userData = jwt_decode(navUser.data.token, {complete: true});
    user.data.tokenDecoded = userData;

    return user;
  } catch (err) {
    history.push('/error/404');
  }
};

export const addOrUpdateAccount = async (userId, account) => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}/account/addorupdate`;
  if(window.currentUser && window.currentUser.env) {
    url += `?env=${window.currentUser.env}`;
  }

  console.log(account);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(account),
    });

    const user = await res.json();
    return user;
  } catch (err) {
    throw err;
  }
};

export const resetDefaultAccount = async (userId) => {
  let url = `${window.URL_GET_ACCOUNTS}/${userId}/account/reset`;
  if(window.currentUser && window.currentUser.env) {
    url += `?env=${window.currentUser.env}`;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
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
  let url = `${window.API_GATEWAY}/api/v1/lex/Lexon/classifications/contacts/add`;
  if(window.currentUser && window.currentUser.env) {
    url += `?env=${window.currentUser.env}`;
  }

  const classification = {
    contactList: [...to],
    mail: {
      provider: provider,
      mailAccount: account,
      uid: id,
      subject: subject,
      date: date,
      folder,
    },
    bbdd: bbdd,
    idUser: userId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classification),
    });
    const data = await response.json();

    return data;
  } catch (err) {
    throw err;
  }
};
