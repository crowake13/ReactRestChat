import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { RouterAction, push } from 'react-router-redux';
import { AppThunkAction } from './';
import { IUserQueryModel } from './Users';
import { ReceiveConversationByParticipantIdsAction, DeleteConversationByIdReceiveAction } from './ConversationInstance';
import * as UsersState from './Users';
import { ShowModalAction } from './Main';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IConversationsState {
    isLoading: boolean;
    hasMore: boolean;
    skip: number;
    conversations: IConversationViewModel[];
}

export interface IConversationCommandModel {
    id?: string;
    title: string;
    participantIds: string[];
}

export interface IConversationViewModel extends IConversationQueryModel {
    isActive: boolean,
    isNew: boolean;
}

export interface IConversationQueryModel {
    id: string;
    title: string;
    participants: IParticipantQueryModel[];
}

export interface IParticipantQueryModel {
    user: IUserQueryModel;
    lastReadMessageId: string;
    deletedAfterMessageId: string;
}

export interface IConversationListQueryModel {
    conversations: IConversationViewModel[];
    hasMore: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

export interface SelectConversationAction {
    type: 'SELECT_CONVERSATION';
    index: number;
}

interface RequestConversationsAction {
    type: 'REQUEST_CONVERSATIONS';
    skip: number;
}

interface ReceiveConversationsAction {
    type: 'RECEIVE_CONVERSATIONS';
    hasMore: boolean;
    skip: number;
    conversations: IConversationQueryModel[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type ConversationsActions = RequestConversationsAction 
    | ReceiveConversationsAction 
    | SelectConversationAction;

type KnownAction =  ConversationsActions
    | ReceiveConversationByParticipantIdsAction
    | DeleteConversationByIdReceiveAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestConversations: (): AppThunkAction<ConversationsActions | ShowModalAction> => (dispatch, getState) => {
        let conversationsState = getState().conversations;

        if (!conversationsState.isLoading) {
            let skip = conversationsState.conversations.length;

            let fetchTask = fetch(`api/Conversation/Latest?skip=${ skip }`, { credentials: "include" })
                .then(response => response.json() as Promise<IConversationListQueryModel>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_CONVERSATIONS', skip: skip, conversations: data.conversations, hasMore: data.hasMore });
                    let conversations = getState().conversations.conversations;

                    if (!conversations.length) {
                        dispatch(push('/') as any);
                        return;
                    }

                    let conversationId = getState().conversationInstance.id;

                    if (conversationId) {
                        let index = conversations.map(c => c.id).indexOf(conversationId);

                        if (index !== -1) dispatch({ type: 'SELECT_CONVERSATION', index: index });
                    }
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_CONVERSATIONS', skip: skip });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IConversationsState = { 
    isLoading: false, 
    hasMore: true, 
    skip: 0, 
    conversations: []
};

export const reducer: Reducer<IConversationsState> = (state: IConversationsState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SELECT_CONVERSATION': 
            if (state.conversations[action.index].isActive) break;
            state.conversations.forEach(c => c.isActive = false);
            state.conversations[action.index].isActive = true;
            return {
                ...state,
                conversations: [
                    ...state.conversations
                ]
            };
        case 'RECEIVE_CONVERSATION_BY_PARTICIPANT_IDS':
            if (state.conversations.map(c => c.id).indexOf(action.conversation.id) === -1) return {
                ...state,
                conversations: [
                    {
                        ...action.conversation,
                        isActive: false
                    } as IConversationViewModel,
                    ...state.conversations
                ]
            };
            break;
        case 'REQUEST_CONVERSATIONS':
            return {
                ...state, 
                isLoading: true,
                skip: action.skip
            };
        case 'RECEIVE_CONVERSATIONS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.skip === state.skip) return {
                ...state, 
                isLoading: false,
                hasMore: action.hasMore,
                skip: action.skip,
                conversations: state.conversations.concat(action.conversations as IConversationViewModel[])
            };
            break;
        case 'DELETE_CONVERSATION_BY_ID_RECEIVE':
            let index = state.conversations.map(c => c.id).indexOf(action.id);
            if (index == -1) break;
            state.conversations.splice(index, 1);
            return {
                ...state,
                conversations: [
                    ...state.conversations
                ]
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
