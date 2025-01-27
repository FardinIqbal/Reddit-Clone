# Reddit Clone

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
   - [User Functionality](#user-functionality)
   - [Core Technical Features](#core-technical-features)
3. [Technologies Used](#technologies-used)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Development Tools](#development-tools)
4. [Application Architecture](#application-architecture)
5. [Data Models](#data-models)
   - [Community Schema](#community-schema)
   - [Post Schema](#post-schema)
   - [Comment Schema](#comment-schema)
6. [Key Learning Outcomes](#key-learning-outcomes)
7. [Installation and Setup](#installation-and-setup)
8. [Best Practices Followed](#best-practices-followed)
9. [Future Improvements](#future-improvements)
10. [License](#license)
11. [Contact](#contact)

## Overview
The Reddit Clone is a full-stack web application designed to replicate key features of Reddit. It demonstrates proficiency in server-side programming, NoSQL databases, and client-server architecture. Built with modern technologies such as React, Node.js, and MongoDB, this project showcases the integration of a dynamic frontend with a robust backend, emphasizing performance, scalability, and user experience.

---

## Features
### User Functionality
- **Home Page:** Displays all posts with sorting options (newest, oldest, and most active).
- **Community Pages:** Each community has a dedicated page listing its posts and community details.
- **Search:** Search functionality for posts and comments based on keywords.
- **Post Details:** A detailed view of individual posts with threaded comments.
- **Create Post and Community:** Users can create new communities and posts with validation to ensure data integrity.

### Core Technical Features
- **Dynamic Timestamps:** Posts and comments display time since creation (e.g., “5 minutes ago”, “1 year ago”).
- **Threaded Comments:** Nested comment system with proper indentation and order.
- **Responsive Design:** A clean and responsive UI for seamless interaction across devices.

---

## Technologies Used
### Frontend
- **React.js**: For building dynamic, component-based UI.
- **Axios**: For seamless HTTP requests between the client and server.

### Backend
- **Node.js**: To handle server-side logic and APIs.
- **Express.js**: Framework for routing and middleware.
- **MongoDB**: NoSQL database for storing and managing application data.
- **Mongoose**: Object Data Modeling (ODM) for MongoDB, simplifying schema definition and queries.

### Development Tools
- **Nodemon**: For automatic server restarts during development.
- **ESLint**: Ensuring code quality and adherence to best practices.
- **Git/GitHub**: Version control and repository hosting.

---

## Application Architecture
1. **Client-Server Interaction**: The React frontend interacts with the Node.js backend via RESTful APIs.
2. **Database Management**: MongoDB stores data for communities, posts, comments, and link flairs.
3. **Modularity**: The codebase is organized into modular components and routes for maintainability.

---

## Data Models
### Community Schema
- **Name**: Max 100 characters.
- **Description**: Max 500 characters.
- **Start Date**: Defaults to current date and time.

### Post Schema
- **Title**: Max 100 characters.
- **Content**: No character limit.
- **Views**: Default is 0.
- **Timestamp**: Automatically generated.

### Comment Schema
- **Content**: Max 500 characters.
- **Nested Comments**: Threaded structure using parent-child relationships.

---

## Key Learning Outcomes
This project strengthened my skills in:
- **Full-Stack Development**: Gained practical experience in building end-to-end applications.
- **Database Design**: Designed and implemented schemas with relationships using MongoDB and Mongoose.
- **RESTful APIs**: Built robust APIs for CRUD operations and data fetching.
- **Frontend-Backend Integration**: Effectively connected the frontend and backend for a seamless user experience.
- **Problem Solving**: Implemented complex features such as threaded comments and dynamic sorting.

---

## Installation and Setup
1. **Clone the Repository**:
   ```bash
   git clone git@github.com:FardinIqbal/Reddit-Clone.git
   cd Reddit-Clone
   ```

2. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start MongoDB**:
   ```bash
   mongod
   ```

4. **Run the Application**:
   ```bash
   # Start the server
   cd server
   npm start

   # Start the client
   cd ../client
   npm start
   ```

5. **Access the Application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8000](http://localhost:8000)

---

## Best Practices Followed
- **Modular Code**: Organized codebase with reusable components and clearly defined routes.
- **Error Handling**: Comprehensive error handling in both client and server.
- **Validation**: Ensured input validation at both the frontend and backend.
- **Security**: Applied CORS middleware and sanitized inputs to prevent vulnerabilities.

---

## Future Improvements
- **Authentication**: Add user authentication for more personalized features.
- **Pagination**: Implement pagination for large post/comment datasets.
- **Real-Time Updates**: Use WebSockets for real-time updates to posts and comments.
- **Testing**: Add unit and integration tests to ensure reliability.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact
For any questions or feedback, feel free to reach out at [fardin.iqbal@stonybrook.edu](mailto:fardin.iqbal@stonybrook.edu).
