const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * Helper with queryable diespoable mailbox api for use in tests.
 */
class Mailbox extends Helper {
    /**
     * 
     * @param {Object} config configuration can be overridded by values found in `codecept.json
     */
    constructor(config) {
        this.apiUrl = config.apiUrl || 'http://api.temp-mail.ru'
        this.mailbox = {
            address: '',
            messages: []
        }
    }

    _init() {
        return this.createMailbox(null);
    }

    _hashAddress(str) {
        return new Promise((resolve, reject) => (
            str ? resolve(crypto.createHash("md5").update(str).digest("hex")) : reject("No string provided")));
    }

    _transformResponse(res) {
        return res.json();
    }

    _fetchTransform(path) {
        return fetch(`${this.apiUrl}${path || ""}/format/json/`).then(this._transformResponse);
    }

    _randArr(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    _randStr() {
        return Math.random().toString(32).substring(2);
    }

    _genRandomMail() {
        return this._fetchTransform("/request/domains/")
            .then(r => this._randStr() + this._randArr(r))
            .then(a => this.mailbox.address = a)
            .then(e => console.log(e));
    }

    _genNamedMail(name = this.mailbox.address) {
        return this._fetchTransform("/request/domains/")
            .then(r => name + this._randArr(r))
            .then(a => this.mailbox.address = a);
    }

    createMailbox(name = this.mailbox.address) {
        return name ? this._genNamedMail(name).then(this.getMessages) : this._genRandomMail().then(this.getMessages);
    }

    deleteMessage(msgId) {
        return this._fetchTransform(`/request/delete/id/${msgId}`)
    }

    getMessages(addr = this.mailbox.address) {
        return this._hashAddress(addr)
            .then(hash => this._fetchTransform(`/request/mail/id/${hash}`))
            .then(m => this.mailbox.messages = m)
    }

    getMailbox() {
        return this.mailbox
    }
}

module.exports = Mailbox;