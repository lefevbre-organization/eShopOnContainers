import React from 'react';
import { Route, Switch} from 'react-router-dom';

import Layout from './containers/Layout/Layout';
import FileManager from './containers/FileManager/FileManager';


const AppRoute = () => {
	return ( 
		<Switch>
			<Route 
				path="/" 
				exact 
				render={props => 
					(
						<Layout {...props}>
							<FileManager />
						</Layout>
					)} 
			/>
		</Switch>
	);
};

export default AppRoute;