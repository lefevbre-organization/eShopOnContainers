import { persistState, recoverState } from "./indexed-db";
import { INITIAL_STATE } from "../reducers";
import { processFolders } from "./folder";

export const KEY_USER_ID = "KEY_USER_ID";
export const KEY_HASH = "KEY_HASH";
export const LEXON = "LEXON";

function emptyState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

/**
 * Loads the Redux Store state back from the Browser's IndexedDB.
 *
 * It first checks the Browser's session storage to retrieve the hashed user id and the hashed user credentials.
 *
 * Hashed user id will be used as the key in the IndexedDB and the credential hash as the cypher password.
 *
 * @returns {Promise<*>}
 */
export async function loadState() {
  const state = emptyState();
  //const userId = sessionStorage.getItem(KEY_USER_ID);
  //const hash = sessionStorage.getItem(KEY_HASH);
  const userId = localStorage.getItem(KEY_USER_ID);
  const hash = localStorage.getItem(KEY_HASH);
  if (userId !== null && hash !== null) {
    const dbState = await recoverState(userId, hash);
    if (dbState && dbState.application && dbState.folders && dbState.messages) {
      state.application = { ...dbState.application };
      state.folders.items = [...dbState.folders.items];
      state.folders.explodedItems = { ...dbState.folders.explodedItems };
      processFolders(Object.values(state.folders.explodedItems));
      state.login = { ...dbState.login };
      state.messages.cache = { ...dbState.messages.cache };
    }
  }
  const lexon = localStorage.getItem(LEXON);
  if (lexon !== null && lexon.user !== null) {
    state.lexon = JSON.parse(lexon);
  }

  return state;
}

/**
 * Stores the current Redux Store state into the Browser's IndexedDB using an encryption algorithm under a hashed key.
 *
 * In order to be able to retrieve back the state from the indexed db, the hashed user id and the hashed user credentials
 * will be used as key and cypher password.
 *
 * @param dispatch {(Dispatch<any>|function)}
 * @param state
 */
export function saveState(dispatch, state) {
  //sessionStorage.setItem(KEY_USER_ID, state.application.user.id);
  //sessionStorage.setItem(KEY_HASH, state.application.user.hash);

  localStorage.setItem(KEY_USER_ID, state.application.user.id);
  localStorage.setItem(KEY_HASH, state.application.user.hash);
  localStorage.setItem(LEXON, JSON.stringify(state.lexon));

  persistState(dispatch, state);
}

export function removeState() {
  //sessionStorage.removeItem(KEY_USER_ID);
  //sessionStorage.removeItem(KEY_HASH);
  localStorage.removeItem(KEY_USER_ID);
  localStorage.removeItem(KEY_HASH);
  localStorage.removeItem(LEXON);
  sessionStorage.clear();
}

export function removeStateExLexon() {    
    localStorage.removeItem(KEY_USER_ID);
    localStorage.removeItem(KEY_HASH);
    sessionStorage.clear();
}
