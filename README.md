# Scube Smart Business Card Application

Welcome to the Scube Smart Business Card application! This repository contains the codebase for the web application, server, and admin console.

## Requirements

- Node.js >= v14.15.5
- npm >= 6.14.11

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

### Server Setup

1. Navigate to the `server` folder.
2. Create a `.env` file and configure the following environment variables:

```
PORT=''
APP_KEY=''
DBHOST=''
DBUSER=''
DBPASS=''
DBNAME=''
NODE_ENV=''
```

3. Run the following commands in the server folder to perform database migration and seeding:

```bash
knex migrate:latest
knex seed:run --specific=roles.js
knex seed:run --specific=role_modules.js
knex seed:run --specific=permissions.js
knex seed:run --specific=users.js
```
4. npm the backend server  cmd `npm start` inside server folder.


### Admin Panel Setup

1. Navigate to the root folder.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

To build for production:

```bash
npm run prod
```

### Web App Setup

1. Navigate to the `webapp` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## Usage

Once the server and web app are set up, you can access the Scube Smart Business Card application by navigating to the appropriate URL in your web browser.

Feel free to explore the features and functionalities provided by the application!
