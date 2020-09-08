//Api that return Lefebvre products by user navision

import * as moment from 'moment';

export const getProducts = async userId => {

  let url = `${window.API_GATEWAY}/api/v1/utils/userutils/user/apps?idNavisionUser=${userId}`;
  if(window.currentUser && window.currentUser.env) {
    url += `&env=${window.currentUser.env}`;
  }
  try {
    const res = await fetch(url, { method: 'GET' });
      const products = await res.json();

      return products;

  } catch (err) {
    throw err;
  }
};

