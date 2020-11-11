import * as moment from 'moment';
import * as encodings from 'text-encoding';
if (!global.TextDecoder) {
  global.TextDecoder = encodings.TextDecoder;
}

export const getEventClassifications = async (
  user,
  companyId,
  bbdd,
  mailId,
  pageSize = 0,
  pageIndex = 1
) => {
  const url = `${window.API_GATEWAY}/${CLASSIFICATIONS}?env=${window.currentEnv}`;
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
