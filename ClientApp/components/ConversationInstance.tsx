import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as ConversationInstanceState from '../store/ConversationInstance';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

type IConversationInstanceProps = ConversationInstanceState.IConversationInstanceState
    & typeof ConversationInstanceState.actionCreators
    & RouteComponentProps<{ id?: string }>;

class ConversationInstance extends React.Component<IConversationInstanceProps, {}> {
    componentWillReceiveProps(nextProps: IConversationInstanceProps) {
        // This method runs when incoming props (e.g., route params) change
        if (nextProps.match.params.id) this.props.requestConversationById(nextProps.match.params.id);
    }

    public render() {
        return <div style={{ height: "100%", position: "relative" }}>
            <MessageInput />
            <MessageList />
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.conversationInstance,
    ConversationInstanceState.actionCreators
)(ConversationInstance) as typeof ConversationInstance;
