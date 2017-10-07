import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as $ from "jquery";
import * as Bootstrap from 'bootstrap';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IMainState {
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

export interface ShowModalAction {
    type: 'SHOW_MODAL';
    id: string;
}

export interface HideModalAction {
    type: 'HIDE_MODAL';
    id: string;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ShowModalAction | HideModalAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    showModal: (id: string): AppThunkAction<ShowModalAction> => (dispatch, getState) => {
        dispatch({ type: 'SHOW_MODAL', id: id });
    },
    hideModal: (id: string): AppThunkAction<HideModalAction> => (dispatch, getState) => {
        dispatch({ type: 'HIDE_MODAL', id: id });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IMainState = { };

export const reducer: Reducer<IMainState> = (state: IMainState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SHOW_MODAL':
            $("#" + action.id).modal('show');
            break;
        case 'HIDE_MODAL':
            $("#" + action.id).modal('hide');
            break;
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
