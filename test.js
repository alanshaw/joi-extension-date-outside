const test = require('tape')
const Joi = require('joi').extend(require('./'))
const moment = require('moment')

test('Should validate successfully if date is outside range', (t) => {
  const outside = {
    from: moment().add(3, 'days').toDate(),
    to: moment().add(4, 'days').toDate()
  }

  const schema = Joi.date().outside(outside)

  const testDates = [
    moment().add(2, 'days').toDate(), // Before
    moment().add(6, 'days').toDate() // After
  ]

  t.plan(testDates.length * 2)

  testDates.forEach((date) => {
    const result = schema.validate(date)
    t.ifError(result.error, `Successfully validated ${date} is outside ${outside.from} - ${outside.to}`)
    t.equal(date.getTime(), result.value.getTime(), 'Value was correct')
  })

  t.end()
})

test('Should validate unsuccessfully if date is inside range', (t) => {
  t.plan(1)

  const outside = {
    from: moment().add(3, 'days').toDate(),
    to: moment().add(5, 'days').toDate()
  }

  const schema = Joi.date().outside(outside)

  const date = moment().add(4, 'days').toDate()
  const result = schema.validate(date)

  t.ok(result.error, 'Error between dates')
  t.end()
})

test('Should validate appropriately if date is on boundaries', (t) => {
  t.plan(6)

  const now = moment()

  const outside = {
    from: now.toDate(),
    to: now.clone().add(1, 'day').toDate()
  }

  const schema = Joi.date().outside(outside)
  let result

  result = schema.validate(now.clone().subtract(1, 'millisecond').toDate())
  t.ifError(result.error, 'No error 1 millisecond before range start')

  result = schema.validate(now.toDate())
  t.ok(result.error, 'Error 0 milliseconds before range start')

  result = schema.validate(now.clone().add(1, 'millisecond').toDate())
  t.ok(result.error, 'Error 1 millisecond after range start')

  result = schema.validate(now.clone().add(1, 'day').subtract(1, 'millisecond').toDate())
  t.ok(result.error, 'Error 1 milliseconds before range end')

  result = schema.validate(now.clone().add(1, 'day').toDate())
  t.ifError(result.error, 'No error 0 milliseconds before range end')

  result = schema.validate(now.clone().add(1, 'day').add(1, 'millisecond').toDate())
  t.ifError(result.error, 'No error 1 milliseconds after range end')

  t.end()
})

test('Should validate successfully if date is outside multiple ranges', (t) => {
  const outside = [{
    from: moment().add(3, 'days').toDate(),
    to: moment().add(4, 'days').toDate()
  }, {
    from: moment().add(8, 'days').toDate(),
    to: moment().add(16, 'days').toDate()
  }]

  const schema = Joi.date().outside(outside)

  const testDates = [
    moment().add(1, 'days').toDate(), // Before
    moment().add(7, 'days').toDate(), // Between
    moment().add(17, 'days').toDate() // After
  ]

  t.plan(testDates.length * 2)

  testDates.forEach((date) => {
    const result = schema.validate(date)
    t.ifError(result.error, `Successfully validated ${date} is outside ${outside[0].from} - ${outside[0].to} and ${outside[1].from} - ${outside[1].to}`)
    t.equal(date.getTime(), result.value.getTime(), 'Value was correct')
  })

  t.end()
})

test('Should validate successfully using refs if date is outside range', (t) => {
  const schema = Joi.object().keys({
    fromRef: Joi.date(),
    toRef: Joi.date(),
    date: Joi.date().outside({
      from: Joi.ref('fromRef'),
      to: Joi.ref('toRef')
    })
  })

  const testData = [
    {
      fromRef: moment().add(3, 'days').toDate(),
      toRef: moment().add(4, 'days').toDate(),
      date: moment().add(2, 'days').toDate()
    },
    {
      fromRef: moment().add(3, 'days').toDate(),
      toRef: moment().add(4, 'days').toDate(),
      date: moment().add(2, 'days').toDate()
    }
  ]

  t.plan(testData.length * 2)

  testData.forEach((data) => {
    const result = schema.validate(data)
    t.ifError(result.error, `Successfully validated ${data.date} is outside ${data.fromRef} - ${data.toRef}`)
    t.equal(data.date.getTime(), result.value.date.getTime(), 'Value was correct')
  })

  t.end()
})

test('Should validate unsuccessfully using refs if date is inside range', (t) => {
  t.plan(1)

  const schema = Joi.object().keys({
    fromRef: Joi.date(),
    toRef: Joi.date(),
    date: Joi.date().outside({
      from: Joi.ref('fromRef'),
      to: Joi.ref('toRef')
    })
  })

  const data = {
    fromRef: moment().add(3, 'days').toDate(),
    toRef: moment().add(5, 'days').toDate(),
    date: moment().add(4, 'days').toDate()
  }
  const result = schema.validate(data)

  t.ok(result.error, 'Error between dates')
  t.end()
})

test('Should validate unsuccessfully using refs if from ref is invalid', (t) => {
  t.plan(1)

  const schema = Joi.object().keys({
    toRef: Joi.date(),
    date: Joi.date().outside({
      from: Joi.ref('NOT_EXISTS'),
      to: Joi.ref('toRef')
    })
  })

  const data = {
    fromRef: moment().add(3, 'days').toDate(),
    toRef: moment().add(5, 'days').toDate(),
    date: moment().add(4, 'days').toDate()
  }
  const result = schema.validate(data)

  t.ok(result.error, 'From ref error')
  t.end()
})

test('Should validate unsuccessfully using refs if to ref is invalid', (t) => {
  t.plan(1)

  const schema = Joi.object().keys({
    fromRef: Joi.date(),
    date: Joi.date().outside({
      from: Joi.ref('fromRef'),
      to: Joi.ref('NOT_EXISTS')
    })
  })

  const data = {
    fromRef: moment().add(3, 'days').toDate(),
    toRef: moment().add(5, 'days').toDate(),
    date: moment().add(4, 'days').toDate()
  }
  const result = schema.validate(data)

  t.ok(result.error, 'To ref error')
  t.end()
})
