This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Groceries app
This is a web app that aims to help with household's groceries and all related activities.
Example feature include:
* a searchable book of recipes
* a record of recipes/meals prepared and ones planned for the upcoming days
* grocery management - keeping track of grocery items bought, their Best Before date etc
* import grocery orders made through Tesco Online into the app
* help with grocery shopping, based on the items already available in the household and planned meals 
* help keep track of one's diet

## Architecture
The app is a web app written in Typescript and React and react-bootstrap.
It uses Firestore Realtime Database as backend

## Running locally

### Setting up a local Firestore Realtime DB
The app connects to a local instance of Firebase Realtime Database on a port 9000.
To spin up the local instance on the default port 9000:

```
# In a separate directory:
yarn global add firebase-tools
firebase init emulators # select auth & realtime database
firebase emulators:start
```

### Running the app
```
yarn install # first time only
yarn start
```

## Current state
* The app supports basic CRUD operations for managing recipes
* The app is ugly :)
* Anonymous access is allowed, there is no user-specific data stored
* It is hardcoded to work with a local instance of Firestore
* It doesn't have any tests