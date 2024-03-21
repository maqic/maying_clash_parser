const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('yaml');

const parse = require('../index').parse;
const raw = fs.readFileSync(path.join(__dirname, './raw.yaml'), 'utf8');

parse(raw, {
    axios,
    yaml,
    notify: console.log,
    console,
}, {
    name: 'test',
    url: 'https://example.com',
    interval: 60,
    selected: true,
}).then(res => {
    console.log(res);
    fs.writeFileSync(path.join(__dirname, './parsed.yaml'), res);
}).catch(err => {
    console.error(err);
})