import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface IUsersState {
    search?: string;
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

interface SearchUsersAction {
    type: 'SEARCH_USERS';
    search?: string;
}

interface IRequestUsersAction {
    type: 'REQUEST_USERS';
    skip: number;
}

interface IReceiveUsersAction {
    type: 'RECEIVE_USERS';
    users: IUserQueryModel[];
    skip: number;
    hasMore: boolean;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type UsersAction = IRequestUsersAction | IReceiveUsersAction;

type KnownAction = SearchUsersAction | UsersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    searchUsers: (search: string): AppThunkAction<SearchUsersAction> => (dispatch, getState) => {
        dispatch({ type: 'SEARCH_USERS', search: search });
    },
    requestUsers: (): AppThunkAction<SearchUsersAction | UsersAction> => (dispatch, getState) => {
        let usersState = getState().users;

        if (!usersState.isLoading) {
            let skip = usersState.users.length;
            let search = usersState.search;
            let fetchTask = fetch(`api/User/Latest?skip=${ skip }` + (search ? "&search=" + search : ""), { credentials: "same-origin" })
                .then(response => response.json() as Promise<IUsersQueryModel>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_USERS', skip: skip, users: data.users, hasMore: data.hasMore });
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: 'REQUEST_USERS', skip: skip });
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
        case 'SEARCH_USERS':
            if (action.search != state.search) return {
                ...state, 
                users: [],
                search: action.search
            };
            break;
        case 'REQUEST_USERS':
            return {
                ...state,
                isLoading: true,
                hasMore: state.hasMore,
                pageNumber: action.skip,
                users: state.users
            };
        case 'RECEIVE_USERS':
            return {
                ...state,
                isLoading: false,
                hasMore: action.hasMore,
                pageNumber: action.skip,
                users: state.users.concat(action.users)
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
