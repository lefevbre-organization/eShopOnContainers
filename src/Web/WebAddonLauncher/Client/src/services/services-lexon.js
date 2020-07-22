export const getUser = async (
    data
  ) => {
    const url = `${window.URL_GET_USER}/user/login`
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

export const getCentinelaUser = async (data) => {
  const url = `${window.URL_GET_USER}/token`;

  let formData = new FormData();

  formData.append('login', data.login);
  formData.append('password', data.password);
  formData.append('idApp', 2);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    return { result };
  } catch (err) {
    throw err;
  }
}