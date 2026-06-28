const timeZones = [
    {
        abbreviation: 'GMT',
        label: '(GMT) Casablanca',
    },
    {
        abbreviation: 'UTC',
        label: '(GMT) Coordinated Universal Time',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT) Monrovia, Reykjavik',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Abidjan',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Accra',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Bamako, Timbuktu',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Banjul',
    },
    {
        abbreviation: 'MST',
        label: '(GMT+00:00) Behchoko, Fort Smith, Hay River, Yellowknife',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Bissau',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Conakry',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Dakar',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Freetown',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Lome',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Monrovia',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Nouakchott',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Ouagadougou',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Ramsey, Douglas',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) Reykjavik',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+00:00) São Tomé and Príncipe',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Algiers',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Bangui',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Brazzaville',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Cotonou',
    },
    {
        abbreviation: 'IST',
        label: '(GMT+01:00) Dublin',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Kananga, Kolwezi, Lubumbashi, Mbuji-Mayi, Kinshasa',
    },
    {
        abbreviation: 'WEST',
        label: '(GMT+01:00) Laayoune',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Lagos, Kano',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Libreville',
    },
    {
        abbreviation: 'WEST',
        label: '(GMT+01:00) Lisbon, Ponta Delgada, Funchal',
    },
    {
        abbreviation: 'BST',
        label: '(GMT+01:00) London, Belfast, Birmingham, Cardiff, Edinburgh, Glasgow, Manchester',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Luanda',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Malabo',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) N`Djamena',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Niamey',
    },
    {
        abbreviation: 'WEST',
        label: '(GMT+01:00) Rabat, Casablanca, Tangier',
    },
    {
        abbreviation: 'GMT',
        label: '(GMT+01:00) Saint Peter Port',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb',
    },
    {
        abbreviation: 'WET',
        label: '(GMT+01:00) Thorshavn',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+01:00) Tunis',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) West Central Africa',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+01:00) Windhoek',
    },
    {
        abbreviation: 'WAT',
        label: '(GMT+01:00) Yaounde',
    },
    {
        abbreviation: 'EET',
        label: '(GMT+02:00) Amman',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Amsterdam, Rotterdam, The Hague',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Andorra la Vella',
    },
    {
        abbreviation: 'EET',
        label: '(GMT+02:00) Athens, Bucharest, Istanbul',
    },
    {
        abbreviation: 'EET',
        label: '(GMT+02:00) Beirut',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Belgrade',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Berlin, Hamburg, Munich, Cologne, Frankfurt, Bonn',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Bratislava',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Brussels',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Budapest',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Bujumbura',
    },
    {
        abbreviation: 'EET',
        label: '(GMT+02:00) Cairo',
    },
    {
        abbreviation: 'SAST',
        label: '(GMT+02:00) Cape Town, Johannesburg, Pretoria',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Copenhagen',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Gaborone',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Gibraltar',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Harare, Pretoria',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
    },
    {
        abbreviation: 'IST',
        label: '(GMT+02:00) Jerusalem',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Kigali',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Lilongwe',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Ljubljana',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Lusaka',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Luxembourg',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Maputo',
    },
    {
        abbreviation: 'SAST',
        label: '(GMT+02:00) Maseru',
    },
    {
        abbreviation: 'SAST',
        label: '(GMT+02:00) Mbabane',
    },
    {
        abbreviation: 'MSK',
        label: '(GMT+02:00) Minsk',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Monaco',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Oslo',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Paris, Marseille, Lyon, Toulouse, Nice',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Podgorica',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Prague',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Rome, Milan',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) San Mario',
    },
    {
        abbreviation: 'WEST',
        label: '(GMT+02:00) Santa Cruz de Tenerife',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Sarajevo',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Skopje',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Stockholm',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Tirane',
    },
    {
        abbreviation: 'EET',
        label: '(GMT+02:00) Tripoli',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Vaduz',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Valletta',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Vienna, Salzburg',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Warsaw, Krakow',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+02:00) Windhoek',
    },
    {
        abbreviation: 'CET',
        label: '(GMT+02:00) Zagreb',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+02:00) Zurich, Bern, Geneva',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Addis Ababa',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Amman',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Antananarivo',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Asmara',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Athens',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Baghdad',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Beirut',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Bucharest',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Chisinau',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Damascus',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Dar es Salaam',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Djibouti',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Doha',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Gaza, Ramallah, Hebron',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Helsinki',
    },
    {
        abbreviation: 'TRT',
        label: '(GMT+03:00) Istanbul, Ankara',
    },
    {
        abbreviation: 'IDT',
        label: '(GMT+03:00) Jerusalem, Tel Aviv',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Kampala',
    },
    {
        abbreviation: 'CAT',
        label: '(GMT+03:00) Khartoum',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Kiev, Odessa',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Kuwait, Riyadh',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Manama',
    },
    {
        abbreviation: 'MSK',
        label: '(GMT+03:00) Minsk',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Mogadishu',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Moroni',
    },
    {
        abbreviation: 'MSK',
        label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd',
    },
    {
        abbreviation: 'EAT',
        label: '(GMT+03:00) Nairobi',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Nicosia',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Riga',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Riyadh, Mecca',
    },
    {
        abbreviation: 'AST',
        label: '(GMT+03:00) Sanaa, Aden',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Sofia',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Tallinn',
    },
    {
        abbreviation: 'CEST',
        label: '(GMT+03:00) Vatican City',
    },
    {
        abbreviation: 'EEST',
        label: '(GMT+03:00) Vilnius',
    },
    {
        abbreviation: 'IRST',
        label: '(GMT+03:30) Tehran',
    },
    {
        abbreviation: 'GST',
        label: '(GMT+04:00) Abu Dhabi, Muscat',
    },
    {
        abbreviation: 'AZT',
        label: '(GMT+04:00) Baku',
    },
    {
        abbreviation: 'MSK',
        label: '(GMT+04:00) Maykop, Gorno-Altaisk, Barnaul, Blagoveshchensk, Arkhangelsk, Astrakhan,',
    },
    {
        abbreviation: 'GST',
        label: '(GMT+04:00) Muscat',
    },
    {
        abbreviation: 'MUT',
        label: '(GMT+04:00) Port Louis',
    },
    {
        abbreviation: 'RET',
        label: '(GMT+04:00) Réunion',
    },
    {
        abbreviation: 'GET',
        label: '(GMT+04:00) Tbilisi',
    },
    {
        abbreviation: 'SCT',
        label: '(GMT+04:00) Victoria',
    },
    {
        abbreviation: 'AMT',
        label: '(GMT+04:00) Yerevan',
    },
    {
        abbreviation: 'AFT',
        label: '(GMT+04:30) Kabul',
    },
    {
        abbreviation: 'IRST',
        label: '(GMT+04:30) Tehran',
    },
    {
        abbreviation: 'TMT',
        label: '(GMT+05:00) Ashgabat',
    },
    {
        abbreviation: 'AZT',
        label: '(GMT+05:00) Baku',
    },
    {
        abbreviation: 'TJT',
        label: '(GMT+05:00) Dushanbe',
    },
    {
        abbreviation: 'YEKT',
        label: '(GMT+05:00) Ekaterinburg',
    },
    {
        abbreviation: 'PKT',
        label: '(GMT+05:00) Islamabad, Karachi',
    },
    {
        abbreviation: 'MVT',
        label: '(GMT+05:00) Male',
    },
    {
        abbreviation: 'UZT',
        label: '(GMT+05:00) Tashkent',
    },
    {
        abbreviation: 'IST',
        label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
    },
    {
        abbreviation: 'SLST',
        label: '(GMT+05:30) Colombo',
    },
    {
        abbreviation: 'SLST',
        label: '(GMT+05:30) Sri Jayawardenepura',
    },
    {
        abbreviation: 'NPT',
        label: '(GMT+05:45) Kathmandu',
    },
    {
        abbreviation: 'ALMT',
        label: '(GMT+06:00) Astana, Almaty, Qostanay, Qyzylorda Aktobe, Aktau, Atyrau, Oral',
    },
    {
        abbreviation: 'BST',
        label: '(GMT+06:00) Astana, Dhaka',
    },
    {
        abbreviation: 'KGT',
        label: '(GMT+06:00) Bishkek',
    },
    {
        abbreviation: 'BST',
        label: '(GMT+06:00) Dhaka',
    },
    {
        abbreviation: 'NOVT',
        label: '(GMT+06:00) Novosibirsk',
    },
    {
        abbreviation: 'BTT',
        label: '(GMT+06:00) Thimphu',
    },
    {
        abbreviation: 'MMT',
        label: '(GMT+06:30) Rangoon',
    },
    {
        abbreviation: 'MMT',
        label: '(GMT+06:30) Yangon (Rangoon)',
    },
    {
        abbreviation: 'ICT',
        label: '(GMT+07:00) Bangkok, Hanoi, Jakarta',
    },
    {
        abbreviation: 'WIB',
        label: '(GMT+07:00) Batam, Palembang, Medan',
    },
    {
        abbreviation: 'ICT',
        label: '(GMT+07:00) Hanoi, Ho Chi Minh City',
    },
    {
        abbreviation: 'KRAT',
        label: '(GMT+07:00) Krasnoyarsk',
    },
    {
        abbreviation: 'ICT',
        label: '(GMT+07:00) Phnom Penh',
    },
    {
        abbreviation: 'ICT',
        label: '(GMT+07:00) Vientiane',
    },
    {
        abbreviation: 'BNT',
        label: '(GMT+08:00) Bandar Seri Begawan',
    },
    {
        abbreviation: 'CST',
        label: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi',
    },
    {
        abbreviation: 'IRKT',
        label: '(GMT+08:00) Irkutsk',
    },
    {
        abbreviation: 'SGT',
        label: '(GMT+08:00) Kuala Lumpur, Singapore',
    },
    {
        abbreviation: 'CST',
        label: '(GMT+08:00) Macao',
    },
    {
        abbreviation: 'WITA',
        label: '(GMT+08:00) Makassar, Manado, Gorontalo',
    },
    {
        abbreviation: 'PHT',
        label: '(GMT+08:00) Manila',
    },
    {
        abbreviation: 'AWST',
        label: '(GMT+08:00) Perth',
    },
    {
        abbreviation: 'CST',
        label: '(GMT+08:00) Taipei',
    },
    {
        abbreviation: 'ULAT',
        label: '(GMT+08:00) Ulaanbaatar',
    },
    {
        abbreviation: 'WIT',
        label: '(GMT+09:00) Ambon, Maluku, Ternate City, Tidore',
    },
    {
        abbreviation: 'TLT',
        label: '(GMT+09:00) Dili',
    },
    {
        abbreviation: 'PWT',
        label: '(GMT+09:00) Koror',
    },
    {
        abbreviation: 'JST',
        label: '(GMT+09:00) Osaka, Sapporo, Tokyo',
    },
    {
        abbreviation: 'KST',
        label: '(GMT+09:00) Pyongyang',
    },
    {
        abbreviation: 'KST',
        label: '(GMT+09:00) Seoul',
    },
    {
        abbreviation: 'JST',
        label: '(GMT+09:00) Tokyo, Kyoto, Osaka, Yokohama',
    },
    {
        abbreviation: 'YAKT',
        label: '(GMT+09:00) Yakutsk',
    },
    {
        abbreviation: 'ACST',
        label: '(GMT+09:30) Adelaide',
    },
    {
        abbreviation: 'ACST',
        label: '(GMT+09:30) Alice Springs, Darwin',
    },
    {
        abbreviation: 'ACST',
        label: '(GMT+09:30) Darwin',
    },
    {
        abbreviation: 'AEST',
        label: '(GMT+10:00) Brisbane',
    },
    {
        abbreviation: 'AEST',
        label: '(GMT+10:00) Canberra, Melbourne, Sydney',
    },
    {
        abbreviation: 'ChST',
        label: '(GMT+10:00) Guam, Port Moresby',
    },
    {
        abbreviation: 'ChST',
        label: '(GMT+10:00) Hagåtña',
    },
    {
        abbreviation: 'AEDT',
        label: '(GMT+10:00) Hobart',
    },
    {
        abbreviation: 'PGT',
        label: '(GMT+10:00) Port Moresby',
    },
    {
        abbreviation: 'AEST',
        label: '(GMT+10:00) Sydney, Melbourne, Brisbane, Townsville',
    },
    {
        abbreviation: 'VLAT',
        label: '(GMT+10:00) Vladivostok',
    },
    {
        abbreviation: 'SBT',
        label: '(GMT+11:00) Honiara',
    },
    {
        abbreviation: 'MAGT',
        label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia',
    },
    {
        abbreviation: 'NCT',
        label: '(GMT+11:00) Nouméa',
    },
    {
        abbreviation: 'VUT',
        label: '(GMT+11:00) Port-Vila',
    },
    {
        abbreviation: 'NZST',
        label: '(GMT+12:00) Auckland, Wellington',
    },
    {
        abbreviation: 'NZST',
        label: '(GMT+12:00) Auckland, Wellington',
    },
    {
        abbreviation: 'FJT',
        label: '(GMT+12:00) Fiji, Marshall Is.',
    },
    {
        abbreviation: 'TVT',
        label: '(GMT+12:00) Funafuti',
    },
    {
        abbreviation: 'MHT',
        label: '(GMT+12:00) Majuro',
    },
    {
        abbreviation: 'PETT',
        label: '(GMT+12:00) Petropavlovsk-Kamchatsky',
    },
    {
        abbreviation: 'FJT',
        label: '(GMT+12:00) Suva',
    },
    {
        abbreviation: 'GILT',
        label: '(GMT+12:00) Tarawa, Betio village',
    },
    {
        abbreviation: 'NRT',
        label: '(GMT+12:00) Yaren',
    },
    {
        abbreviation: 'WSST',
        label: '(GMT+13:00) Apia',
    },
    {
        abbreviation: 'PHOT',
        label: '(GMT+13:00) Kanton',
    },
    {
        abbreviation: 'TOT',
        label: "(GMT+13:00) Nuku'alofa",
    },
    {
        abbreviation: 'TOT',
        label: '(GMT+13:00) Nuku`alofa',
    },
    {
        abbreviation: 'LINT',
        label: '(GMT+14:00) Kiritimati',
    },
    {
        abbreviation: 'AZOT',
        label: '(GMT-01:00) Azores',
    },
    {
        abbreviation: 'CVT',
        label: '(GMT-01:00) Cape Verde Is.',
    },
    {
        abbreviation: 'CVT',
        label: '(GMT-01:00) Praia, Cape Verdean, Sao Vicente',
    },
    {
        abbreviation: 'GST',
        label: '(GMT-02:00) Mid-Atlantic',
    },
    {
        abbreviation: 'WGST',
        label: '(GMT-02:00) Nuuk, Scoresbysund, Constable Pynt, Thule',
    },
    {
        abbreviation: 'NST',
        label: '(GMT-02:30) Carbonear, Mount Pearl, Conception Bay South',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-03:00) Amherst, Truro, Annapolis Royal',
    },
    {
        abbreviation: 'BRT',
        label: '(GMT-03:00) Brasilia',
    },
    {
        abbreviation: 'ART',
        label: '(GMT-03:00) Buenos Aires',
    },
    {
        abbreviation: 'GFT',
        label: '(GMT-03:00) Cayenne',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-03:00) Charlottetown, Summerside',
    },
    {
        abbreviation: 'WGT',
        label: '(GMT-03:00) Greenland',
    },
    {
        abbreviation: 'ADT',
        label: '(GMT-03:00) Hamilton',
    },
    {
        abbreviation: 'UYT',
        label: '(GMT-03:00) Montevideo',
    },
    {
        abbreviation: 'SRT',
        label: '(GMT-03:00) Paramaribo',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-03:00) Saint John, Moncton, Fredericton',
    },
    {
        abbreviation: 'BRT',
        label: '(GMT-03:00) São Paulo, Rio de Janeiro, Belo Horizonte',
    },
    {
        abbreviation: 'NST',
        label: '(GMT-03:30) Newfoundland',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Atlanta, Columbus, Savannah , Macon, Albany',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Wilmington, Dover',
    },
    {
        abbreviation: 'BOT',
        label: '(GMT-04:00) a Paz, Santa Cruz, Cochabamba',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Albany, New York City, Buffalo, Rochester, Yonkers, Syracuse',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Anderson, Attica, Auburn',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Annapolis, Baltimore',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Ashland, Middlesboro, London',
    },
    {
        abbreviation: 'PYT',
        label: '(GMT-04:00) Asuncion',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Atlantic Time (Canada)',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Augusta, Portland, Lewiston, Bangor',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Basseterre',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Boston, Worcester, Springfield , Lowell, New Bedford, Cambridge , Brockton',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Bridgeport, Hartford, New Haven',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Bridgetown',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Castries',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Charleston is the capital and largest city; Huntington is the second largest city',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Columbia, Charleston, Greenville',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Columbus, Cleveland, Cincinnati, Toledo, Akron',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Concord, Manchester, Nashua, Portsmouth',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Crocus Hill',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Fort-de-France',
    },
    {
        abbreviation: 'GYT',
        label: '(GMT-04:00) Georgetown',
    },
    {
        abbreviation: 'BOT',
        label: '(GMT-04:00) Georgetown, La Paz, San Juan',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Harrisburg, Philadelphia, Pittsburgh',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-04:00) Havana',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Iqaluit',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Kingstown',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Lansing, Detroit, Grand Rapids , Sterling Heights , Warren , Flint, Ann Arbor',
    },
    {
        abbreviation: 'AMT',
        label: '(GMT-04:00) Manaus',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Montpelier, Burlington',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Montreal, Quebec City',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Montserrat',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-04:00) Nashville, Memphis',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-04:00) Nassau',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Newark, Jersey City',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Oranjestad',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Pointe-à-Pitre',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Port-au-Prince',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Port-of-Spain',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Providence, Warwick, Cranston, Pawtucket, Newport',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Raleigh, Charlotte, Greensboro, Winston-Salem, Asheville',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Richmond, Virginia Beach, Norfolk, Newport News, Chesapeake, Hampton',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Roseau',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Saint George`s',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) San Juan',
    },
    {
        abbreviation: 'CLT',
        label: '(GMT-04:00) Santiago',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) Santo Domingo',
    },
    {
        abbreviation: 'AST',
        label: '(GMT-04:00) St Croix, Charlotte Amalie, Cruz Bay',
    },
    {
        abbreviation: 'NDT',
        label: '(GMT-04:00) St. John`s',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Tallahassee, Jacksonville, Miami, Tampa, Saint Petersburg, Hialeah, Orlando',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Toronto, Dryden',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Trenton, Newark',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Turks and Caicos',
    },
    {
        abbreviation: 'EDT',
        label: '(GMT-04:00) Washington',
    },
    {
        abbreviation: 'VET',
        label: '(GMT-04:30) Caracas',
    },
    {
        abbreviation: 'VET',
        label: '(GMT-04:30) Caracas',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-05:00) Aguascalientes,San Felipe, San Vicente ,Ensenada, Mexicali, Tijuana, San Lucas',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Ashland, Bowling Green, Campbellsville, Covington',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Austin, Houston, Dallas, San Antonio',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Baton Rouge, Shreveport, Lake Charles, Kenner, and Lafayette',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Bismarck, North Dakota, Fargo',
    },
    {
        abbreviation: 'COT',
        label: '(GMT-05:00) Bogota, Lima, Quito',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Brandon, Dauphin, Flin Flon',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Chesterton, Crown Point, Dyer, East Chicago',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Chipley, Pensacola, Shalimar, Valparaiso',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Des Moines, Cedar Rapids, Davenport, Sioux City',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-05:00) Eastern Time (US & Canada)',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-05:00) George Town',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-05:00) Indiana (East)',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Jackson, Biloxi, Greenville, Hattiesburg, Meridian',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Jefferson City, Kansas City , Saint Louis , Springfield, Independence',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-05:00) Kingston',
    },
    {
        abbreviation: 'PET',
        label: '(GMT-05:00) Lima',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Lincoln, Omaha',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Little Rock',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Madison, Milwaukee,Green Bay, Racine',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Montgomery, Birmingham',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Oklahoma City, Tulsa',
    },
    {
        abbreviation: 'EST',
        label: '(GMT-05:00) Panama City',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Pierre, Sioux Falls, Rapid City',
    },
    {
        abbreviation: 'ECT',
        label: '(GMT-05:00) Quito,Galapagos',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Rankin Inlet, Arviat',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Saint Paul, Minneapolis, Bloomington, Duluth, Rochester',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Springfield, Chicago, Rockford, Peoria',
    },
    {
        abbreviation: 'CDT',
        label: '(GMT-05:00) Topeka, Wichita, Lawrence, Kansas City',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Airdrie, Brooks, Calgary',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) American Falls, Bancroft, Blackfoot',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Belize City',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-06:00) Cambridge Bay',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Central America',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Central Time (US & Canada)',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Cheyenne, Casper, Laramie',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Denver',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Guadalajara, Mexico City, Monterrey',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Guatemala City',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Helena, Billings, Great Falls, Missoula, Butte',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-06:00) Holbrook, Show Low, Winslow',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Managua',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Salt Lake City, Ogden, Provo',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) San Jose',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) San Salvador',
    },
    {
        abbreviation: 'MDT',
        label: '(GMT-06:00) Santa Fe, Albuquerque',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Saskatchewan',
    },
    {
        abbreviation: 'CST',
        label: '(GMT-06:00) Tegucigalpa',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-07:00) Arizona',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Bonners Ferry, Coeur d`Alene, Elk City',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-07:00) Carmacks, Dawson',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Carson City, Las Vegas, Reno',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-07:00) Chihuahua, La Paz, Mazatlan',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Los Angeles , San Diego , San Jose, San Francisco, Sacramento',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-07:00) Mountain Time (US & Canada)',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Olympia, Seattle, Spokane, Tacoma',
    },
    {
        abbreviation: 'MST',
        label: '(GMT-07:00) Phoenix',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Portland, Salem, Eugene',
    },
    {
        abbreviation: 'PDT',
        label: '(GMT-07:00) Vancouver, Surrey, Richmond',
    },
    {
        abbreviation: 'AKDT',
        label: '(GMT-08:00) Anchorage, Fairbanks, Juneau',
    },
    {
        abbreviation: 'PST',
        label: '(GMT-08:00) Pacific Time (US & Canada)',
    },
    {
        abbreviation: 'PST',
        label: '(GMT-08:00) Tijuana, Baja California',
    },
    {
        abbreviation: 'HST',
        label: '(GMT-09:00) Adak',
    },
    {
        abbreviation: 'AKST',
        label: '(GMT-09:00) Alaska',
    },
    {
        abbreviation: 'TAHT',
        label: '(GMT-10:00) Austral Islands, Gambier Islands, Marquesas Islands, Society Islands',
    },
    {
        abbreviation: 'HST',
        label: '(GMT-10:00) Hawaii',
    },
    {
        abbreviation: 'HST',
        label: '(GMT-10:00) Honolulu, Pearl City, Hilo, Lahaina, Wailuku',
    },
    {
        abbreviation: 'CKT',
        label: '(GMT-10:00) Rarotonga',
    },
    {
        abbreviation: 'SST',
        label: '(GMT-11:00) Midway Island, Samoa',
    },
    {
        abbreviation: 'SST',
        label: '(GMT-11:00) Pago Pago',
    },
    {
        abbreviation: 'IDLW',
        label: '(GMT-12:00) International Date Line West',
    },
];

function normalizeTimezoneLabel(label) {
    return String(label || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function getTimezoneAbbreviation(timezoneName) {
    const normalizedName = normalizeTimezoneLabel(timezoneName);
    if (!normalizedName) return '';

    const exactMatch = timeZones.find((zone) => normalizeTimezoneLabel(zone.label) === normalizedName);
    if (exactMatch) return exactMatch.abbreviation;

    const containsMatch = timeZones.find((zone) => {
        const normalizedLabel = normalizeTimezoneLabel(zone.label);
        return normalizedLabel.includes(normalizedName) || normalizedName.includes(normalizedLabel);
    });
    if (containsMatch) return containsMatch.abbreviation;

    const offsetMatch =
        timezoneName.match(/GMT([+-]\d{1,2}:?\d{2})/i) || timezoneName.match(/UTC([+-]\d{1,2}:?\d{2})/i);
    if (offsetMatch) {
        const offsetValue = offsetMatch[1].replace(/^(\d)(?=:\d{2})/, '0$1');
        const offsetMatchZone = timeZones.find((zone) => normalizeTimezoneLabel(zone.label).includes(offsetValue));
        if (offsetMatchZone) return offsetMatchZone.abbreviation;
    }

    return '';
}

export default timeZones;
