var billingAmount = require('@kemitchell/billing-amount')
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

function generateInvoice(from, through, projects) {
  return projects
    .sort(function(a, b) {
      return earliestDate(a.service) - earliestDate(b.service) })
    .reduce(
      function(output, project) {
        return output
          .concat('# ' + project.project + '\n')
          .concat(narratives(from, through, project))
          .concat('--- $' + billingAmount(from, through, project) + '\n')
          .concat('\n') },
      [])
    .join('\n') }

module.exports = generateInvoice
