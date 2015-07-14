var billingAmount = require('@kemitchell/billing-amount')
var formatUSD = require('format-usd')
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

function capitalize(narrative) {
  return narrative.charAt(0).toUpperCase() + narrative.slice(1) }

function narratives(from, through, project) {
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
        return service.spans
          .some(function(span) {
            var start = Date.parse(span.start)
            return ( start >= from && start <= through ) }) } })
    .reduce(
      function(lines, service) {
        return lines.concat(service.narrative) },
      [])
    .map(capitalize)
    .map(function(string, index, array) {
      return (
        string +
        ( index === array.length - 1 ? '.' : ';' ) ) }) }

function usd(amount) {
  return formatUSD(amount, { decimalPlaces: 0 }) }

function generateInvoice(from, through, projects) {
  return projects
    .sort(function(a, b) {
      return earliestDate(a.service) - earliestDate(b.service) })
    .reduce(
      function(output, project) {
        return output
          .concat('# ' + project.project + '\n')
          .concat(narratives(from, through, project))
          .concat('--- ' + usd(billingAmount(from, through, project)))
          .concat('\n') },
      [])
    .join('\n') }

module.exports = generateInvoice
