import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as MessagesState from '../store/Messages';
import MessageListItem from './MessageListItem';
import InfiniteScroll from 'redux-infinite-scroll';

type IMessageListProps = MessagesState.IMessagesState
    & typeof MessagesState.actionCreators;

class MessageList extends React.Component<IMessageListProps, { timer: number }> {
    componentDidMount() {
        let timer = setInterval(this.props.requestNewMessages, 10000);
        this.setState({timer});
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    public render() {
        return <InfiniteScroll className="list-group message-list"
            children={ this.props.messages.map((message, index) => 
                <MessageListItem key={ index } message={ message } onDelete={ this.props.showDeleteMessageModal.bind(this, message.id) } />
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
