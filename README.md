# ReactRestChat

This is a simple chat web application built with [.NET Core 2.0](https://blogs.msdn.microsoft.com/dotnet/2017/08/14/announcing-net-core-2-0/), [Entity Framework Core 2.0](https://blogs.msdn.microsoft.com/dotnet/2017/08/14/announcing-entity-framework-core-2-0/), [React](https://reactjs.org/) & [Redux](https://github.com/reactjs/redux). 

## Features

### Account management

* Registration
* Login / Logout
* Change information (email, phone number)
* Change Password

### View a list of latest conversations

* Shown as an infinite scrolling list

### Create a new conversation

* Search users
* Select users from an infinite scrolling list
* Unselect users

### View a conversation

* View participants
* View messages in descending order of creation as an infinite scrolling list
* Refresh messages
* Send a new message

### Delete a message (only your own)

The message does not really get deleted. The message is marked as deleted and i not shown to the user again while other participants see the normal conversation history. 

### Delete a conversation

The conversation does not really get deleted. The users conversation instance is marked as deleted and is never shown to the user again while the other participants see the normal conversation history.