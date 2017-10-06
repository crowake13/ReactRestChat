import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as ConversationInstanceState from '../store/ConversationInstance';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

type IConversationInstanceProps = ConversationInstanceState.IConversationInstanceState
    & typeof ConversationInstanceState.actionCreators
    & RouteComponentProps<{ conversationId?: string }>;

class ConversationInstance extends React.Component<IConversationInstanceProps, {}> {
    componentWillMount() {
        if (this.props.match.params.conversationId) this.props.requestConversationById(this.props.match.params.conversationId);
    }

    componentWillReceiveProps(nextProps: IConversationInstanceProps) {
        // This method runs when incoming props (e.g., route params) change
        if (nextProps.match.params.conversationId) this.props.requestConversationById(nextProps.match.params.conversationId);
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
