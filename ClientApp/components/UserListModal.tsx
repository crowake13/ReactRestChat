import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as UsersState from '../store/Users';
import * as UserListState from '../store/UserList';
import * as ConversationInstanceState from '../store/ConversationInstance';
import Meme, { IMemeProps } from './Meme';
import Modal from './Modal';
import UserList from './UserList';
import UserSearchInput from './UserSearchInput';

type IUserListModalProps = UsersState.IUsersState
    & UserListState.IUserListState
    & typeof UsersState.actionCreators
    & typeof UserListState.actionCreators
    & typeof ConversationInstanceState.actionCreators;

class UserListModal extends React.Component<IUserListModalProps, { }> {
    renderBody() {
        if (!this.props.users.length) {
            if (!this.props.hasMore && !this.props.search && !this.props.isLoading) {
                let memeProps: IMemeProps = {
                    imageSrc: "/images/ForeverAlone.jpg",
                    topText: "Congratulations!",
                    bottomText: "You are the only user."
                };

                return <Meme { ...memeProps } />;
            }

            return;
        }
        
        return <UserList />;
    }

    renderFooter() {
        if (!this.props.users.length && !this.props.hasMore) return;
        return <div>
            <button type="button" className="btn btn-default float-left" disabled={ !this.props.selectedUsers.length }
                onClick={ this.props.unselectUsers }>Unselect all</button>
            <button type="button" className="btn btn-primary" disabled={ !this.props.selectedUsers.length }
                onClick={ this.props.requestConversationByParticipantIds }>Create</button>
        </div>;
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            
            this.props.searchUsers((e.target as HTMLTextAreaElement).value);
            this.props.requestUsers();
        }
    }

    onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        this.props.searchUsers((this.refs.search as HTMLTextAreaElement).value);
        this.props.requestUsers();
    }
    
    public render() {
        return <Modal id="user-list-modal" title="Select user(s) to create a new conversation" minBodyHeight="300px">
            <div key="body" style={{height: "100%"}}>
                <UserSearchInput />
                { this.renderBody() }
            </div>
            <div key="footer">{ this.renderFooter() }</div>
        </Modal>;
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
        ...UserListState.actionCreators,
        ...ConversationInstanceState.actionCreators
    }
)(UserListModal);
