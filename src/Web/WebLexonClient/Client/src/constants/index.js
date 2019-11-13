const dev = {
  url: {
    //API_GATEWAY: "http://localhost:60970"
    API_GATEWAY: "http://localhost:8086"
  },
  api: {
    COMPANIES: "api/v1/lex/Lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/Lexon/classifications",
    CLASSIFICATIONS_ADD: "api/v1/lex/Lexon/classifications/add",
    CLASSIFICATIONS_REMOVE: "api/v1/lex/Lexon/classifications/remove",
    TYPES: "api/v1/lex/lexon/entities/types",
    RESULTS: "api/v1/lex/Lexon/entities"
  }
};

const prod = {
  url: {
    API_GATEWAY: "http://localhost:8086"
  },
  api: {
    COMPANIES: "api/v1/lex/Lexon/companies",
    CLASSIFICATIONS: "api/v1/lex/Lexon/classifications",
    CLASSIFICATIONS_ADD: "api/v1/lex/Lexon/classifications/add",
    CLASSIFICATIONS_REMOVE: "api/v1/lex/Lexon/classifications/remove",
    TYPES: "api/v1/lex/Lexon/entities/types",
    RESULTS: "api/v1/lex/Lexon/entities"
  }
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
export const PAGE_SELECT_COMPANY = "PAGE_SELECT_COMPANY";
export const PAGE_SELECT_ACTION = "PAGE_SELECT_ACTION";
