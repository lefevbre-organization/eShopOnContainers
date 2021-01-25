import React from 'react';
import { 
	FileManagerComponent, 
	Inject, 
	NavigationPane, 
	DetailsView, 
	Toolbar 
} from '@syncfusion/ej2-react-filemanager';
import { Row, Col } from 'reactstrap';

import './FileManager.scss';

const FileManager = () => {
	const hostUrl = 'https://ej2-aspcore-service.azurewebsites.net/';
	return (
		<Row className="main-file-manager">
			<Col>
				<FileManagerComponent 
					id="overview_file" 
					ajaxSettings={{
						url: hostUrl + 'api/FileManager/FileOperations',
						getImageUrl: hostUrl + 'api/FileManager/GetImage',
						uploadUrl: hostUrl + 'api/FileManager/Upload',
						downloadUrl: hostUrl + 'api/FileManager/Download'
					}} 
					view={'Details'} >
					<Inject services={[
						NavigationPane, 
						DetailsView, 
						Toolbar]}
					/>
				</FileManagerComponent>
			</Col>
		</Row>
	)
}

export default FileManager;