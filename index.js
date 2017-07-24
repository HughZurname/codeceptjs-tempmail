const crypto = require('crypto');
const fetch = require('node-fetch');
const promiseRetry = require("promise-retry");

const apiUrl = 'http://api.temp-mail.ru'

const _hashAddress = (str) => (new Promise((resolve, reject) => (
    str ? resolve(crypto.createHash('md5').update(str).digest('hex')) : reject("No string provided")
)))

const _transformResponse = (res) => (new Promise((resolve, reject) => (
    typeof res === typeof {} ? resolve(res.json()) : reject("Invalid data type")
)))

const _fetchTransform = (path) => (
    fetch(`${apiUrl}${path || ''}/format/json/`)
    .then(_transformResponse)
)

const _randArr = (arr) => (arr[Math.floor(Math.random() * arr.length)])

const _randStr = () => (Math.random().toString(32).substring(2))

const _genRandomMail = () => (
    _fetchTransform('/request/domains/')
    .then(r => _randStr() + _randArr(r))
)

const _genNamedMail = (str) => (
    _fetchTransform('/request/domains/')
    .then(r => str + _randArr(r))
)

const _createAddress = (name) => (
    name ? _genNamedMail(name) : _genRandomMail()
)

const _deleteMessage = (m) => (
    _fetchTransform(`/request/delete/id/${m}`)
)

const _getMessages = (addr) => (
    _hashAddress(addr)
    .then(hash => _fetchTransform(`/request/mail/id/${hash}`))
)

const _retryMail = (addr) => {
    promiseRetry((retry, number) => {
        return _getMessages(addr)
            .then(res => {
                if (!res[i]) {
                    retry(res);
                }
                return res;
            });
    });
}

/**
 * Helper with queryable diespoable mailbox api for use in tests.
 */
class Mailbox extends Helper {
    /**
     * 
     * @param {Object} config configuration can be overridded by values found in `codecept.json
     */
    constructor(config) {
        super(config)
        this.mailbox = {
            address: '',
            messages: []
        }
    }

    createMailbox(x) {
        _createAddress(x).then(a => this.mailbox.address = a)
            .then(_getMessages)
            .then(m => this.mailbox.messages = m)

        return this.mailbox
    }

    deleteMessage(x = this.mailbox.messages) {
        !x[0].mail_id ? x = '' : x[0].mail_id
        _deleteMessage(x)

        return this.getMessages()
    }

    getMessages(x = this.mailbox.address) {
        _getMessages(x)
            .then(m => this.mailbox.messages = m)

        return this.mailbox.messages
    }

    getMailbox() {
        return this.mailbox
    }

    getLatestMail(x = this.mailbox) {
        this.getMessages(x.address)
        return x != typeof Object ? x.messages[x.messages.length - 1] : x.messages
    }

    waitForMail(x = this.mailbox.address) {
        _retryMail(x)
            .then(m => this.mailbox.messages = m)

        return this.mailbox.messages
    }
}

module.exports = Mailbox;