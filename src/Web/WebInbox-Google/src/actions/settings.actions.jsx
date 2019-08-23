export const STORE_USER = 'STORE_USER';

export const storeUser = (userId) => dispatch => {
    dispatch({
        type: STORE_USER,
        userId
    });
};