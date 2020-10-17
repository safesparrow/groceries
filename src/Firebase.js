import * as firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyBXcQj3MO6xXtMA3-sbT59n7i4Gdk_lx7o",
    authDomain: "groceries-toolkit.firebaseapp.com",
    databaseURL: "https://groceries-toolkit.firebaseio.com",
    projectId: "groceries-toolkit",
    storageBucket: "groceries-toolkit.appspot.com",
    messagingSenderId: "729857865421",
    appId: "1:729857865421:web:bafdff6494d36bba5ddb84"
};
firebase.initializeApp(firebaseConfig)
export const db = firebase.database()