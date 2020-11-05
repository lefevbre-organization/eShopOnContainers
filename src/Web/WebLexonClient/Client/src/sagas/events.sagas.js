import actions from '../actions/eventsAction';
import {call, put, takeEvery} from "@redux-saga/core/effects";
import {getEventClassifications} from "../services/services-lexon";


function* _getEventClassifications(action) {
    const {bbdd, user, eventId} = action.payload;
    const response = yield call(getEventClassifications, bbdd, user, eventId)
    yield put({ type: actions.Types.GET_EVENT_CLASSIFICATIONS_SUCCESS, payload: response.data.data})
}

export function* eventsSaga() {
    yield takeEvery(actions.Types.GET_EVENT_CLASSIFICATIONS, _getEventClassifications);
}
