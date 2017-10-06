import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as UsersState from '../store/Users';
import ConversationList from './ConversationList';

type ISidebarProps = UsersState.IUsersState & typeof UsersState.actionCreators & RouteComponentProps<{ }>;

class Sidebar extends React.Component<ISidebarProps, { }> {
    public render() {
        return <div style={{height: "100%"}}>
            <ConversationList />
            <div style={{position: "absolute", right: 0, padding: "10px", bottom: 0}}>
                <button type="button" className="btn btn-success" onClick={ this.props.requestUsers }
                    data-target="#user-list-modal" 
                    data-toggle="modal" 
                    data-backdrop="static" 
                    data-keyboard="false">
                    <span className="glyphicon glyphicon-plus"></span>
                </button>
            </div>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.users,
    UsersState.actionCreators
)(Sidebar) as typeof Sidebar;
