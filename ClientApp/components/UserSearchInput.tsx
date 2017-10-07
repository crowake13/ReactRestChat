import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as UsersState from '../store/Users';

type IUserSearchInputProps = UsersState.IUsersState
    & typeof UsersState.actionCreators;

class UserSearchInput extends React.Component<IUserSearchInputProps, { }> {
    refs: {
        search: HTMLInputElement;
    };

    componentDidUpdate() {
        this.refs.search.focus();
    }
    
    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            
            this.props.searchUsers(this.refs.search.value);
            this.props.requestUsers();
        }
    }

    search = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        this.props.searchUsers(this.refs.search.value);
        this.props.requestUsers();
    }

    clearSearch = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        this.refs.search.value = "";
        this.search();
    }
    
    public render() {
        return <div className="input-group" style={{padding: "0 10px"}}>
            <input type="text" ref="search"
                className="form-control"
                width={ "100%" }
                disabled={ this.props.isLoading }
                onKeyDown={ this.onKeyDown } />
            <a className="input-group-addon btn btn-danger" 
                disabled={ this.props.isLoading || !this.refs.search || !this.refs.search.value }
                onClick={ this.clearSearch }>
                <span className="glyphicon glyphicon-remove"></span>
            </a>
            <a className="input-group-addon btn btn-primary" 
                disabled={ this.props.isLoading }
                onClick={ this.search }>
                <span className="glyphicon glyphicon-send"></span>
            </a>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.users,
    UsersState.actionCreators
)(UserSearchInput);
