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
        path: '/:conversationId?',
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
    <div id="usersModal" className="modal fade" tabIndex={ -1 } role="dialog" data-backdrop="false">
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title">Modal title</h4>
                </div>
                <div className="modal-body" style={{height: "300px"}}>
                    <UserList />
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
</div>;
