import * as React from 'react';
import * as UsersState from '../store/Users';

type IUserProps = { 
    user: UsersState.IUserQueryModel;
    active: boolean;
    onClick?: React.EventHandler<React.MouseEvent<HTMLElement>>;
    onDoubleClick?: React.EventHandler<React.MouseEvent<HTMLElement>>;
};

class UserListItem extends React.Component<IUserProps, { }> {
    public render() {
        return <span className="list-group-item" onClick={this.props.onClick} onDoubleClick={this.props.onDoubleClick}>
            <h4 className="list-group-item-heading">
                { '@' + this.props.user.username }
                { this.props.active ? <span className="glyphicon glyphicon-ok float-right"></span> : "" }
            </h4>
        </span>;
    }
}

export default UserListItem;
