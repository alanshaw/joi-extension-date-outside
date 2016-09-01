# joi-extension-date-outside

Validate a date is outside a date range.

## Example

```js
const Joi = require('joi').extend(require('joi-extension-date-outside'))
const moment = require('moment')

const LAST_WEEK = moment().subtract(1, 'week').toDate()
const TODAY = moment().toDate()
const NEXT_WEEK = moment().add(1, 'week').toDate()
const NEXT_MONTH = moment().add(1, 'month').toDate()

const schema = Joi.date().outside({ from: LAST_WEEK, to: NEXT_WEEK })

schema.validate(TODAY) // Fail
schema.validate(NEXT_MONTH) // Success!
```

Multiple ranges:

```js
const Joi = require('joi').extend(require('joi-extension-date-outside'))
const moment = require('moment')

const LAST_YEAR = moment().subtract(1, 'year').toDate()
const LAST_WEEK = moment().subtract(1, 'week').toDate()
const TODAY = moment().toDate()
const TOMORROW = moment().add(1, 'day').toDate()
const NEXT_WEEK = moment().add(1, 'week').toDate()
const NEXT_MONTH = moment().add(1, 'month').toDate()
const NEXT_YEAR = moment().subtract(1, 'year').toDate()

const schema = Joi.date().outside([
  { from: LAST_WEEK, to: TODAY },
  { from: NEXT_WEEK, to: NEXT_MONTH }
])

schema.validate(LAST_WEEK) // Fail
schema.validate(NEXT_WEEK) // Fail
schema.validate(LAST_YEAR) // Success!
schema.validate(TOMORROW) // Success!
schema.validate(NEXT_YEAR) // Success!
```

Using refs:

```js
const Joi = require('joi').extend(require('joi-extension-date-outside'))
const moment = require('moment')

const LAST_WEEK = moment().subtract(1, 'week').toDate()
const TODAY = moment().toDate()
const NEXT_WEEK = moment().add(1, 'week').toDate()
const NEXT_MONTH = moment().add(1, 'month').toDate()

const schema = Joi.object().keys({
  fromRef: Joi.date(),
  toRef: Joi.date(),
  date: Joi.date().outside({
    from: Joi.ref('fromRef'),
    to: Joi.ref('toRef')
  })
})

schema.validate({
  fromRef: LAST_WEEK,
  toRef: NEXT_WEEK,
  date: TODAY
}) // Fail

schema.validate({
  fromRef: LAST_WEEK,
  toRef: NEXT_WEEK,
  date: NEXT_MONTH
}) // Success!
```

---

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
