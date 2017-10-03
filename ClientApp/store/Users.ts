import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IUsersState {
    isLoading: boolean;
    hasMore: boolean;
    pageNumber: number;
    users: IUserQueryModel[];
}

export interface IUserQueryModel {
    id: string;
    username: string;
}

export interface IUsersQueryModel {
    users: IUserQueryModel[],
    hasMore: boolean
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface IRequestUsersAction {
    type: 'REQUEST_USERS';
    pageNumber: number;
}

interface IReceiveUsersAction {
    type: 'RECEIVE_USERS';
    users: IUserQueryModel[];
    pageNumber: number;
    hasMore: boolean;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = IRequestUsersAction | IReceiveUsersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestUsers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let usersState = getState().users;

        if (!usersState.isLoading) {
            let pageNumber = usersState.pageNumber + 1;
    
            let fetchTask = fetch(`api/User/Page/${ pageNumber }`)
                .then(response => response.json() as Promise<IUsersQueryModel>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_USERS', pageNumber: pageNumber, users: data.users, hasMore: data.hasMore });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_USERS', pageNumber: pageNumber });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const unloadedState: IUsersState = { 
    isLoading: false,
    hasMore: true,
    pageNumber: 0,
    users: []
};

export const reducer: Reducer<IUsersState> = (state: IUsersState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_USERS':
            return {
                isLoading: true,
                hasMore: state.hasMore,
                pageNumber: action.pageNumber,
                users: state.users
            };
        case 'RECEIVE_USERS':
            return {
                isLoading: false,
                hasMore: action.hasMore,
                pageNumber: action.pageNumber,
                users: state.users.concat(action.users)
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
