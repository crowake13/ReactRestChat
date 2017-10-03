import * as Users from './Users';
import * as Message from './Message';
import * as Messages from './Messages';
import * as Conversations from './Conversations';
import * as ConversationInstance from './ConversationInstance';

// The top-level state object
export interface ApplicationState {
    users: Users.IUsersState,
    message: Message.IMessageState,
    messages: Messages.IMessagesState,
    conversations: Conversations.IConversationsState,    
    conversationInstance: ConversationInstance.IConversationInstanceState
}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    users: Users.reducer,
    message: Message.reducer,
    messages: Messages.reducer,
    conversations: Conversations.reducer,
    conversationInstance: ConversationInstance.reducer
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
