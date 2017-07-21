const crypto = require('crypto');
const fetch = require('node-fetch');

const apiUrl = 'http://api.temp-mail.ru'

const _hashAddress = (str) => (new Promise((resolve, reject) => (
    str ? resolve(crypto.createHash('md5').update(str).digest('hex')) : reject("No string provided")
)))

const _transformResponse = (res) => (res.json())

const _fetchTransform = (path) => (fetch(`${apiUrl}${path || ''}/format/json/`).then(_transformResponse))

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

    _init() {
        this.createMailbox(null)
    }

    createMailbox(x) {
        return _createAddress(x).then(a => this.mailbox.address = a)
            .then(_getMessages)
            .then(m => this.mailbox.messages = m)
    }

    deleteMessage(x) {
        return _deleteMessage(x)
    }

    getMessages(x = this.mailbox.address) {
        return _getMessages(x).then(r => console.log(r))
            .then(m => this.mailbox.messages = m)
    }

    getMailbox() {
        console.log(this.mailbox)
        return this.mailbox
    }

    getLatestMail(m = this.mailbox.messages) {
        console.log(m)
        return m != typeof Object ? m[m.length] : m.error
    }
}

module.exports = Mailbox;