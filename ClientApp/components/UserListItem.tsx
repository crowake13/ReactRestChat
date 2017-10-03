import * as React from 'react';
import * as UsersState from '../store/Users';

type IUserProps = { user: UsersState.IUserQueryModel, onClick: React.EventHandler<React.MouseEvent<HTMLElement>> };

class UserListItem extends React.Component<IUserProps, { }> {
    public render() {
        return <span className="list-group-item" onClick={this.props.onClick}>
            <h4 className="list-group-item-heading">
                { '@' + this.props.user.username }
            </h4>
        </span>;
    }
}

export default UserListItem;
