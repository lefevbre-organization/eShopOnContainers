const dev = {
  url: {
    API_ACCOUNTS: "http://localhost:60980"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/lexon/classifications"
  }
};

const prod = {
  url: {
    API_ACCOUNTS: "http://localhost:60980"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/lexon/classifications"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const PAGE_SELECT_COMPANY = 'PAGE_SELECT_COMPANY';
export const PAGE_SELECT_ACTION = 'PAGE_SELECT_ACTION';
