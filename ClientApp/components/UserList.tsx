import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as UsersState from '../store/Users';
import * as UserListState from '../store/UserList';
import UserListItem from './UserListItem';
import InfiniteScroll from 'redux-infinite-scroll';

type IUserListProps = UsersState.IUsersState
    & UserListState.IUserListState
    & typeof UsersState.actionCreators
    & typeof UserListState.actionCreators;

class UserList extends React.Component<IUserListProps, { }> {
    public render() {
        return <InfiniteScroll className="list-group user-list"
            children={ this.props.users.map((user, index) => {
                let active = this.props.selectedUsers.map(su => su.id).indexOf(user.id) !== -1;
                return <UserListItem key={ index } user={ user } active={ active }
                    onClick={ active ? this.props.unselectUser.bind(this, user) : this.props.selectUser.bind(this, user) } />
            }) }
            loadMore={ this.props.requestUsers }
            hasMore={ this.props.hasMore }
            loader={ <div className="loader">Loading ...</div> } />;
    }
}

export default connect(
    (state: ApplicationState) => {
        return {
            ...state.users,
            ...state.userList
        };
    },
    {
        ...UsersState.actionCreators,
        ...UserListState.actionCreators
    }
)(UserList);
