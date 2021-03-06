import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { push } from 'react-router-redux';
import { AppThunkAction } from './';
import { SetConversationAction, DeleteConversationByIdReceiveAction } from './ConversationInstance';
import { IMessageQueryModel, ReceiveMessageSavedAction } from './Message';
import { HideModalAction } from './Main';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IMessagesState {
    isDeleteLoading: boolean;
    areNewLoading: boolean;
    isLoading: boolean;
    hasMore: boolean;
    skip?: number;
    deleteId?: string;
    newestMessageDate?: string;
    messages: IMessageQueryModel[]
}

export interface IMessagesResponse {
    messages: IMessageQueryModel[];
    hasMore: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

export interface DeleteMessageByIdRequestAction {
    type: 'DELETE_MESSAGE_BY_ID_REQUEST';
    id: string;
}

export interface DeleteMessageByIdReceiveAction {
    type: 'DELETE_MESSAGE_BY_ID_RECEIVE';
    id: string;
}

export interface DeleteMessageByIdRequestFailedAction {
    type: 'DELETE_MESSAGE_BY_ID_REQUEST_FAILED';
}

interface RequestNewMessagesAction {
    type: 'REQUEST_NEW_MESSAGES';
    newerThenDate: string;
}

interface ReceiveNewMessagesAction {
    type: 'RECEIVE_NEW_MESSAGES';
    newerThenDate: string;
    messages: IMessageQueryModel[];
}

interface RequestMessagesAction {
    type: 'REQUEST_MESSAGES';
    skip: number;
}

interface ReceiveMessagesAction {
    type: 'RECEIVE_MESSAGES';
    hasMore: boolean;
    skip: number;
    messages: IMessageQueryModel[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type DeleteMessageByIdAction = DeleteMessageByIdRequestAction 
| DeleteMessageByIdReceiveAction 
| DeleteMessageByIdRequestFailedAction;

type NewMessagesAction = RequestNewMessagesAction | ReceiveNewMessagesAction;
type MessageAction = RequestMessagesAction | ReceiveMessagesAction;

type KnownAction = DeleteMessageByIdAction 
    | NewMessagesAction 
    | MessageAction 
    | ReceiveMessageSavedAction 
    | SetConversationAction 
    | DeleteConversationByIdReceiveAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    showDeleteMessageModal: (id: string): AppThunkAction<DeleteMessageByIdAction | HideModalAction> => (dispatch, getState) => {
        getState().messages.deleteId = id;
    },
    deleteMessage: (): AppThunkAction<DeleteMessageByIdAction | HideModalAction> => (dispatch, getState) => {
        let id = getState().messages.deleteId;
        if (!id) return;
        let fetchTask = fetch(`api/Message/${ id }`, { credentials: "same-origin",
                method: "DELETE"
            })
            .then(response => response.json() as Promise<boolean>)
            .then(data => {
                dispatch({ type: 'HIDE_MODAL', id: "delete-message-modal"});
                if (data) {
                    dispatch(push('/') as any);
                    dispatch({ type: 'DELETE_MESSAGE_BY_ID_RECEIVE', id: id as string });
                    return;
                }

                dispatch({ type: 'DELETE_MESSAGE_BY_ID_REQUEST_FAILED' });
            })
            .catch(reason => {
                dispatch({ type: 'DELETE_MESSAGE_BY_ID_REQUEST_FAILED' });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'DELETE_MESSAGE_BY_ID_REQUEST', id: id });
    },
    requestNewMessages: (): AppThunkAction<NewMessagesAction> => (dispatch, getState) => {
        let messagesState = getState().messages;

        if (!messagesState.messages.length) {
            actionCreators.requestMessages();
            return;
        }

        let conversationId = getState().conversationInstance.id;

        if (!conversationId || messagesState.isLoading) return;

        let newestMessageDate = messagesState.messages[0].created.slice(0, 26);
        let fetchTask = fetch(`api/Conversation/${conversationId}/NewMessages?newerThenDate=` + newestMessageDate, { credentials: "include" })
            .then(response => response.json() as Promise<IMessageQueryModel[]>)
            .then(data => {
                console.info
                dispatch({ type: 'RECEIVE_NEW_MESSAGES', newerThenDate: newestMessageDate, messages: data });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_NEW_MESSAGES', newerThenDate: newestMessageDate });
    },
    requestMessages: (): AppThunkAction<MessageAction> => (dispatch, getState) => {
        let conversationId = getState().conversationInstance.id;
        let messagesState = getState().messages;

        if (!conversationId  || messagesState.isLoading) return;

        let skip = messagesState.messages.length;
        let fetchTask = fetch(`api/Conversation/${conversationId}/Messages?skip=${ skip }`, { credentials: "include" })
            .then(response => response.json() as Promise<IMessagesResponse>)
            .then(data => {
                dispatch({ type: 'RECEIVE_MESSAGES', skip: skip, messages: data.messages, hasMore: data.hasMore });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_MESSAGES', skip: skip });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IMessagesState = { 
    isDeleteLoading: false,
    areNewLoading: false,
    isLoading: false, 
    hasMore: true, 
    messages: []
};

export const reducer: Reducer<IMessagesState> = (state: IMessagesState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'DELETE_MESSAGE_BY_ID_REQUEST':
            return {
                ...state,
                isDeleteLoading: true,
                deleteId: action.id
            };
        case 'DELETE_MESSAGE_BY_ID_REQUEST_FAILED':
            return {
                ...state, 
                isDeleteLoading: false,
                deleteId: undefined
            };
        case 'DELETE_MESSAGE_BY_ID_RECEIVE':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.id === state.deleteId) {
                let index = state.messages.map(c => c.id).indexOf(action.id);
                if (index == -1) break;
                state.messages.splice(index, 1);
                return {
                    ...state,
                    messages: [
                        ...state.messages
                    ]
                };
            }
            break;
        case 'REQUEST_NEW_MESSAGES':
            return {
                ...state, 
                areNewLoading: true,
                newestMessageDate: action.newerThenDate
            };
        case 'RECEIVE_NEW_MESSAGES':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (!action.messages.length) return {
                ...state, 
                areNewLoading: false,
                newestMessageDate: undefined
            };
            if (action.newerThenDate === state.newestMessageDate) {
                return {
                    ...state,
                    areNewLoading: false,
                    newestMessageDate: action.messages[0].created,
                    messages: action.messages.concat(state.messages)
                };
            }
            break;
        case 'REQUEST_MESSAGES':
            return {
                ...state, 
                isLoading: true,
                skip: action.skip
            };
        case 'RECEIVE_MESSAGES':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.skip === state.skip) {
                return {
                    ...state,
                    isLoading: false,
                    hasMore: action.hasMore,
                    skip: undefined,
                    messages: state.messages.concat(action.messages)
                };
            }
            break;
        case 'MESSAGE_POSTED':
            return {
                ...state, 
                messages: [
                    action.message,
                    ...state.messages
                ]
            };
        case 'DELETE_CONVERSATION_BY_ID_RECEIVE':
        case 'SET_CONVERSATION':
            return {
                ...unloadedState
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
