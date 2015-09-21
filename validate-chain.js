/**
 * validator util to make form validation chainable for both serverside and clientside
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (name, definition) {
	if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		module.exports = definition();
	} else if (typeof define === 'function' && typeof define.amd === 'object') {
		define(definition);
	} else {
		this[name] = definition();
	}
})('VC', function () {

	var vv = require("validator");

	var regx = {
		phone: /^(\+?0?86\-?)?1[345789]\d{9}$/,
		// email: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
		// creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
		objectId: /^[0-9a-fA-F]{24}$/,
		alpha: /^[A-Z]+$/i,
		alphanumeric: /^[0-9A-Z]+$/i,
		numeric: /^[-+]?[0-9]+$/,
		int: /^(?:[-+]?(?:0|[1-9][0-9]*))$/,
		float: /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/,
		hexadecimal: /^[0-9A-F]+$/i,
		hexcolor: /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i,
		ascii: /^[\x00-\x7F]+$/,
		base64: /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i
	};

	var Validator = (function () {
		function Validator(target, isUpdate) {
			_classCallCheck(this, Validator);

			this.key = null; // temporarily store field name
			this._errs = [];
			this._san = {}; // sanitized object
			this._alias = {}; // key: 中文名
			this.opt = isUpdate ? true : false;
			this.target = target;
		}

		// end of class

		_createClass(Validator, [{
			key: 'addError',
			value: function addError(msg) {
				if (this._san[this.key]) delete this._san[this.key];

				var alias = this._alias[this.key];
				if (alias) {
					msg = alias + ": " + msg.replace(/\S+\:\s/, "");
				}

				this._errs.push(msg);
				// this.next = false;
			}

			/**
    * set alias for a key and store them in a map: this._alias = {}
    * @param  {[type]} name [description]
    * @return {[type]}      [description]
    */
		}, {
			key: 'alias',
			value: function alias(name) {
				if (!this.key) {
					this.next = false;
					return this;
				}
				this._alias[this.key] = name;
				return this;
			}

			// ----------------- start a validation chain with this method -----
		}, {
			key: 'check',
			value: function check(key) {
				this.key = key;
				this.next = true;
				this.opt = false;
				if (this.target[key] !== undefined) {
					this._san[key] = this.target[key];
				} else {
					this.opt = true;
				}

				return this;
			}

			// ----------------- must in the beginning of the chain --------
		}, {
			key: 'required',
			value: function required(tip) {
				if (!this.next) return this;
				this.opt = false;
				if (!this.target[this.key]) {
					this.addError(tip || this.key + ': 为必填字段');
					this.next = false;
				}
				return this;
			}
		}, {
			key: 'optional',
			value: function optional() {
				if (!this.next) return this;
				this.opt = true;
				return this;
			}

			// ----------------- property validate methods ------------------
		}, {
			key: 'between',
			value: function between(min, max, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				var type = typeof val;
				if (type === "string" && (val.length > max || val.lenth < min)) {
					this.addError(tip || this.key + ': 长度应该在' + min + '-' + max + '个字符之间');
				} else if (type === "number" && (val > max || val < min)) {
					this.addError(tip || this.key + ': 大小应该在' + min + '-' + max + '之间');
				}
				return this;
			}
		}, {
			key: 'max',
			value: function max(num, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				var type = typeof val;
				if (type === "string" && val.length > num) {
					this.addError(tip || this.key + ': 最多' + num + '个字符');
				} else if (type === "number" && val > num) {
					this.addError(tip || this.key + ': 最大值为' + num);
				}
				return this;
			}
		}, {
			key: 'min',
			value: function min(num, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				var type = typeof val;
				if (type === "string" && val.length < num) {
					this.addError(tip || this.key + ': 最少' + num + '个字符');
				} else if (type === "number" && val < num) {
					this.addError(tip || this.key + ': 最小值为' + num);
				}

				return this;
			}
		}, {
			key: 'regx',
			value: function regx(pattern, tip, modifiers) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;
				if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
					pattern = new RegExp(pattern, modifiers);
				}
				if (!pattern.test(val)) {
					this.addError(tip || this.key + ': 不合格' + pattern.toString() + '的格式');
				}

				return this;
			}
		}, {
			key: 'date',
			value: function date(tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isDate(val)) {
					this.addError(tip || this.key + ': ' + val + '不符合日期格式');
				}

				return this;
			}
		}, {
			key: 'before',
			value: function before(time, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (vv.isBefore(val, time)) {
					this.addError(tip || this.key + ': ' + val + '需要在' + time + '之前');
				}

				return this;
			}
		}, {
			key: 'after',
			value: function after(time, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isAfter(val, time)) {
					this.addError(tip || this.key + ': ' + val + '需要在' + time + '之后');
				}
				return this;
			}
		}, {
			key: 'in',
			value: function _in(values, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isIn(val, values)) {
					this.addError(tip || this.key + ': ' + val + '需要在[' + values.toString() + ']之中');
				}
				return this;
			}
		}, {
			key: 'email',
			value: function email(tip, options) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isEmail(val, options)) {
					this.addError(tip || this.key + ': ' + val + '不是常规的email');
				}

				return this;
			}
		}, {
			key: 'JSON',
			value: function JSON(tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isJSON(val)) {
					this.addError(tip || this.key + ': ' + val + '不是JSON格式字符串');
				}
				return this;
			}
		}, {
			key: 'URL',
			value: function URL(tip, options) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isURL(val, options)) {
					this.addError(tip || this.key + ': ' + val + '不符合URL的格式');
				}
				return this;
			}
		}, {
			key: 'phone',
			value: function phone(tip) {
				return this.regx(regx.phone, tip || this.key + ': ' + this.target[this.key] + '不是常规的手机号码');
			}
		}, {
			key: 'numeric',
			value: function numeric(tip) {
				return this.regx(regx.numeric, tip || this.key + ': ' + this.target[this.key] + '必须为纯数字');
			}
		}, {
			key: 'float',
			value: function float(tip) {
				return this.regx(regx.numeric, tip || this.key + ': ' + this.target[this.key] + '必须为float格式数字');
			}
		}, {
			key: 'hex',
			value: function hex(tip) {
				return this.regx(regx.hexadecimal, tip || this.key + ': ' + this.target[this.key] + '必须为16进制数字');
			}
		}, {
			key: 'alpha',
			value: function alpha(tip) {
				return this.regx(regx.alpha, tip || this.key + ': ' + this.target[this.key] + '必须为纯字母');
			}
		}, {
			key: 'alphanumeric',
			value: function alphanumeric(tip) {
				return this.regx(regx.alphanumeric, tip || this.key + ': ' + this.target[this.key] + '必须为纯字母和数字的组合');
			}
		}, {
			key: 'ascii',
			value: function ascii(tip) {
				return this.regx(regx.ascii, tip || this.key + ': ' + this.target[this.key] + '必须为符合规范的ASCII码');
			}
		}, {
			key: 'objectId',
			value: function objectId(tip) {
				return this.regx(regx.objectId, tip || this.target[this.key] + '不是常规的ObjectId');
			}
		}, {
			key: 'base64',
			value: function base64(tip) {
				return this.regx(regx.base64, tip || this.key + ': ' + this.target[this.key] + '必须为符合规范的Base64编码');
			}
		}, {
			key: 'creditCard',
			value: function creditCard(tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isCreditCard(val)) {
					this.addError(tip || this.key + ': ' + val + '不符合信用卡的格式');
				}
				return this;
			}
		}, {
			key: 'currency',
			value: function currency(options, tip) {
				if (!this.next) return this;
				var val = this.target[this.key];
				if (this.opt && !val) return this;

				if (!vv.isCreditCard(val)) {
					this.addError(tip || this.key + ': ' + val + '不符合信用卡的格式');
				}
				return this;
			}

			// Currency(tip, options)

			// ----------------- sanitizers ---------------
		}, {
			key: 'trim',
			value: function trim() {}
		}, {
			key: 'errors',
			get: function get() {
				return this._errs;
			}
		}, {
			key: 'sanitized',
			get: function get() {
				return this._san;
			}
		}]);

		return Validator;
	})();

	return Validator;
});