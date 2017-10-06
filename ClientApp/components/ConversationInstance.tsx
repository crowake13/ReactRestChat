import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as ConversationInstanceState from '../store/ConversationInstance';
import * as MessagesState from '../store/Messages';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

type IConversationInstanceProps = ConversationInstanceState.IConversationInstanceState
    & MessagesState.IMessagesState
    & typeof ConversationInstanceState.actionCreators
    & typeof MessagesState.actionCreators
    & RouteComponentProps<{ conversationId?: string }>;

class ConversationInstance extends React.Component<IConversationInstanceProps, {}> {
    componentWillMount() {
        if (this.props.match.params.conversationId) this.props.requestConversationById(this.props.match.params.conversationId);
    }

    componentWillReceiveProps(nextProps: IConversationInstanceProps) {
        // This method runs when incoming props (e.g., route params) change
        if (nextProps.match.params.conversationId) {
            this.props.requestConversationById(nextProps.match.params.conversationId);
            this.props.requestMessages();
        }
    }

    public render() {
        return <div style={{ height: "100%", position: "relative" }}>
            <MessageList />
            <div style={{position: "absolute", right: 0, left: 0, padding: "10px 0", margin: "0 10px", top: 0, zIndex: 1, backgroundColor: "white"}}>
                <MessageInput />
                <button type="button" className="btn btn-default full-width" style={{marginTop: "10px"}} onClick={ this.props.requestNewMessages }>
                    <span className="glyphicon glyphicon-refresh"></span>
                </button>
            </div>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.conversationInstance,
    {
        ...ConversationInstanceState.actionCreators,
        ...MessagesState.actionCreators
    }
)(ConversationInstance) as typeof ConversationInstance;
