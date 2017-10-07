import * as React from 'react';
import { IMessageQueryModel } from '../store/Message';

type IMessageListItemProps = { message: IMessageQueryModel, onDelete: React.EventHandler<React.MouseEvent<HTMLElement>> };

class MessageListItem extends React.Component<IMessageListItemProps, { }> {
    public render() {
        return <span className="list-group-item">
            <button type="button" className="btn btn-default float-right" onClick={this.props.onDelete}
                data-target="#delete-message-modal" 
                data-toggle="modal" 
                data-backdrop="static" 
                data-keyboard="false">
                <span className="glyphicon glyphicon-trash"></span>
            </button>
            <h4 className="list-group-item-heading">{ (this.props.message.sender.username + " " + new Date(this.props.message.created).toLocaleString()) || "" }</h4>
            <p className="list-group-item-text">{ this.props.message.content }</p>
        </span>;
    }
}

export default MessageListItem;
