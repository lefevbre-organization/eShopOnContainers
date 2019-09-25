const dev = {
  url: {
    API_ACCOUNTS: "http://localhost:60980"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies"
  }
};

const prod = {
  url: {
    API_ACCOUNTS: "http://localhost:60980"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
