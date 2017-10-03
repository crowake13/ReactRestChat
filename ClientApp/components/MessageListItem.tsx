import * as React from 'react';
import { IMessageQueryModel } from '../store/Messages';

type IMessageListItemProps = { message: IMessageQueryModel, onDelete: React.EventHandler<React.MouseEvent<HTMLElement>> };

class MessageListItem extends React.Component<IMessageListItemProps, { }> {
    public render() {
        return <span className="list-group-item" onClick={this.props.onDelete}>
            { '@' + this.props.message.content }
        </span>;
    }
}

export default MessageListItem;
