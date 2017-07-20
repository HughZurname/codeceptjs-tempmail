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
        this.apiUrl = 'http://api.temp-mail.ru'
        this.domains = ["@p33.org", "@binka.me", "@doanart.com"]
        this.mailbox = {
            address: '',
            messages: []
        }
    }

    _init() {
        createMailbox()
    }

    _hashAddress = (str) => (new Promise((resolve, reject) => (
        str ? resolve(crypto.createHash('md5').update(str).digest('hex')) : reject("No string provided")
    )))

    _transformResponse = (res) => (res.json())

    _fetchTransform = (path) => (fetch(`${apiUrl}${path || ''}/format/json/`).then(_transformResponse))

    _randArr = (arr) => (arr[Math.floor(Math.random() * arr.length)])

    _randStr = () => (Math.random().toString(32).substring(2))

    _genRandomMail = () => (
        _fetchTransform('/request/domains/')
        .then(r => _randStr() + _randArr(r))
        .then(a => this.mailbox.address = a)
    )

    _genNamedMail = (str = this.mailbox.address) => (
        _fetchTransform('/request/domains/')
        .then(r => str + _randArr(r))
        .then(a => this.mailbox.address = a)
    )

    createMailbox = (name = this.mailbox.address) => (
        name ? _genNamedMail(name).then(getMessages) : _genRandomMail().then(getMessages)
    )

    deleteMessage = (m) => (
        _fetchTransform(`/request/delete/id/${m}`)
    )

    getMessages = (addr = this.mailbox.address) => (
        _hashAddress(addr)
        .then(hash => _fetchTransform(`/request/mail/id/${hash}`))
        .then(m => this.mailbox.messages = m)
    )
}

module.exports = Mailbox;