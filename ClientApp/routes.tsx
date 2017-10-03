import * as React from 'react';
import { Switch, NavLink, Link, Route } from 'react-router-dom';
import UserList from './components/UserList';
import Sidebar from './components/Sidebar';
import ConversationInstance from './components/ConversationInstance';

// Each logical "route" has two components, one for
// the sidebar and one for the main area. We want to
// render both of them in different places when the
// path matches the current URL.
const routeList = [
    {
        path: '/:id?',
        exact: false,
        sidebar: Sidebar,
        main: ConversationInstance
    }
];

export const routes = <div className='row border-between'>
    <div className='col-sm-3'><Switch>
    {routeList.map((route, index) => (
        // You can render a <Route> in as many places
        // as you want in your app. It will render along
        // with any other <Route>s that also match the URL.
        // So, a sidebar or breadcrumbs or anything else
        // that requires you to render multiple things
        // in multiple places at the same URL is nothing
        // more than multiple <Route>s.
        <Route
        key={index}
        path={route.path}
        exact={route.exact}
        component={route.sidebar}
        />
    ))}
    </Switch></div>
    <div className='col-sm-9'><Switch>
    {routeList.map((route, index) => (
        // Render more <Route>s with the same paths as
        // above, but different components this time.
        <Route
        key={index}
        path={route.path}
        exact={route.exact}
        component={route.main}
        />
    ))}
    </Switch></div>
</div>;
