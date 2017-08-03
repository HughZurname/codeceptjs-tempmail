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