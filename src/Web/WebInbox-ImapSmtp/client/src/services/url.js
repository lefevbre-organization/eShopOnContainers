/**
 * Hardcoded URLS for the application.
 * URLs should come from HATEOAS. For each entity we need at least a point of entry.
 *
 * <i>Depending on the project evolution, some of the URLs could be retrieved as links of the login response entity</i>
 *
 * @type {{LOGIN: string, FOLDERS: string}}
 */
export const URLS = {
  LOGIN: `${window.URL_SERVER_API}/api/v1/application/login`,
  FOLDERS: `${window.URL_SERVER_API}/api/v1/folders`,
  SMTP: `${window.URL_SERVER_API}/api/v1/smtp`
};
