This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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
