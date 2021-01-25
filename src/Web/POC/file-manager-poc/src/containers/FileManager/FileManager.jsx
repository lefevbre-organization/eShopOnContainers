import React, { useState, useEffect } from 'react';
import { 
	FileManagerComponent, 
	Inject, 
	NavigationPane, 
	DetailsView, 
	Toolbar 
} from '@syncfusion/ej2-react-filemanager';
import { Row, Col } from 'reactstrap';

import './fileManager.scss';

const FileManager = () => {
	const [navigatorLanguage, setLanguage] = useState('');
	const hostUrl = 'https://ej2-aspcore-service.azurewebsites.net/';

	useEffect(() => {
		const languageSpit = (navigator.language).split('-');
		setLanguage(languageSpit[0]);
		console.log(navigatorLanguage)
	}, [])

	// File Manager Drag start event
	const onFileDragStart = (args) => {
		console.log('File Drag Start', args);
	}
	// File Manager Drag start event
	const onFileDragStop = (args) => {
		console.log('File Drag Stop', args);
	}
	// File Manager Drag start event
	const onFileDragging = (args) => {
		console.log('File Dragging', args);
	}
	// File Manager Drag start event
	const onFileDropped = (args) => {
		console.log('File Dropped', args);
	}
	
	return (
		<Row className="main-file-manager">
			<Col>
				<FileManagerComponent 
					id="overview_file" 
					locale={navigatorLanguage}
					view={'Details'} 
					allowDragAndDrop={true} 
					ajaxSettings={{
						url: hostUrl + 'api/FileManager/FileOperations',
						getImageUrl: hostUrl + 'api/FileManager/GetImage',
						uploadUrl: hostUrl + 'api/FileManager/Upload',
						downloadUrl: hostUrl + 'api/FileManager/Download'
					}} 
					fileDragStart={onFileDragStart} 
					fileDragStop={onFileDragStop} 
					fileDragging={onFileDragging} 
					fileDropped={onFileDropped} >
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