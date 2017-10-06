import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { IUserQueryModel } from './Users';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IUserListState {
    selectedUsers: IUserQueryModel[];
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

export interface ISelectUserAction {
    type: 'SELECT_USER',
    user: IUserQueryModel;
}

export interface IUnselectUserAction {
    type: 'UNSELECT_USER',
    user: IUserQueryModel;
}

export interface IUnselectUsersAction {
    type: 'UNSELECT_USERS'
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = ISelectUserAction | IUnselectUserAction | IUnselectUsersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    selectUser: (user: IUserQueryModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SELECT_USER', user: user });
    },
    unselectUser: (user: IUserQueryModel): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UNSELECT_USER', user: user });
    },
    unselectUsers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UNSELECT_USERS' });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IUserListState = { 
    selectedUsers: []
};

export const reducer: Reducer<IUserListState> = (state: IUserListState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SELECT_USER':
            if (state.selectedUsers.map(su => su.id).indexOf(action.user.id) === -1) return {
                selectedUsers: [
                    action.user,
                    ...state.selectedUsers
                ]
            };
            break;
        case 'UNSELECT_USER':
            let index = state.selectedUsers.map(su => su.id).indexOf(action.user.id);
            if (index !== -1) {
                state.selectedUsers.splice(index, 1);
                return {
                    selectedUsers: [
                        ...state.selectedUsers
                    ]
                };
            };
            break;
        case 'UNSELECT_USERS':
            return {
                selectedUsers: []
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
