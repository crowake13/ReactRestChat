import * as React from 'react';
import { IMessageQueryModel } from '../store/Message';

type IMessageListItemProps = { message: IMessageQueryModel, onDelete?: React.EventHandler<React.MouseEvent<HTMLElement>> };

class MessageListItem extends React.Component<IMessageListItemProps, { }> {
    public render() {
        return <span className="list-group-item" style={{height: "200px"}} onClick={this.props.onDelete}>
            <h4 className="list-group-item-heading">{ this.props.message.sender.username || "" }</h4>
            <p className="list-group-item-text">{ this.props.message.content }</p>
        </span>;
    }
}

export default MessageListItem;
