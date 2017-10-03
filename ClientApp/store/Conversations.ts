import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { RouterAction, push } from 'react-router-redux';
import { AppThunkAction } from './';
import { IUserQueryModel } from './Users';
import * as ConversationInstanceState from './ConversationInstance';
import * as $ from "jquery";
import * as Bootstrap from 'bootstrap';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IConversationsState {
    isLoading: boolean;
    hasMore: boolean;
    pageNumber: number;
    conversations: IConversationViewModel[];
}

export interface IConversationCommandModel {
    id?: string;
    title: string;
    participantIds: string[];
}

export interface IConversationViewModel extends IConversationQueryModel {
    active: boolean
}

export interface IConversationQueryModel {
    id: string;
    title: string;
    participants: IParticipantQueryModel[];
}

export interface IParticipantQueryModel extends IUserQueryModel {
    lastReadMessageId: string;
    deletedAfterMessageId: string;
}

export interface IConversationsResponse {
    conversations: IConversationViewModel[];
    hasMore: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface SelectConversationAction {
    type: 'SELECT_CONVERSATION';
    id: string;
}

interface RequestConversationsAction {
    type: 'REQUEST_CONVERSATIONS';
    pageNumber: number;
}

interface ReceiveConversationsAction {
    type: 'RECEIVE_CONVERSATIONS';
    hasMore: boolean;
    pageNumber: number;
    conversations: IConversationQueryModel[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type ConversationsActions = RequestConversationsAction | ReceiveConversationsAction;

type KnownAction = SelectConversationAction 
    | ConversationsActions
    | ConversationInstanceState.ReceiveConversationAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    navigateToConversation: (id: string): AppThunkAction<RouterAction> => (dispatch, getState) => {
        dispatch(push('/conversation/' + id));
    },
    selectConversation: (id: string): AppThunkAction<SelectConversationAction> => (dispatch, getState) => {
        let index = getState().conversations.conversations.map(c => c.id).indexOf(id);

        if (index === -1) ConversationInstanceState.actionCreators.requestConversationById(id);
    
        dispatch({ type: 'SELECT_CONVERSATION', id: id });
    },
    requestConversations: (): AppThunkAction<ConversationsActions> => (dispatch, getState) => {
        let conversationsState = getState().conversations;

        if (!conversationsState.isLoading) {
            let pageNumber = conversationsState.pageNumber + 1;

            let fetchTask = fetch(`api/Conversation/GetPage?pageNumber=${ pageNumber }`)
                .then(response => response.json() as Promise<IConversationsResponse>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_CONVERSATIONS', pageNumber: pageNumber, conversations: data.conversations, hasMore: data.hasMore });
                    if (!getState().conversations.conversations.length) $("#usersModal").modal();
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_CONVERSATIONS', pageNumber: pageNumber });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IConversationsState = { 
    isLoading: false, 
    hasMore: true, 
    pageNumber: 0, 
    conversations: []
};

export const reducer: Reducer<IConversationsState> = (state: IConversationsState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SELECT_CONVERSATION': 
            let index = state.conversations.map(c => c.id).indexOf(action.id);
            if (index === -1) break;
            let conversation: IConversationViewModel = state.conversations.splice(index, 1)[0];
            
            return {
                ...state,
                conversations: [
                    {
                        ...conversation,
                        active: true
                    } as IConversationViewModel,
                    ...state.conversations
                ]
            };
        case 'RECEIVE_CONVERSATION':
            if (state.conversations.map(c => c.id).indexOf(action.conversation.id) === -1) {
                return {
                    ...state,
                    conversations: [
                        {
                            ...action.conversation as IConversationQueryModel,
                            active: false
                        } as IConversationViewModel,
                        ...state.conversations
                    ]
                };
            }
            break;
        case 'REQUEST_CONVERSATIONS':
            return {
                ...state, 
                isLoading: true,
                pageNumber: action.pageNumber
            };
        case 'RECEIVE_CONVERSATIONS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.pageNumber === state.pageNumber) {
                return {
                    isLoading: false,
                    hasMore: action.hasMore,
                    pageNumber: action.pageNumber,
                    conversations: action.conversations as IConversationViewModel[]
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
