import React from 'react';
import loadable from '@loadable/component'; // 코드스플리팅
import {Switch, Route, Redirect} from 'react-router-dom';

const LogIn = loadable(() => import('@pages/LogIn'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Channel = loadable(()=> import('@pages/Channel'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/login" />
            <Route path="/login" component={LogIn} />
            <Route path="/signUp" component={SignUp} />
            <Route path="/workspace/channel" component={Channel} />
        </Switch>
    )
}
 
export default App
