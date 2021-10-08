import React from "react";
import {Route, Switch} from "react-router-dom";

import asyncComponent from "util/asyncComponent";

const App = ({match}) => (
  <div className="gx-main-content-wrapper">
    <Switch>
      <Route path={`${match.url}marketplace`} component={asyncComponent(() => import('./algolia'))}/>
      <Route path={`${match.url}mint`} component={asyncComponent(() => import('./Mint'))}/>
       <Route path={`${match.url}settings`} component={asyncComponent(() => import('./Settings'))}/>
       <Route path={`${match.url}token/:chainId/:contract/:tokenId`} component={asyncComponent(() => import('./token'))}/>
    </Switch>
  </div>
);

export default App;
