import * as React from 'react';
import { Link } from 'react-router-dom';
import * as ConversationsState from '../store/Conversations';

type IConversationProps = { 
    conversation: ConversationsState.IConversationQueryModel
};

class ConversationListItem extends React.Component<IConversationProps, { }> {
    public render() {
        return <Link to={'/conversation/' + this.props.conversation.id} className="list-group-item">
            <h4 className="list-group-item-heading">{ this.props.conversation.title || "" }</h4>
            <p className="list-group-item-text">{ this.props.conversation.participants.map(participant => 
                '@' + participant.username).slice(0,3).join() }</p>
        </Link>;
    }
}

export default ConversationListItem;
