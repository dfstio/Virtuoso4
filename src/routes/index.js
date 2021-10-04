import React from "react";
import {Route, Switch} from "react-router-dom";

import asyncComponent from "util/asyncComponent";

const App = ({match}) => (
  <div className="gx-main-content-wrapper">
    <Switch>
      <Route path={`${match.url}marketplace`} component={asyncComponent(() => import('./algolia'))}/>
      <Route path={`${match.url}sample`} component={asyncComponent(() => import('./SamplePage'))}/>
       <Route path={`${match.url}settings`} component={asyncComponent(() => import('./Settings'))}/>
    </Switch>
  </div>
);

export default App;
