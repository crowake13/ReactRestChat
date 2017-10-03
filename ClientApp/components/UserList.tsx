import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as UsersState from '../store/Users';
import * as ConversationInstanceState from '../store/ConversationInstance';
import UserListItem from './UserListItem';
import InfiniteScroll from 'redux-infinite-scroll';

type IUserProps = UsersState.IUsersState
    & typeof UsersState.actionCreators
    & typeof ConversationInstanceState.actionCreators;

class UserList extends React.Component<IUserProps, { }> {
    selectUser = (participantIds: string[]) => {
        this.props.requestConversationByParticipantIds(participantIds);
    };

    public render() {
        return <InfiniteScroll 
            className="list-group"
            children={ this.props.users.map((user, index) => 
                <UserListItem key={ index } user={ user } 
                    onClick={ this.selectUser.bind(this, [user.id]) } />
            ) }
            loadMore={ this.props.requestUsers }
            hasMore={ this.props.hasMore }
            loader={ <div className="loader">Loading ...</div> } />;
    }
}

export default connect(
    (state: ApplicationState) => state.users,
    {
        ...UsersState.actionCreators, 
        ...ConversationInstanceState.actionCreators
    }
)(UserList);
