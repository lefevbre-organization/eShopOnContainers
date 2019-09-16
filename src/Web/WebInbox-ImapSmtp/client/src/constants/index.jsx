export const PROVIDER = "IMAP";

const dev = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "http://localhost:60980/api/v1/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT:
      "http://localhost:3000"
  }
};

const prod = {
  url: {
    URL_UPDATE_DEFAULTACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/updatedefaultaccount",
    URL_RESET_DEFAULTACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/resetdefaultaccountbyuser",
    URL_DELETE_ACCOUNT:
      "https://useraccounts.azurewebsites.net/api/accounts/emailuseraccount/deleteaccountbyuserandprovider",
    URL_SELECT_ACCOUNT:
      "https://lefebvre-approot.azurewebsites.net"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
