const dev = {
  url: {
    API_GATEWAY: "http://localhost:60970"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/lexon/classifications",
    CLASSIFICATIONS_ADD: "api/v1/lex/lexon/classifications/add",
    CLASSIFICATIONS_REMOVE: "api/v1/lex/lexon/classifications/remove",
    TYPES: "api/v1/lex/lexon/classifications/types",
    RESULTS: "api/v1/lex/lexon/files"
  }
};

const prod = {
  url: {
    API_GATEWAY: "http://localhost:60970"
  },
  api: {
    COMPANIES: "api/v1/lex/lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/lexon/classifications",
    CLASSIFICATIONS_ADD: "api/v1/lex/lexon/classifications/add",
    CLASSIFICATIONS_REMOVE: "api/v1/lex/lexon/classifications/remove",
    TYPES: "api/v1/lex/lexon/classifications/types",
    RESULTS: "api/v1/lex/lexon/files"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const PAGE_SELECT_COMPANY = "PAGE_SELECT_COMPANY";
export const PAGE_SELECT_ACTION = "PAGE_SELECT_ACTION";
