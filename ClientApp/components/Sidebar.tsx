import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ConversationList from './ConversationList';

type ISdebarProps = RouteComponentProps<{ }>;

class Sidebar extends React.Component<ISdebarProps, { }> {
    public render() {
        return <div>
            <ConversationList />
        </div>;
    }
}

export default Sidebar as typeof Sidebar;
