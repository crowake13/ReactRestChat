import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as MessagesState from '../store/Messages';
import MessageListItem from './MessageListItem';
import InfiniteScroll from 'redux-infinite-scroll';

type IUserProps = MessagesState.IMessagesState
    & typeof MessagesState.actionCreators;

class MessageList extends React.Component<IUserProps, { }> {
    deleteMessage = (messageId: string) => {
        console.info(messageId);
        // this.props.requestConversationByParticipantIds(participantIds);
    };

    public render() {
        return <InfiniteScroll 
            className="list-group"
            children={ this.props.messages.map((message, index) => 
                <MessageListItem key={ index } message={ message } 
                    onDelete={ this.deleteMessage.bind(this, message.id) } />
            ) }
            loadMore={ this.props.requestMessages }
            hasMore={ this.props.hasMore }
            loader={ <div className="loader">Loading ...</div> } />;
    }
}

export default connect(
    (state: ApplicationState) => state.messages,
    MessagesState.actionCreators
)(MessageList);
