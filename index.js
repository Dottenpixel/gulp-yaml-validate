'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var jsyaml = require('js-yaml');
var extend = require('extend');
var BufferStreams = require('bufferstreams');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var through__default = /*#__PURE__*/_interopDefaultLegacy(through);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var gutil__default = /*#__PURE__*/_interopDefaultLegacy(gutil);
var jsyaml__default = /*#__PURE__*/_interopDefaultLegacy(jsyaml);
var extend__default = /*#__PURE__*/_interopDefaultLegacy(extend);
var BufferStreams__default = /*#__PURE__*/_interopDefaultLegacy(BufferStreams);

const PLUGIN_NAME = 'gulp-yaml-validate';

const yaml2json = (buffer, options) => {
    const htmlRe = /(<([^>]+)>)/ig;
    let contents = buffer.toString('utf8');
    if(options.html && htmlRe.test(contents)) {
      throw new Error('YML cannot contain HTML');
    } else {
      let ymlDocument = options.safe ? jsyaml__default['default'].safeLoad(contents) : jsyaml__default['default'].load(contents);
      return new Buffer(JSON.stringify(ymlDocument, options.replacer, options.space));
    }
};

module.exports = function(options) {
  var options = extend__default['default']({
    safe: false,
    html: false,
    replacer: null,
    space: null
  }, options);

  return through__default['default'].obj(function(file, enc, cb) {
    const self = this;
    if (file.isBuffer()) {
      if (file.contents.length === 0) {
        let msg = `File ${path__default['default'].dirname(file.path)} is empty`;
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
        return cb();
      }
      try {
        file.contents = yaml2json(file.contents, options);
        file.path = gutil__default['default'].replaceExtension(file.path, '.json');
      }
      catch (error) {
        let msg = `${error.message} => ${file.path}`;
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
        return cb();
      }
    }
    else if (file.isStream()) {
      file.contents = file.contents.pipe(new BufferStreams__default['default']((err, buf, cb) => {
        if (err) {
          self.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
        }
        else {
          if (buf.length === 0) {
            let msg = `File ${path__default['default'].dirname(file.path)} is empty`;
            let error = new gutil.PluginError(PLUGIN_NAME, msg);
            self.emit('error', error);
            cb(error);
          }
          else {
            try {
              file.path = gutil__default['default'].replaceExtension(file.path, '.json');
              cb(null, yaml2json(buf, options));
            }
            catch (error) {
              let msg = `${error.message} => ${file.path}`;
              self.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
              cb(error);
            }
          }
        }
      }));
    }
    this.push(file);
    cb();
  });
};
