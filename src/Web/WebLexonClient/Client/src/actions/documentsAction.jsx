// types of action
const Types = {
  TOGGLE_MODAL_DOCUMENTS: 'TOGGLE_MODAL_DOCUMENTS',
  TOGGLE_MODAL_ATTACH_DOCUMENTS: 'TOGGLE_MODAL_ATTACH_DOCUMENTS'
};

// actions
const toggleModalDocuments = () => ({
  type: Types.TOGGLE_MODAL_DOCUMENTS
});

const toggleModalAttachDocuments = () => ({
  type: Types.TOGGLE_MODAL_ATTACH_DOCUMENTS
});

export default {
  toggleModalDocuments,
  toggleModalAttachDocuments,
  Types
};
