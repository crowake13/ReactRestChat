import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as ConversationsState from '../store/Conversations';
import ConversationListItem from './ConversationListItem';
import InfiniteScroll from 'redux-infinite-scroll';

type IConversationProps = ConversationsState.IConversationsState
    & typeof ConversationsState.actionCreators;

class ConversationList extends React.Component<IConversationProps, { }> {
    public render() {
        return <InfiniteScroll className="list-group"
            children={ this.props.conversations.map((conversation, index) => 
                <ConversationListItem key={ index } conversation={ conversation } />
            ) }
            loadMore={ this.props.requestConversations }
            hasMore={ this.props.hasMore }
            loader={ <div className="loader">Loading ...</div> } />;
    }
}

export default connect(
    (state: ApplicationState) => state.conversations,
    ConversationsState.actionCreators
)(ConversationList);
