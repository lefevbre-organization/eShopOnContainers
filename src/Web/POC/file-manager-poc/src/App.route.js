import React from 'react';
import { Route, Switch} from 'react-router-dom';

import FileManager from './containers/FileManager/FileManager';

const AppRoute = () => {
  return ( 
    <Switch>
      <Route 
        path="/" 
        exact 
        component={FileManager} 
      />
    </Switch>
  );
};

export default AppRoute;