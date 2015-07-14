var markdownBill = require('./')

require('tape')(function(t) {
  t.equal(
    markdownBill(
      new Date('2015-01-01'),
      new Date('2015-01-31'),
      [ { project: 'Super Project',
          method: 'hourly',
          service: [
            { time: 1.0,
              adjustment: -0.5,
              date: '2015-01-01',
              rate: 100,
              narrative: [
                'Performed lawyer stuff' ] } ] } ]),
    [ '---',
      'number: ',
      'return: ',
      'client: ',
      'through: January 31, 2015',
      'date: July 14, 2015',
      '---',
      '',
      '# Super Project',
      '',
      'January  1:',
      'Performed lawyer stuff.',
      '--- $50',
      '',
      '',
      '---',
      '',
      '**$50 for this bill; no expenses; no prior amounts due.**',
      '**--- $50 due**',
      '',
      '---' ].join('\n'),
    'generates a simple bill')
  t.end() })
