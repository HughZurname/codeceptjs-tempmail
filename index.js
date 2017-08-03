const crypto = require("crypto");
const fetch = require("node-fetch");
const promiseRetry = require("promise-retry");

/**
 * Helper with disposable mailbox api that is availible within test execution.
 */

class Mailbox extends Helper {
  /**
    * 
    * @param {Object} config configuration can be overridded by values found in `codecept.json`
    */
  constructor(config) {
    super(config);
    this.mailbox = {
      address: "",
      messages: []
    };
    this.options = {};
    Object.assign(this.options, config);
  }
  /**
     * 
     * @param {string} name [something] - Mailbox name, i.e. the email address for the newly created mailbox. 
     * @returns {object} - Creates a mailbox object and checks for mail before returning.
     * @example 
     * {
     *  address: "taij1q1j8n8@doanart.com", 
     *  messages: {error: "there are no messages yet"}
     * }
     */
  createMailbox(name) {
    const y = this.mailbox;

    _createAddress(name)
      .then(a => (y.address = a))
      .then(_getMessages)
      .then(m => (y.messages = m));

    return y;
  }

  /**
    * 
    * @param {object} x [{address:"", messages:[]}] - Takes a mailbox object and detletes the last (i.e. most recent) value from messages and the mail server.
    */
  deleteLatestMessage(x = this.mailbox) {
    if (x.messages !== [] && !Array.isArray(x.messages)) {
      let y = x.messages.pop();
      return _deleteMessage(y.mail_id);
    }
    return;
  }
  /**
     * 
     * @param {object} x [{address:"", messages:[]}] - Takes a mailbox object and uses the address to get messages.
     */
  getMessages(x = this.mailbox) {
    return _getMessages(x.address)
      .then(m => (x.messages = m))
      .catch(error => this.lastError);
  }
  /**
     * @returns The mailbox object in it's current state, i.e. if you have called the methods elsewhere in this file without arguments, the Mailbox object is updated internally. This returns it.
     */
  getMailbox() {
    return this.mailbox;
  }
  /**
 * 
 * @param {*} x {object} x [{address:"", messages:[]}] - Takes a mailbox object and assigns a `mailbox.latest` object with the last (i.e. most recent) value in the messages array returned from the server.
 * 
 */
  getLatestMessage(x = this.mailbox) {
    _getMessages(x.address)
      .then(m => (m != typeof "object" ? (x.latest = m.pop()) : (x.latest = m)))
      .catch(error => this.lastError);

    return x.latest;
  }
  /**
 * 
 * @param {string} id Takes a mail_id string and returns it from the `mailbox.messages` array
 */
  getMailById(id) {
    return this.mailbox.messages.filter(obj => {
      return obj.mail_id == id;
    });
  }
  /**
 * 
 * @param {*} x {object} x [{address:"", messages:[]}] - Takes a mailbox object and makes 10 attempts at retrieving messages from the server. Once a suitible response is recieved the `mailbox.messages` and `mailbox.latest` are updated.
 */
  waitForMessage(x = this.mailbox) {
    return promiseRetry(retry => {
      return _getMessages(x.address)
        .then(res => {
          if (!Array.isArray(res)) {
            retry(res);
          }
          return (x.messages = res);
        })
        .then(m => (x.latest = m.pop()))
        .catch(error => this.lastError);
    });
  }
}

const apiUrl = "http://api.temp-mail.ru";

const _hashAddress = str => new Promise((resolve, reject) => str ? resolve(crypto.createHash("md5").update(str).digest("hex")) : reject("No string provided"));

const _transformResponse = res => res.json();

const _fetchTransform = path => fetch(`${apiUrl}${path || ""}/format/json/`).then(_transformResponse);

const _randArrayItem = arr => arr[Math.floor(Math.random() * arr.length)];

const _randString = () => Math.random().toString(32).substring(2);

const _genRandomMail = () => _fetchTransform("/request/domains/").then(r => _randString() + _randArrayItem(r));

const _genNamedMail = str => _fetchTransform("/request/domains/").then(r => str + _randArrayItem(r));

const _createAddress = name => (name ? _genNamedMail(name) : _genRandomMail());

const _deleteMessage = msgId => _fetchTransform(`/request/delete/id/${msgId}`);

const _getMessages = addr => _hashAddress(addr).then(hash => _fetchTransform(`/request/mail/id/${hash}`));

const _delay = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = Mailbox;
