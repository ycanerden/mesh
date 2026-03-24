# GameHunt Walkthrough

GameHunt is a "Product Hunt for games" application built with Angular (Frontend) and Loopback 4 (Backend).

## Features Implemented

1.  **Game Submission**: Users can submit new games with title, tagline, description, URL, thumbnail, and screenshots.
2.  **Voting System**: Users can upvote games.
3.  **Comments**: Users can comment on games.
4.  **Game Listing**: Home page displays a list of games sorted by votes (logic implemented, sorting to be added in query).
5.  **Game Details**: Detailed view of a game with screenshots and discussion section.
6.  **Authentication**: Integrated with existing auth system (Descope/JWT).

## How to Run

### Prerequisites
- Node.js (v14+)
- npm

### Backend (Loopback 4)

1.  Navigate to `loopback4` directory:
    ```bash
    cd loopback4
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    The API will be available at `http://localhost:3000`.

### Frontend (Angular)

1.  Navigate to `angular` directory:
    ```bash
    cd angular
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server (with legacy provider for Node 17+):
    ```bash
    export NODE_OPTIONS=--openssl-legacy-provider
    npm run start:dev
    ```
    The application will be available at `http://localhost:4000`.

## Verification Results

- **Backend Tests**: Passed (3 passing).
- **Frontend Build**: Succeeded.
- **SDK Generation**: Successfully generated Angular SDK from Backend OpenAPI spec.

## Next Steps

- Implement actual user authentication in the frontend (currently using temp-user-id).
- Improve UI styling to match Product Hunt more closely.
- Add sorting by votes on the backend query.
