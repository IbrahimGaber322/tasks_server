# Tasks Server Readme

This repository contains the backend code for the Task Manager Application. It is built using Node.js, Express.js, and MongoDB.

## Installation

To run the Task Server, follow these steps:

1. Ensure that you have Node.js and MongoDB installed on your machine.

1. Clone this repository to your local machine.

1. Navigate to the repository directory using the command line.

1. Run the following command to install the required dependencies:

   ```
   npm install
   ```

## Configuration

Before running the Task Server, make sure to configure the server settings. Open the `.env` file and adjust the following variables:

```dotenv
SERVER_PORT=5000  # Replace with the desired port number

DATABASE_URL= # Replace with your MongoDB connection URL

FRONTEND_URL=http://localhost:3000  # Replace with the URL where the Task Client is running

EMAIL_USER=# Replace with your email address for sending notifications

EMAIL_PASSWORD=# Replace with your email password

JWTSECRET=# Replace with your preferred JWT secret
```

## Usage

To start the Task Server, use the following commands:
```
npm run build
```
```
npm start
```

This will build the TypeScript code and start the server. The server will run on the specified port (default is 5000).

## Features

The Task Server includes the following features:

1. **Get all tasks**: Retrieve all tasks from the database and send them to the Task Client.

1. **Add a new task**: Receive new task data from the Task Client, create a new task, and save it in the database.

1. **Mark a task as completed**: Receive a request from the Task Client to mark a task as completed, update the task status in the database.

1. **Delete a task**: Receive a request from the Task Client to delete a task, remove the task from the database.

1. **Update Task**: Allow users to edit and update existing tasks.

1. **Filter and Sorting**: Implement the ability to filter tasks based on completion status or due date. Allow users to sort tasks by due date or completion status.

1. **Task Categories/Tags**: Allow users to categorize tasks by adding tags or categories. Implement a feature to filter tasks by tags.

1. **Pagination**: If the number of tasks is large, implement pagination on the backend and frontend to display tasks in smaller, manageable chunks.

1. **User Authentication**: Add user authentication and allow users to have their task lists. Each user should only see and manage their tasks.

1. **Task Sharing**: Implement the ability for users to share individual tasks with others via a unique link.

1. **Task Comments**: Allow users to add comments to tasks and view a list of comments on each task.

1. **Data Validation**: Ensure that all input data is properly validated on both the frontend and backend to prevent any potential security vulnerabilities.

## Contributing

If you would like to contribute to this project, feel free to submit a pull request. Please make sure to follow the established coding style and guidelines.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for more information.

## Contact

If you have any questions or concerns, feel free to contact the author:

Author: Ibrahim Gaber
Email: ibrahimseda322@gmail.com

Thank you for using the Task Server!
