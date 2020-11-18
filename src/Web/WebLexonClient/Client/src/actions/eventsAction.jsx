// types of action
const Types = {
  GET_EVENT_CLASSIFICATIONS: 'GET_EVENT_CLASSIFICATIONS',
  GET_EVENT_CLASSIFICATIONS_SUCCESS: 'GET_EVENT_CLASSIFICATIONS_SUCCESS',
  GET_EVENT_CLASSIFICATIONS_ERROR: 'GET_EVENT_CLASSIFICATIONS_ERROR'
};

// actions
const getEventClassifications = (eventId) => ({
  type: Types.GET_EVENT_CLASSIFICATIONS,
  payload: eventId
});


export default {
  getEventClassifications,
  Types,
};
