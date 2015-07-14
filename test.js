/*
 * Copyright 2015 Kyle E. Mitchell
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

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
