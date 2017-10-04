import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { IConversationCommandModel, SelectConversationAction } from './Conversations';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IMessageState {
    isLoading: boolean;
    active: boolean;
    id?: string;
    content: string;
}

export interface IMessageCommandModel {
    id?: string;
    conversation: IConversationCommandModel;
    content: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface UpdateMessageContentAction {
    type: 'UPDATE_MESSAGE_CONTENT';
    content: string;
}

interface SendMessageAction {
    type: 'POST_MESSAGE';
    message: IMessageCommandModel;
}

interface ReceiveMessageSavedAction {
    type: 'MESSAGE_POSTED';
    success: ResponseInit;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type PostActions = SendMessageAction 
    | ReceiveMessageSavedAction;

type KnownAction = UpdateMessageContentAction 
    | PostActions
    | SelectConversationAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    updateContent: (content: string): AppThunkAction<UpdateMessageContentAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_MESSAGE_CONTENT', content: content });
    },
    sendMessage: (): AppThunkAction<PostActions> => (dispatch, getState) => {
        let messageState = getState().message;
        let conversationInstanceState = getState().conversationInstance;

        let newMessage: IMessageCommandModel = {
            id: messageState.id,
            conversation: {
                id: conversationInstanceState.id,
                title: conversationInstanceState.title,
                participantIds: conversationInstanceState.participants.map(p => p.user.id)
            },
            content: messageState.content
        };

        let fetchTask = fetch(`api/Message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newMessage)
            })
            .then(response => response.json() as Promise<ResponseInit>)
            .then(data => {
                dispatch({ type: 'MESSAGE_POSTED', success: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'POST_MESSAGE', message: newMessage });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IMessageState = { isLoading: false, active: false, content: "" };

export const reducer: Reducer<IMessageState> = (state: IMessageState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'UPDATE_MESSAGE_CONTENT':
            return {
                ...state, 
                content: action.content
            };
        case 'POST_MESSAGE':
            return {
                ...state, 
                isLoading: true
            };
        case 'MESSAGE_POSTED':
            return {
                ...unloadedState,
                active: state.active
            };
        case 'SELECT_CONVERSATION':
            return {
                ...state, 
                active: true
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
