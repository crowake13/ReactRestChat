import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { push } from 'react-router-redux';
import { AppThunkAction } from './';
import * as ConversationsState from './Conversations';
import { IMessageQueryModel } from './Messages';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IConversationInstanceState {
    isLoading: boolean;
    id?: string;
    title: string;
    participants: ConversationsState.IParticipantQueryModel[];
}

export interface IConversationInstanceQueryModel extends ConversationsState.IConversationQueryModel {
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
    conversation: IConversationInstanceQueryModel;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestConversationByIdAction 
    | RequestConversationByParticipantIdsAction 
    | ReceiveConversationAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestConversationById: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (id !== getState().conversationInstance.id) {
            let conversations = getState().conversations.conversations;
            
            if (conversations.length && conversations.map(c => c.id).indexOf(id) === -1) {
                ConversationsState.actionCreators.selectConversation(id);
                return;
            }
            
            let fetchTask = fetch(`api/Conversation/${ id }`)
                .then(response => response.json() as Promise<IConversationInstanceQueryModel>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_CONVERSATION', conversation: data });
                })
                .catch((reason) => {
                    if (getState().conversations.conversations.length) dispatch(push('/conversations') as any);
                    else dispatch(push('/users') as any);
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_CONVERSATION_BY_ID', id: id });
        }
    },
    requestConversationByParticipantIds: (participantIds: string[]): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Conversation/ParticipantIds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(participantIds)
            })
            .then(response => response.json() as Promise<IConversationInstanceQueryModel>)
            .then(data => {
                dispatch({ type: 'RECEIVE_CONVERSATION', conversation: data });
                dispatch(push('/conversation/' + data.id) as any);
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
                isLoading: true
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
                    isLoading: false,
                    id: action.conversation.id,
                    title: action.conversation.title,
                    participants: action.conversation.participants
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
