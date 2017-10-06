import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { push } from 'react-router-redux';
import { AppThunkAction } from './';
import * as ConversationsState from './Conversations';
import { IUnselectUsersAction } from './UserList';
import { IMessageQueryModel } from './Message';
import * as $ from "jquery";
import * as Bootstrap from 'bootstrap';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IConversationInstanceState {
    isLoading: boolean;
    requestedId?: string;
    id?: string;
    title: string;
    participants: ConversationsState.IParticipantQueryModel[];
}

export interface IConversationInstanceQueryModel {
    conversation: ConversationsState.IConversationQueryModel;
    created: Date;
    isMessageReadVisible: boolean;
    lastReadMessageId: string;
    messages: IMessageQueryModel[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

export interface SetConversationAction {
    type: 'SET_CONVERSATION';
    conversation: ConversationsState.IConversationQueryModel;
}

export interface ConversationByIdRequestAction {
    type: 'CONVERSATION_BY_ID_REQUEST';
    id: string;
}

export interface ConversationByIdReceiveAction {
    type: 'CONVERSATION_BY_ID_RECEIVE';
    conversation: ConversationsState.IConversationQueryModel;
}

export interface ConversationByIdNotFoundAction {
    type: 'CONVERSATION_BY_ID_NOT_FOUND';
}

export interface ConversationByIdRequestFailedAction {
    type: 'CONVERSATION_BY_ID_REQUEST_FAILED';
}

interface RequestConversationByParticipantIdsAction {
    type: 'REQUEST_CONVERSATION_BY_PARTICIPANT_IDS';
    participantIds: string[];
}

export interface ReceiveConversationByParticipantIdsAction {
    type: 'RECEIVE_CONVERSATION_BY_PARTICIPANT_IDS';
    conversation: ConversationsState.IConversationQueryModel;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type ConversationByIdAction = SetConversationAction
    | ConversationByIdRequestAction 
    | ConversationByIdRequestFailedAction
    | ConversationByIdReceiveAction
    | ConversationByIdNotFoundAction;

type ConversationByParticipantIdsAction = RequestConversationByParticipantIdsAction
    | ReceiveConversationByParticipantIdsAction;

type KnownAction = ConversationByIdAction | ConversationByParticipantIdsAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestConversationById: (id: string): AppThunkAction<ConversationByIdAction | ConversationsState.SelectConversationAction | IUnselectUsersAction> => (dispatch, getState) => {
        if (id !== getState().conversationInstance.id) {
            let conversations = getState().conversations.conversations;

            if (conversations.length) {
                let index = conversations.map(c => c.id).indexOf(id);

                if (index !== -1) {
                    dispatch({ type: 'SET_CONVERSATION', conversation: conversations[index] });
                    dispatch({ type: 'SELECT_CONVERSATION', index: index });
                    $(".conversation-list").animate({ scrollTop: (0) });
                    $('#user-list-modal').modal('hide');
                    dispatch({ type: 'UNSELECT_USERS' });
                    return;
                }
            }
            
            let fetchTask = fetch(`api/Conversation/${ id }`, { credentials: "same-origin" })
                .then(response => response.json() as Promise<ConversationsState.IConversationQueryModel | null>)
                .then(data => {
                    if (data) {
                        dispatch({ type: 'CONVERSATION_BY_ID_RECEIVE', conversation: data });
                        dispatch(push('/' + getState().conversationInstance.id) as any);
                        return;
                    }

                    dispatch({ type: 'CONVERSATION_BY_ID_NOT_FOUND' });
                    dispatch(push('/') as any);
                })
                .catch(reason => {
                    dispatch({ type: 'CONVERSATION_BY_ID_REQUEST_FAILED' });
                    dispatch(push('/') as any);
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'CONVERSATION_BY_ID_REQUEST', id: id });
        }
    },
    requestConversationByParticipantIds: (): AppThunkAction<ConversationByParticipantIdsAction | ConversationsState.SelectConversationAction | IUnselectUsersAction> => (dispatch, getState) => {
        let participantIds = getState().userList.selectedUsers.map(su => su.id);
        let conversations = getState().conversations.conversations.filter(c => {
            let pIds1 = c.participants.map(p => p.user.id).sort();
            let pIds2 = participantIds.sort();

            if (pIds1.length != pIds2.length) return false;

            for (let i = 0; i < pIds2.length; i++) {
                if (pIds1[i] !== pIds2[i]) return false;
            }

            return true;
        });
        
        if (conversations.length) {
            let index = getState().conversations.conversations.map(c => c.id).indexOf(conversations[0].id);

            if (index !== -1) {
                dispatch({ type: 'SELECT_CONVERSATION', index: index });
                $(".conversation-list").animate({ scrollTop: (0) });
                $('#user-list-modal').modal('hide');
                dispatch({ type: 'UNSELECT_USERS' });
                return;
            }
        }

        let fetchTask = fetch(`api/Conversation/ParticipantIds`, { credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participantIds)
            })
            .then(response => response.json() as Promise<ConversationsState.IConversationQueryModel>)
            .then(data => {
                dispatch({ type: 'RECEIVE_CONVERSATION_BY_PARTICIPANT_IDS', conversation: data });
                dispatch({ type: 'UNSELECT_USERS' });
                dispatch(push('/' + data.id) as any);
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_CONVERSATION_BY_PARTICIPANT_IDS', participantIds: participantIds });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IConversationInstanceState = { 
    isLoading: false, 
    title: "", 
    participants: []
};

export const reducer: Reducer<IConversationInstanceState> = (state: IConversationInstanceState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'CONVERSATION_BY_ID_REQUEST':
            return {
                ...state,
                isLoading: true,
                requestedId: action.id
            };
        case 'SET_CONVERSATION':
            return {
                ...action.conversation,
                isLoading: false
            };
        case 'CONVERSATION_BY_ID_REQUEST_FAILED':
            return {
                ...state,
                isLoading: false,
                requestedId: undefined
            };
        case 'CONVERSATION_BY_ID_RECEIVE':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.conversation.id === state.requestedId) {
                return {
                    ...action.conversation,
                    isLoading: false,
                    requestedId: undefined
                };
            }
            break;
        case 'CONVERSATION_BY_ID_NOT_FOUND':
            return {
                ...state,
                isLoading: false,
                requestedId: undefined
            };
        case 'REQUEST_CONVERSATION_BY_PARTICIPANT_IDS':
            return {
                ...state,
                isLoading: true
            };
        case 'RECEIVE_CONVERSATION_BY_PARTICIPANT_IDS':
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
