var billingAmount = require('@kemitchell/billing-amount')
var formatUSD = require('format-usd')
var round = require('round')

function min(array) {
  return Math.min.apply(Math, array) }

function earliestDate(service) {
  return min(service.map(dateOfEntry)) }

function capitalize(narrative) {
  return (
    narrative.charAt(0).toUpperCase() +
    narrative.slice(1) ) }

function dateOfEntry(entry) {
  if (entry.date) {
    return Date.parse(entry.date) }
  else {
    return min(
      entry.spans
        .map(function(span) {
          return Date.parse(span.start) })) } }

function narratives(from, through, project) {
  return project.service
    .concat() // shallow copy
    .filter(function(entry) {
      var date = dateOfEntry(entry)
      return ( date >= from && date <= through ) })
    .sort(function(a, b) {
      return dateOfEntry(a) - dateOfEntry(b) })
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
