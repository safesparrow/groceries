import firebase from 'firebase/app'
import database from 'firebase/database'
// import * as firebase from '@firebase/testing'

const firebaseConfig = {
    apiKey: "AIzaSyBXcQj3MO6xXtMA3-sbT59n7i4Gdk_lx7o",
    authDomain: "groceries-toolkit.firebaseapp.com",
    databaseURL: "https://groceries-toolkit.firebaseio.com",
    //databaseURL: "http://localhost:5000",
    projectId: "groceries-toolkit",
    storageBucket: "groceries-toolkit.appspot.com",
    messagingSenderId: "729857865421",
    appId: "1:729857865421:web:bafdff6494d36bba5ddb84"
};
let db2;
if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db2 = firebase.database()
    db2.useEmulator("localhost", 9000);
}
db2 = firebase.database()
export const db = db2;
export const rootRef = db.ref();
export const productsRef = db.ref('products');
export const recipesRef = db.ref('recipes');
export const plansRef = db.ref('plans');
