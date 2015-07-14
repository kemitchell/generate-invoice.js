var billingAmount = require('@kemitchell/billing-amount')
var formatUSD = require('format-usd')
var round = require('round')
var strftime = require('strftime')

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

function shortDate(date) {
  return strftime('%B %e', new Date(date)) }

function longDate(date) {
  return strftime('%B %e, %Y', new Date(date)) }

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
        return lines
          .concat(shortDate(dateOfEntry(service)) + ':')
          .concat(
            service.narrative
            .map(capitalize)
            .map(function(string, index, array) {
              return (
                string +
                ( index === array.length - 1 ? '.' : ';' ) ) })) },
      []) }

function usd(amount) {
  return formatUSD(amount, { decimalPlaces: 0 }) }

function metadataLines(through) {
  return (
    [ '---',
      'number: ',
      'return: ',
      'client: ',
      ( 'through: ' + longDate(through) ),
      ( 'date: ' + longDate(new Date()) ),
      '---',
      '',
      '' ]
      .join('\n') ) }

function generateInvoice(from, through, projects) {
  var total = 0
  return (
    metadataLines(through)
      .concat(
        projects
          .sort(function(a, b) {
            return earliestDate(a.service) - earliestDate(b.service) })
          .reduce(
            function(output, project) {
              var amount = billingAmount(from, through, project)
              total += amount
              return output
                .concat('# ' + project.project + '\n')
                .concat(narratives(from, through, project))
                .concat('--- ' + usd(amount))
                .concat('\n') },
            [])
          .concat(
            [
              '---',
              '',
              ( '**' + usd(total) + ' for this bill; no expenses; no prior amounts due.**' ),
              ( '**--- ' + usd(total) + ' due**' ),
              '',
              '---' ]
              .join('\n'))
          .join('\n')) ) }

module.exports = generateInvoice
