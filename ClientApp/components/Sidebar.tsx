import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ConversationList from './ConversationList';

type ISdebarProps = RouteComponentProps<{ }>;

class Sidebar extends React.Component<ISdebarProps, { }> {
    public render() {
        return <div style={{height: "100%"}}>
            <ConversationList />
            <div style={{position: "absolute", right: 0, padding: "10px", bottom: 0}}>
                <button type="button" className="btn btn-success" data-toggle="modal" data-target="#usersModal">
                    <span className="glyphicon glyphicon-plus"></span>
                </button>
            </div>
        </div>;
    }
}

export default Sidebar as typeof Sidebar;
