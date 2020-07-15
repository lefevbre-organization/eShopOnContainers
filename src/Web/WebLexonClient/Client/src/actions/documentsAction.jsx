// types of action
const Types = {
  TOGGLE_MODAL_DOCUMENTS: 'TOGGLE_MODAL_DOCUMENTS',
  TOGGLE_MODAL_ATTACH_DOCUMENTS: 'TOGGLE_MODAL_ATTACH_DOCUMENTS',
  TOGGLE_MODAL_IMPORT_CONTACTS: 'TOGGLE_MODAL_IMPORT_CONTACTS',
};

// actions
const toggleModalDocuments = () => ({
  type: Types.TOGGLE_MODAL_DOCUMENTS,
});

const toggleModalAttachDocuments = () => ({
  type: Types.TOGGLE_MODAL_ATTACH_DOCUMENTS,
});

const toggleModalImportContacts = () => ({
  type: Types.TOGGLE_MODAL_IMPORT_CONTACTS,
});

export default {
  toggleModalDocuments,
  toggleModalAttachDocuments,
  toggleModalImportContacts,
  Types,
};
