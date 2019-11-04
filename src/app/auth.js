/* eslint-disable */
import { CognitoAuth, StorageHelper } from 'amazon-cognito-auth-js';
import IndexRouter from '../router';
import UserInfoStore from './user-info-store';
import UserInfoApi from './user-info-api';


const CLIENT_ID = process.env.VUE_APP_COGNITO_CLIENT_ID;
const APP_DOMAIN = process.env.VUE_APP_COGNITO_APP_DOMAIN;
const REDIRECT_URI = process.env.VUE_APP_COGNITO_REDIRECT_URI;
const USERPOOL_ID = process.env.VUE_APP_COGNITO_USERPOOL_ID;
const REDIRECT_URI_SIGNOUT = process.env.VUE_APP_COGNITO_REDIRECT_URI_SIGNOUT;
const APP_URL = process.env.VUE_APP_APP_URL;

var authData = {
    ClientId: '6sdbss5c41ruofvbo633pv59hv', // Your client id here
    AppWebDomain: 'mast.auth.us-east-1.amazoncognito.com',
    TokenScopesArray: ['openid', 'email'],
    RedirectUriSignIn: 'http://localhost:8080/login/oauth2/code/cognito',
    RedirectUriSignOut: 'http://localhost:8080/logout',
    UserPoolId: 'us-east-1_csv2V85J5',
}

var auth = new CognitoAuth(authData);
auth.userhandler = {
    onSuccess: function (result) {
        console.log("On Success result", result);
        UserInfoStore.setLoggedIn(true);
        UserInfoApi.getUserInfo().then(response => {
            IndexRouter.push('/');
        });


    },
    onFailure: function (err) {
        UserInfoStore.setLoggedOut();
        IndexRouter.go({ path: '/error', query: { message: 'Login failed due to ' + err } });
    }
};

function getUserInfoStorageKey() {
    var keyPrefix = 'CognitoIdentityServiceProvider.' + auth.getClientId();
    var tokenUserName = auth.signInUserSession.getAccessToken().getUsername();
    var userInfoKey = keyPrefix + '.' + tokenUserName + '.userInfo';
    return userInfoKey;
}

var storageHelper = new StorageHelper();
var storage = storageHelper.getStorage();
export default {
    auth: auth,
    login() {
        auth.getSession();
    },
    logout() {
        if (auth.isUserSignedIn()) {
            var userInfoKey = this.getUserInfoStorageKey();
            auth.signOut();

            storage.removeItem(userInfoKey);
        }
    },
    getUserInfoStorageKey,

}