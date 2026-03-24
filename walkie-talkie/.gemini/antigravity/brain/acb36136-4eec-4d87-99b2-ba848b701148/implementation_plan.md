# GameHunt Implementation Plan

Goal: Build a "Product Hunt for games" application using the existing Angular + Loopback 4 codebase.

## User Review Required
- **Design**: The UI will be styled to resemble Product Hunt (clean, modern, list-based).
- **Features**: Core features include Game Submission, Voting, Comments, and User Authentication.

## Proposed Changes

### Configuration & Setup
- [ ] Fix `package.json` dependencies if needed.
- [ ] Ensure `docker-compose.yml` works or set up local running scripts.

### Backend (Loopback 4)
#### [NEW] Models
- `Game`: Title, description, tagline, URL, thumbnail, screenshots, makerId, createdAt.
- `Vote`: gameId, userId, type (upvote).
- `Comment`: gameId, userId, content, createdAt.

#### [MODIFY] Models
- `User`: Ensure it supports profile info needed for "Makers".

#### [NEW] Controllers
- `GameController`: CRUD for games, voting logic.
- `CommentController`: CRUD for comments.

### Frontend (Angular)
#### [NEW] Features
- `games`: Module for game listing, submission, and details.
    - `GameListComponent`: Home page, list of games sorted by votes.
    - `GameDetailComponent`: Detailed view, comments, screenshots.
    - `GameSubmitComponent`: Form to submit a new game.

#### [MODIFY] Features
- `auth`: Ensure login/signup works and redirects correctly.
- `shared`: Add `VoteButtonComponent`, `CommentSectionComponent`.

#### [MODIFY] Styles
- Update `styles.scss` and component styles to match Product Hunt's aesthetic (orange accent, clean typography).

## Verification Plan

### Automated Tests
- Run backend tests: `npm test` in `loopback4`.
- Run frontend tests: `npm test` in `angular`.

### Manual Verification
1.  **Setup**: Run `npm install` in both directories. Start backend and frontend.
2.  **Auth**: Register a new user, Login.
3.  **Submission**: Submit a new game with image URL and description.
4.  **Listing**: Verify the game appears on the home page.
5.  **Voting**: Upvote the game, verify count increases.
6.  **Comments**: Post a comment on the game, verify it appears.
