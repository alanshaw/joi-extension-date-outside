var Joi = require('joi')
var Hoek = require('hoek')

var range = Joi.object().keys({ from: Joi.any().required(), to: Joi.any().required() })
var arrayOfRange = Joi.array().items(range).min(1)

var outsideRule = {
  name: 'outside',
  params: {
    ranges: Joi.alternatives().try(range, arrayOfRange).required()
  },

  validate: function (params, value, state, options) {
    var ranges = [].concat(params.ranges)

    for (var i = 0; i < ranges.length; i++) {
      var from = ranges[i].from

      if (Joi.isRef(from)) {
        from = Hoek.reach(state.parent, from.key)

        if (typeof from === 'undefined') {
          return this.createError('date.outsideRefError', {}, state, options)
        }
      }

      var to = ranges[i].to

      if (Joi.isRef(to)) {
        to = Hoek.reach(state.parent, to.key)

        if (typeof to === 'undefined') {
          return this.createError('date.outsideRefError', {}, state, options)
        }
      }

      var valueMs = value.getTime()

      if (valueMs >= from.getTime() && valueMs < to.getTime()) {
        return this.createError('date.outside', { v: value, from: from, to: to }, state, options)
      }
    }

    return value
  }
}

var extension = {
  base: Joi.date(),
  name: 'date',
  language: {
    outside: 'must be outside {{from}} and {{to}}',
    outsideRefError: 'invalid Joi.ref in schema'
  },
  rules: [outsideRule]
}

module.exports = extension
