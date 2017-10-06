import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { IUserQueryModel } from './Users';
import { ConversationByIdReceiveAction, ReceiveConversationByParticipantIdsAction } from '../store/ConversationInstance';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IMessagesState {
    isLoading: boolean;
    hasMore: boolean;
    pageNumber: number;
    messages: IMessageQueryModel[]
}

export interface IMessageQueryModel {
    id: string;
    created: Date;
    sender: IUserQueryModel;
    content: string;
}

export interface IMessagesResponse {
    messages: IMessageQueryModel[];
    hasMore: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestMessagesAction {
    type: 'REQUEST_MESSAGES';
    pageNumber: number;
}

interface ReceiveMessagesAction {
    type: 'RECEIVE_MESSAGES';
    hasMore: boolean;
    pageNumber: number;
    messages: IMessageQueryModel[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestMessagesAction 
    | ReceiveMessagesAction 
    | ConversationByIdReceiveAction
    | ReceiveConversationByParticipantIdsAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestMessages: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let conversationId = getState().conversationInstance.id;
        let messagesState = getState().messages;

        if (conversationId && messagesState.isLoading) {
            let pageNumber = messagesState.pageNumber + 1;

            let fetchTask = fetch(`api/Conversation/${conversationId}/Messages?pageNumber=${ pageNumber }`, { credentials: "include" })
                .then(response => response.json() as Promise<IMessagesResponse>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_MESSAGES', pageNumber: pageNumber, messages: data.messages, hasMore: data.hasMore });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_MESSAGES', pageNumber: pageNumber });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IMessagesState = { 
    isLoading: false, 
    hasMore: true, 
    pageNumber: 0, 
    messages: []
};

export const reducer: Reducer<IMessagesState> = (state: IMessagesState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'CONVERSATION_BY_ID_RECEIVE':
        case 'RECEIVE_CONVERSATION_BY_PARTICIPANT_IDS':
            actionCreators.requestMessages();
            break;
        case 'REQUEST_MESSAGES':
            return {
                isLoading: true,
                hasMore: state.hasMore,
                pageNumber: action.pageNumber,
                messages: state.messages
            };
        case 'RECEIVE_MESSAGES':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.pageNumber === state.pageNumber) {
                return {
                    isLoading: false,
                    hasMore: action.hasMore,
                    pageNumber: action.pageNumber,
                    messages: action.messages
                };
            }
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
