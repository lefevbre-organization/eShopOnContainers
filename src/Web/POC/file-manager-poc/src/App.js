import React from 'react';
import { L10n } from '@syncfusion/ej2-base';
import i18n from 'i18next';

import AppRoute from './App.route';
import './App.scss';

L10n.load({
	'es': {
		'filemanager': {
			'NewFolder': i18n.t('file_manager_new_folder'),
			'Upload': i18n.t('file_manager_upload'),
			'Delete': i18n.t('file_manager_delete'),
			'Rename': i18n.t('file_manager_rename'),
			'Download': i18n.t('file_manager_download'),
			'Cut': i18n.t('file_manager_cut'),
			'Copy': i18n.t('file_manager_copy'),
			'Paste': i18n.t('file_manager_Paste'),
			'SortBy': i18n.t('file_manager_sortby'),
			'Refresh': i18n.t('file_manager_refresh'),
			'Item-Selection': i18n.t('file_manager_item_selection'),
			'Items-Selection': i18n.t('file_manager_items_selection'),
			'View': i18n.t('file_manager_view'),
			'Details': i18n.t('file_manager_details'),
			'SelectAll': i18n.t('file_manager_selectall'),
			'Open': i18n.t('file_manager_open'),
			'Tooltip-NewFolder': i18n.t('file_manager_new_folder'),
			'Tooltip-Upload': i18n.t('file_manager_upload'),
			'Tooltip-Delete': i18n.t('file_manager_delete'),
			'Tooltip-Rename': i18n.t('file_manager_rename'),
			'Tooltip-Download': i18n.t('file_manager_download'),
			'Tooltip-Cut': i18n.t('file_manager_cut'),
			'Tooltip-Copy': i18n.t('file_manager_copy'),
			'Tooltip-Paste': i18n.t('file_manager_Paste'),
			'Tooltip-SortBy': i18n.t('file_manager_sortby'),
			'Tooltip-Refresh': i18n.t('file_manager_refresh'),
			'Tooltip-Selection': i18n.t('file_manager_item_selection'),
			'Tooltip-View': i18n.t('file_manager_view'),
			'Tooltip-Details': i18n.t('file_manager_details'),
			'Tooltip-SelectAll': i18n.t('file_manager_selectall'),
			'Name': i18n.t('file_manager_name'),
			'Size': i18n.t('file_manager_size'),
			'DateModified': i18n.t('file_manager_date_modified'),
			'DateCreated': i18n.t('file_manager_date_created'),
			'Path': i18n.t('file_manager_path'),
			'Modified': i18n.t('file_manager_modified'),
			'Created': i18n.t('file_manager_created'),
			'Location': i18n.t('file_manager_location'),
			'Type': i18n.t('file_manager_type'),
			'Permission': i18n.t('file_manager_permission'),
			'Ascending': i18n.t('file_manager_ascending'),
			'Descending': i18n.t('file_manager_descending'),
			'View-LargeIcons': i18n.t('file_manager_view_largeIcons'),
			'View-Details': i18n.t('file_manager_view_details'),
			'Search': i18n.t('file_manager_search'),
			'Button-Ok': i18n.t('file_manager_button_ok'),
			'Button-Cancel': i18n.t('file_manager_button_cancel'),
			'Button-Yes': i18n.t('file_manager_button_yes'),
			'Button-No': i18n.t('file_manager_button_no'),
			'Button-Create': i18n.t('file_manager_button_create'),
			'Button-Save': i18n.t('file_manager_button_save'),
			'Header-NewFolder': i18n.t('file_manager_header_new_folder'),
			'Content-NewFolder': i18n.t('file_manager_content_new_folder'),
			'Header-Rename': i18n.t('file_manager_rename'),
			'Content-Rename': i18n.t('file_manager_content_rename'),
			'Header-Rename-Confirmation': i18n.t('file_rename_confirmation'),
			'Content-Rename-Confirmation': i18n.t('content_confirmation'),
			'Header-Delete': i18n.t('file_manager_header_delete'),
			'Content-Delete': i18n.t('file_manager_content_delete'),
			'Header-Multiple-Delete': i18n.t('file_header_multiple_delete'),
			'Content-Multiple-Delete': i18n.t('file_content_multiple_delete'),
			'Header-Duplicate': i18n.t('file_manager_header_duplicate'),
			'Content-Duplicate': i18n.t('file_manager_content_duplicate'),
			'Header-Upload': i18n.t('file_manager_header_upload'),
			'Error':  i18n.t('file_manager_error'),
			'Validation-Empty': i18n.t('file_manager_validation_empty'),
			'Validation-Invalid': i18n.t('file_manager_validation_invalid'),
			'Validation-NewFolder-Exists': i18n.t('valid_newfolder_exists'),
			'Validation-Rename-Exists': i18n.t('validation_rename_exists'),
			'Folder-Empty': i18n.t('file_manager_folder_empty'),
			'File-Upload': i18n.t('file_manager_file_upload'),
			'Search-Empty': i18n.t('file_manager_search_empty'),
			'Search-Key': i18n.t('file_manager_search_key'),
			'Sub-Folder-Error': i18n.t('file_manager_sub_folder_error'),
			'Access-Denied': i18n.t('file_manager_access_denied'),
			// eslint-disable-next-line max-len
			'Access-Details': 'No tiene permiso para acceder a esta carpeta.',
			'Header-Retry': 'El archivo ya existe',
			// eslint-disable-next-line max-len
			'Content-Retry': 'Ya existe un archivo con este nombre en esta carpeta. ¿Qué quieres hacer?',
			'Button-Keep-Both': 'Mantén ambos',
			'Button-Replace': 'Reemplazar',
			'Button-Skip': 'Omitir',
			'ApplyAll-Label': 'Haga esto para todos los artículos actuales'
		}
	}
});

function App() {
	return (
		<AppRoute />
	);
}

export default App;
