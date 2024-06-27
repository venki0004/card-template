'use strict';

const requireDir = require('require-dir');

module.exports = class Controllers {
    static init() {
        requireDir('./');
        return Promise.resolve('Success');
    }
}
