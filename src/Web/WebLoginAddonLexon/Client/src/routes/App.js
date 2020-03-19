import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from '../containers/Login'
import Home from  '../containers/Home'
import Layout from '../components/Layout'
import "bootstrap/dist/css/bootstrap.min.css"

 const App = () => (
   <BrowserRouter>
    <Route exact path="/login" component={Login}></Route>
    <Layout>
     <Switch>
      <Route exact path="/home" component={Home}></Route>
     </Switch>
    </Layout>
   </BrowserRouter>    
 )

export default App