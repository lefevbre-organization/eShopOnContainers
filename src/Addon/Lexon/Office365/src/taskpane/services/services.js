export const getCompanies = () => {
   
   return new Promise((resolve, reject) => {
     const url = `${window.API_GATEWAY}/companies`;   
     fetch(url, {
       method: 'GET',
       headers: {
         Accept: 'text/plain',
       },
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