import * as React from 'react';
import { Link } from 'react-router-dom';
import * as ConversationsState from '../store/Conversations';

type IConversationProps = { 
    conversation: ConversationsState.IConversationViewModel
};

class ConversationListItem extends React.Component<IConversationProps, { }> {
    public render() {
        return <Link to={'/' + this.props.conversation.id} style={{height: "200px"}} className={ "list-group-item" + (this.props.conversation.isActive ? " active" : "") }>
            <h4 className="list-group-item-heading">{ this.props.conversation.title || "" }</h4>
            <p className="list-group-item-text">{ this.props.conversation.participants.map(participant => 
                " " + participant.user.username).filter((x, i, a) => a.indexOf(x) == i).slice(0,3).join() }</p>
        </Link>;
    }
}

export default ConversationListItem;
