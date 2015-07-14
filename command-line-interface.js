#!/usr/bin/env node
var markdownBill = require('./')
var JSONStream = require('JSONStream')

if (process.argv.length < 4) {
  console.error('Usage: <from> <to>');
  process.exit(1) }

var from = Date.parse(process.argv[2])
var through = Date.parse(process.argv[3])

var projects = []

process.stdin
  .pipe(JSONStream.parse())
  .on('data', function(chunk) {
    if (chunk) {
      projects.push(chunk) } })
  .on('end', function() {
    console.log(markdownBill(from, through, projects)) })
