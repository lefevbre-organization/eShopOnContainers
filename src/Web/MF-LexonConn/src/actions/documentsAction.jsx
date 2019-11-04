// types of action
const Types = {
  TOGGLE_MODAL_DOCUMENTS: "TOGGLE_MODAL_DOCUMENTS"
};

// actions
const toggleModalDocuments = () => ({
  type: Types.TOGGLE_MODAL_DOCUMENTS
});

export default {
  toggleModalDocuments,
  Types
};
