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