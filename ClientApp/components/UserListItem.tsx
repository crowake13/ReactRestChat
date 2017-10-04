import * as React from 'react';
import * as UsersState from '../store/Users';

type IUserProps = { user: UsersState.IUserQueryModel, onDoubleClick: React.EventHandler<React.MouseEvent<HTMLElement>> };

class UserListItem extends React.Component<IUserProps, { }> {
    public render() {
        return <span className="list-group-item" style={{height: "500px"}} onDoubleClick={this.props.onDoubleClick}>
            <h4 className="list-group-item-heading">
                { '@' + this.props.user.username }
            </h4>
        </span>;
    }
}

export default UserListItem;
