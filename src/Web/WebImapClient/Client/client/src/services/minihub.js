//Api that return Lefebvre products by user navision
export const getProducts = async userId => {
  
  const url = `${window.API_GATEWAY}/api/v1/mysql/LexonMySql/user/apps?idNavisionUser=${userId}`;

  try {
    const res = await fetch(url, { method: 'GET' });
      const products = await res.json();

      return products;

  } catch (err) {
    throw err;
  }
};

