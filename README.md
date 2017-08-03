<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [Intro](#intro)
-   [Config](#config)
-   [Mailbox](#mailbox)
    -   [constructor](#constructor)
    -   [createMailbox](#createmailbox)
    -   [deleteLatestMessage](#deletelatestmessage)
    -   [getMessages](#getmessages)
    -   [getMailbox](#getmailbox)
    -   [getLatestMessage](#getlatestmessage)
    -   [getMailById](#getmailbyid)
    -   [waitForMessage](#waitformessage)
-   [Example](#example)

## Intro

[Codecept](http://codecept.io/) Helper with that consumes the [temp-mail.ru](https://temp-mail.ru/en/api/) api for test scenarios that require email interaction. An example scenario can be found [below](#example)


## Config

**Add to `codecept.conf.js` with:**

```javascript
exports.config = {
    helpers: {
        Nightmare: {
            url: "http://localhost"
            },
        Mailbox: {
            "require": "node_modules/codeceptjs-tempmail"
        }
    }
    /*...some config*/
}
```

**or to `codecept.json` with:**

```json
{
  "helpers": {
    "Nightmare": {
      "url": "http://localhost"
    },
    "Mailbox": {
      "require": "node_modules/codeceptjs-tempmail"
    }
  }
}
```


## Mailbox

**Extends Helper**

Helper with disposable mailbox api that is availible within test execution.

**Parameters**

-   `config`  

### constructor

**Parameters**

-   `config` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** configuration can be overridded by values found in `codecept.json`

### createMailbox

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** Optional string to be used in mainlbox address

**Examples**

```javascript
I.createMailbox('testmail') //{address: "testmail@doanart.com", messages: {error: "there are no messages yet"}}
I.createMailbox() //{address: "taij1q1j8n8@doanart.com", messages: {error: "there are no messages yet"}}
```

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Creates a mailbox object and checks for mail before returning.

### deleteLatestMessage

**Parameters**

-   `mailbox` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Takes a mailbox object and detletes the last (i.e. most recent) value from messages and the mail server. (optional, default `this.mailbox`)

### getMessages

**Parameters**

-   `mailbox` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Takes a mailbox object and uses the address to get messages. (optional, default `this.mailbox`)

### getMailbox

Returns **any** The mailbox object in it's current state, i.e. if you have called the methods elsewhere in this file without arguments, the Mailbox object is updated internally. This returns it.

### getLatestMessage

**Parameters**

-   `mailbox` **any** {object=} mailbox - Takes a mailbox object and assigns a `mailbox.latest` object with the last (i.e. most recent) value in the messages array returned from the server. (optional, default `this.mailbox`)

### getMailById

**Parameters**

-   `id` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Takes a mail_id string and returns it from the `mailbox.messages` array

### waitForMessage

**Parameters**

-   `mailbox` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** Takes a mailbox object and makes 10 attempts at retrieving messages from the server. Once a suitible response is recieved the `mailbox.messages` and `mailbox.latest` are updated. (optional, default `this.mailbox`)

## Example

```javascript
Feature("Create Account");

Scenario("Create account email", function* (I) {
    // Process initiated from an email with a link to create an account.
    I.waitForMessage();
    mailbox = yield I.getMailbox();
    //I.grabRegex() should be replaced with a regex function that extracts a value from the supplied email text.
    createLink = yield I.grabRegex(null, mailbox.latest.mail_text_only);
});

Scenario("Create Account", (I) => {
    I.amOnPage(createLink);
    I.waitForText("Create a New Account");
    I.click("Create a New Account");
    I.fillField("password", "Som3Rand0mPa55");
    I.fillField("confirmPassword", "Som3Rand0mPa55");
    I.click("Create Account");
    I.waitForText("Activate Your Account");
    I.see("Activate Your Account");
    I.see(`An email has been sent to ${mailbox.address}`);
    
    I.deleteLatestMessage(mailbox);
    //Delete can take a few seconds to register with the temp-mail server, it's recommended that an arbitrary wait is used in your scenario.
    I.wait(10);
});

Scenario("Activation Email", function* (I) {
    // Wait for new activation email
    I.waitForMessage();
    mailbox = yield I.getMailbox();
    activationLink = yield I.grabRegex(null, mailbox.latest.mail_text);
});

Scenario("5862 Login", (I) => {
    I.amOnPage(activationLink);
    I.waitForText("Email Address Verified");
    I.see("Login");
    I.fillField("username", mailbox.address);
    I.fillField("password", "Som3Rand0mPa55");
    I.click("Login");

    I.deleteLatestMessage(mailbox);
    I.wait(10);
    I.getMessages();
});
```

