export const getUser = async (
    data
  ) => {
    const url = `${window.API_GATEWAY}/api/v1/utils/Lexon/token/login?addTerminatorToToken=true`;
    const body = {
      login: data.login,
      password: data.password,
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

export const base64Decode = (user) => {
  const payload = user.result.data.token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
   }).join(''));
  return JSON.parse(jsonPayload);
}