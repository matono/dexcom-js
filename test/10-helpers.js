/**
 * Unit tests for the functions provided by module ../helpers.js.
 */

'use strict';


//***********
//* Modules *
//***********

const yaml          = require('js-yaml');
const fs            = require('fs');
const tape          = require('tape');
const _test         = require('tape-promise').default; // <---- notice 'default'
const test          = _test(tape); // decorate tape
const index         = require('../index.js');
const helpers       = require('../helpers.js');


//*************
//* Constants *
//*************

const options = yaml.load(fs.readFileSync('./test/secrets.yml', 'utf8'));
//console.log(options);
index.setOptions(options);


//**************
//* Unit Tests *
//**************

test('Verify validateOptions()', function (t) {
  const nullOptions = null;
  const emptyOptions = {};
  const emptyProperties = {
    clientId:     '',
    clientSecret: '',
    redirectUri:  '',
    apiUri:       ''
  };
  const invalidRedirectUri = {
    clientId:     'jitzdjgkgzocbygphnzgpgeibqrybaxj',
    clientSecret: 'dnnukiodacexkmum',
    redirectUri:  'not a URI',
    apiUri:       'https://api.dexcom.com'
  };
  const invalidApiUri = {
    clientId:     'jitzdjgkgzocbygphnzgpgeibqrybaxj',
    clientSecret: 'dnnukiodacexkmum',
    redirectUri:  'https://foo.bar.com',
    apiUri:       'not a URI'
  };
  const clientIdIsTooLong = {
    clientId:     'This client ID is too long and should be rejected.',
    clientSecret: 'dnnukiodacexkmum',
    redirectUri:  'https://foo.bar.com',
    apiUri:       'https://api.dexcom.com'
  };
  const clientSecretIsTooLong = {
    clientId:     'jitzdjgkgzocbygphnzgpgeibqrybaxj',
    clientSecret: 'This client secret is too long and should be rejected',
    redirectUri:  'https://foo.bar.com',
    apiUri:       'https://api.dexcom.com'
  };
  const validProperties = {
    clientId:     'jitzdjgkgzocbygphnzgpgeibqrybaxj',
    clientSecret: 'dnnukiodacexkmum',
    redirectUri:  'https://foo.bar.com',
    apiUri:       'https://api.dexcom.com'
  };

  t.throws(() => {helpers.validateOptions(nullOptions);},           'null options are rejected.');
  t.throws(() => {helpers.validateOptions(emptyOptions);},          'empty options are rejected.');
  t.throws(() => {helpers.validateOptions(emptyProperties);},       'empty properties are rejected.');
  t.throws(() => {helpers.validateOptions(invalidRedirectUri);},    'invalid redirect URI is rejected.');
  t.throws(() => {helpers.validateOptions(invalidApiUri);},         'invalid API URI is rejected.');
  t.throws(() => {helpers.validateOptions(clientIdIsTooLong);},     'too-long client ID is rejected.');
  t.throws(() => {helpers.validateOptions(clientSecretIsTooLong);}, 'too-long client secret is rejected.');

  t.doesNotThrow(() => {helpers.validateOptions(validProperties);}, 'valid properties are accepted');

  t.end();
});

test('Verify validateSandboxAuthcode()', function (t) {
  const sandboxUser0 = 'SandboxUser0';
  const sandboxUser1 = 'SandboxUser1';
  const sandboxUser2 = 'SandboxUser2';
  const sandboxUser3 = 'SandboxUser3';
  const sandboxUser4 = 'SandboxUser4';
  const sandboxUser5 = 'SandboxUser5';
  const sandboxUser6 = 'SandboxUser6';
  const sandboxUser7 = 'SandboxUser7';
  const sandboxUser8 = 'SandboxUser8';

  t.throws(() => {helpers.validateSandboxAuthcode(sandboxUser0);}, 'SandboxUser0 is rejected.');
  t.throws(() => {helpers.validateSandboxAuthcode(sandboxUser8);}, 'SandboxUser8 is rejected.');

  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser1);}, 'SandboxUser1 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser2);}, 'SandboxUser2 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser3);}, 'SandboxUser3 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser4);}, 'SandboxUser4 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser5);}, 'SandboxUser5 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser6);}, 'SandboxUser6 is accepted.');
  t.doesNotThrow(() => {helpers.validateSandboxAuthcode(sandboxUser7);}, 'SandboxUser7 is accepted.');

  t.end();
});

test('Verify dexcomifyEpochTime()', function (t) {
  const epochMilliseconds = 1586101155000;
  const actual            = helpers.dexcomifyEpochTime(epochMilliseconds);
  const expected          = '2020-04-05T15:39:15';

  t.equal(actual, expected, 'Dexcom time representation is valid.');

  t.end();
});

test('Verify validateTimeWindow()', function (t) {
  const t0 = -1;
  const t1 = 1;
  const t2 = 2;

  t.throws(() => {helpers.validateTimeWindow(null, null);}, 'null arguments are rejected.');
  t.throws(() => {helpers.validateTimeWindow(t2, t1);},     'startTime > endTime is rejected.');
  t.throws(() => {helpers.validateTimeWindow(t0, t1);},     'negative startTime is rejected.');
  t.throws(() => {helpers.validateTimeWindow(t1, t0);},     'negative endTime is rejected.');

  t.doesNotThrow(() => {helpers.validateTimeWindow(t1, t2);}, 'startTime > endTime is accepted.');

  t.end();
});

test('Verify validateOAuthTokens()', function (t) {
  const noTimestamp = {
    dexcomOAuthToken: {
      access_token:  'some opaque access token',
      expires_in:    7200,
      token_type:    'Bearer',
      refresh_token: 'some opaque refresh token',
    }
  };
  const negativeTimestamp = {
    timestamp: -1,
    dexcomOAuthToken: {
      access_token:  'some opaque access token',
      expires_in:    7200,
      token_type:    'Bearer',
      refresh_token: 'some opaque refresh token',
    }
  };
  const emptyDexcomTokenProperties = {
    timestamp: 10000,
    dexcomOAuthToken: {
      access_token:  '',
      expires_in:    7200,
      token_type:    '',
      refresh_token: '',
    }
  };
  const missingDexcomTokenProperties = {
    timestamp: 10000,
    dexcomOAuthToken: {
    }
  };
  const validOAuthTokens = {
    timestamp: 10000,
    dexcomOAuthToken: {
      access_token:  'some opaque access token',
      expires_in:    7200,
      token_type:    'Bearer',
      refresh_token: 'some opaque refresh token',
    }
  };

  t.throws(() => {helpers.validateOAuthTokens(null);},                         'null argument is rejected.');
  //t.throws(() => {helpers.validateOAuthTokens(noTimestamp);},                  'missing timestamp property is rejected.');
  //t.throws(() => {helpers.validateOAuthTokens(negativeTimestamp);},            'negative timestamp property is rejected.');
  //t.throws(() => {helpers.validateOAuthTokens(emptyDexcomTokenProperties);},   'empty Dexcom token properties are rejected.');
  //t.throws(() => {helpers.validateOAuthTokens(missingDexcomTokenProperties);}, 'missing Dexcom token properties are rejected.');

  t.doesNotThrow(() => {helpers.validateOAuthTokens(validOAuthTokens);}, 'valid OAuth tokens are accepted.');

  t.end();
});

test('Verify refreshAccessToken()', async function (t) {
  const oauthTokens = await index.getSandboxAuthenticationToken('SandboxUser6');
  const result      = await helpers.refreshAccessToken(options, oauthTokens, true);

  //console.log(oauthTokens);
  //console.log(result);
  t.ok('timestamp'        in result, 'result contains timestamp');
  t.ok('dexcomOAuthToken' in result, 'result contains dexcomOAuthToken');
});

test('Verify refreshAccessToken() with an old token', async function (t) {
  const oauthTokens = await index.getSandboxAuthenticationToken('SandboxUser5');

  // this token appears to work no matter what the user is.   wut....
  oauthTokens.dexcomOAuthToken.refresh_token = 'f1749e8056cfebce02e29e903226dd17';
  const result      = await helpers.refreshAccessToken(options, oauthTokens, true);

  //console.log(oauthTokens);
  //console.log(result);
  t.ok('timestamp'        in result, 'result contains timestamp');
  t.ok('dexcomOAuthToken' in result, 'result contains dexcomOAuthToken');
});
