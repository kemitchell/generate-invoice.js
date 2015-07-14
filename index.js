var round = require('round')

function timeBound(service, selector, context) {
  var serviceDates = service
    .map(function(service) {
      if (service.date) {
        return Date.parse(service.date) }
      else {
        return selector.apply(
          context, 
          service.spans.map(function(span) {
            return Date.parse(span.start) })) } })
  return selector.apply(context, serviceDates) }

function earliestDate(service) {
  return timeBound(service, Math.min, Math) }

function latestDate(service) {
  return timeBound(service, Math.max, Math) }

function capitalize(narrative) {
  return narrative[0].toUpperCase() + narrative.slice(1) }

function effort(from, through, project) {
  var sortedService = project.service
    .concat() // shallow copy
    .sort(function(a, b) {
      return earliestDate([a]) - earliestDate([b]) })
  return sortedService
    .filter(function(service) {
      if (service.date) {
        return (
          Date.parse(service.date) >= from &&
          Date.parse(service.date) <= through ) }
      else {
        return (
          earliestDate(project.service) >= from &&
          latestDate(project.service) <= through ) } })
    .map(function(service) {
      return service.narrative })
    .reduce(
      function(a, b) {
        return a.concat(b) },
      [])
    .map(capitalize)
    .map(function(string, index, array) {
      return (
        string +
        ( index === array.length - 1 ? '.' : ';' ) ) }) }

var BILLING_INCREMENT = 15
var MINUTES_PER_HOUR = 60
var MILLISECONDS_PER_MINUTE = MINUTES_PER_HOUR * 1000

function add(x, y) { return x + y }
function subtract(x, y) { return x - y }
function multiply(x, y) { return x * y }
function divide(x, y) { return x / y }

function spanAmount(span) {
  return round(
    divide(subtract(span.end, span.start), MILLISECONDS_PER_MINUTE)) }

function serviceAmount(service) {
  if (service.time) {
    return round.down(multiply(entry.time, entry.rate), 1) }
  else {
    return (
      round.down(
        multiply(
          service.rate,
          divide(
            round(
              service.spans.reduce(
                function(total, span) {
                  return add(total, spanAmount(span)) },
                0),
              BILLING_INCREMENT),
            MINUTES_PER_HOUR)),
        1)) } }

function fees(from, through, project) {
  return project.service
    .map(function(service) {
      if (service.date) {
        return service }
      else {
        var copy = JSON.parse(JSON.stringify(service))
        copy.spans = copy.spans
          .map(function(span) {
            var start = Date.parse(span.start)
            span.start = ( start < from ? from : start )
            var end = Date.parse(span.end)
            span.end = ( end > through ? through : end )
            return span })
          .filter(function(span) {
            return span.end > span.start })
        return copy
      } })
    .reduce(
      function(total, service) {
        return add(total, serviceAmount(service)) },
      0) }

function generateInvoice(from, through, projects) {
  return projects
    .sort(function(a, b) {
      return earliestDate(a.service) - earliestDate(b.service) })
    .reduce(
      function(output, project) {
        return output
          .concat('# ' + project.project + '\n')
          .concat(effort(from, through, project))
          .concat('--- $' + fees(from, through, project) + '\n')
          .concat('\n') },
      [])
    .join('\n') }

module.exports = generateInvoice
