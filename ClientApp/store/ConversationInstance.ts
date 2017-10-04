import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { push } from 'react-router-redux';
import { AppThunkAction } from './';
import * as ConversationsState from './Conversations';
import { IMessageQueryModel } from './Messages';
import * as $ from "jquery";
import * as Bootstrap from 'bootstrap';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IConversationInstanceState {
    isLoading: boolean;
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

export interface RequestConversationByIdAction {
    type: 'REQUEST_CONVERSATION_BY_ID';
    id: string;
}

interface RequestConversationByParticipantIdsAction {
    type: 'REQUEST_CONVERSATION_BY_PARTICIPANTS';
    participantIds: string[];
}

export interface ReceiveConversationAction {
    type: 'RECEIVE_CONVERSATION';
    conversation: ConversationsState.IConversationQueryModel;
}

export interface DidntReceiveConversationAction {
    type: 'DIDNT_RECEIVE_CONVERSATION';
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestConversationByIdAction 
    | RequestConversationByParticipantIdsAction 
    | ReceiveConversationAction
    | DidntReceiveConversationAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestConversationById: (id: string): AppThunkAction<KnownAction | ConversationsState.SelectConversationAction> => (dispatch, getState) => {
        console.info(id,  getState());
        if (id !== getState().conversationInstance.id) {
            let conversations = getState().conversations.conversations;

            if (conversations.length) {
                let index = conversations.map(c => c.id).indexOf(id);

                if (index !== -1) {
                    dispatch({ type: 'SELECT_CONVERSATION', index: index });
                    $(".conversation-list").animate({ scrollTop: (0) });
                    $("#usersModal").modal('hide');
                    return;
                }
            }
            
            let fetchTask = fetch(`api/Conversation/${ id }`)
                .then(response => response.json() as Promise<ConversationsState.IConversationQueryModel>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_CONVERSATION', conversation: data });
                    dispatch(push('/' + getState().conversationInstance.id) as any);
                })
                .catch(reason => {
                    dispatch({ type: 'DIDNT_RECEIVE_CONVERSATION' });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_CONVERSATION_BY_ID', id: id });
        }
    },
    requestConversationByParticipantIds: (participantIds: string[]): AppThunkAction<KnownAction | ConversationsState.SelectConversationAction> => (dispatch, getState) => {
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
                // $(".conversation-list").animate({ scrollTop: (0) });
                $("#usersModal").modal('hide');
                return;
            }
        }

        let fetchTask = fetch(`api/Conversation/ParticipantIds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participantIds)
            })
            .then(response => response.json() as Promise<ConversationsState.IConversationQueryModel>)
            .then(data => {
                dispatch({ type: 'RECEIVE_CONVERSATION', conversation: data });
                dispatch(push('/' + data.id) as any);
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_CONVERSATION_BY_PARTICIPANTS', participantIds: participantIds });
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
        case 'REQUEST_CONVERSATION_BY_ID':
            return {
                ...state,
                isLoading: true,
                id: action.id
            };
        case 'REQUEST_CONVERSATION_BY_PARTICIPANTS':
            return {
                ...state,
                isLoading: true
            };
        case 'RECEIVE_CONVERSATION':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.conversation.id === state.id) {
                return {
                    ...action.conversation,
                    isLoading: false
                };
            }
            break;
        case 'DIDNT_RECEIVE_CONVERSATION':
            return {
                ...unloadedState
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
