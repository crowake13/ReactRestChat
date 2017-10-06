import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as MessageState from '../store/Message';

type IMessageInputProps = MessageState.IMessageState
    & typeof MessageState.actionCreators;

class MessageInput extends React.Component<IMessageInputProps, { }> {
    onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.props.updateContent(e.target.value);
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            
            this.props.sendMessage();
            (this.refs.content as HTMLTextAreaElement).value = "";
        }
    }

    onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        this.props.sendMessage();
        (this.refs.content as HTMLTextAreaElement).value = "";
    }
    
    public render() {
        return <div className="input-group">
            <textarea ref="content"
                className="form-control"
                width={ "100%" }
                disabled={ !this.props.active || this.props.isLoading }
                onKeyDown={ this.onKeyDown }
                onChange={ this.onChange } />
            <a className="input-group-addon btn btn-primary" 
                disabled={ !this.props.active || this.props.isLoading }
                onClick={ this.onClick }>
                <span className="glyphicon glyphicon-send"></span>
            </a>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.message,
    MessageState.actionCreators
)(MessageInput);
