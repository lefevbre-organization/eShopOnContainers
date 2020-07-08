export const getUser = async (
    data
  ) => {
    const url = `${window.URL_GET_USER}`
    + '?login='+ data.login + '&pass=' + 
    data.password;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });
      const result = await response.json();
  
      return { result };
    } catch (err) {
      throw err;
    }
  };