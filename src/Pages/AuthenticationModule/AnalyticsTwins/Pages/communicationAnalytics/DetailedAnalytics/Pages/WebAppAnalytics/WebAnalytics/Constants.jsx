export const VISITORS_COUNT_GRID = {
    column: [
        { field: 'session', title: 'Sessions' },
        { field: 'rate', title: 'Bounce Rate', className: 'text-right' },
        { field: 'duration', title: 'Avg.Session duration', className: 'text-right' }
    ],
    data: [
        { session: 304, rate: '91.2%', duration: '00:00:44' },
        { session: 609, rate: '90.2%', duration: '00:00:40' },
        { session: 804, rate: '81.2%', duration: '00:00:22' },
        { session: 304, rate: '91.2%', duration: '00:00:44' },
        { session: 343, rate: '51.2%', duration: '00:00:44' },
        { session: 678, rate: '91.2%', duration: '00:00:44' }
    ]
}

export const VISITORS_DURATION_GRID = {
    column: [
        { field: 'sessionDuration', title: 'Session duration' },
        { field: 'sessions', title: 'Sessions ', className: 'text-right' },
        { field: 'views', title: 'Page views', className: 'text-right' }
    ],
    data: [
        { sessionDuration: '0-10 seconds', sessions: 690, views: 533 },
        { sessionDuration: '11-30 seconds', sessions: 87, views: 64 },
        { sessionDuration: '31-60 seconds', sessions: 67, views: 64 },
        { sessionDuration: '61-180 seconds', sessions: 57, views: 64 },
        { sessionDuration: '181-600 seconds', sessions: 87, views: 64 },
        { sessionDuration: '601+ seconds', sessions: 17, views: 64 },
    ]
}

export const VISITORS_FREQUENCY_GRID = {
    column: [
        { field: 'countSessions', title: 'Count of sessions' },
        { field: 'sessions', title: 'Sessions ', className: 'text-right' },
        { field: 'views', title: 'Page views', className: 'text-right' }
    ],
    data: [
        { countSessions: '1', sessions: 6902, views: 533 },
        { countSessions: '2', sessions: 87, views: 64 },
        { countSessions: '3', sessions: 67, views: 64 },
        { countSessions: '4', sessions: 57, views: 64 },
        { countSessions: '5', sessions: 87, views: 64 },
        { countSessions: '6', sessions: 17, views: 64 },
    ]
}

export const VISITORS_REGENCY_GRID = {
    column: [
        { field: 'count', title: 'Days since last session' },
        { field: 'sessions', title: 'Sessions ', className: 'text-right' },
        { field: 'views', title: 'Page views', className: 'text-right' }
    ],
    data: [
        { count: '0', sessions: 690, views: 533 },
        { count: '1', sessions: 87, views: 64 },
        { count: '2', sessions: 67, views: 64 },
        { count: '3', sessions: 57, views: 64 },
        { count: '4', sessions: 87, views: 64 },
        { count: '5', sessions: 17, views: 64 },
    ]
}

export const VISITORS_DEVICE_BROWSER_GRID = {
    column: [
        { field: 'browser', title: 'Browser' },
        { field: 'sessions', title: 'Sessions ', className: 'text-right' },
        { field: 'pages', title: 'Page views' },
        { field: 'rate', title: 'Bounce rate', className: 'text-right' }
    ],
    data: [
        { browser: 'Chrome', sessions: 690, pages: 533, rate: '48.1%' },
        { browser: 'Firefox', sessions: 87, pages: 64, rate: '85.90%' },
        { browser: 'Safari', sessions: 67, pages: 64, rate: '75.90%' },
        { browser: 'Internet explorer', sessions: 57, pages: 64, rate: '65.90%' },
        { browser: 'Android browser', sessions: 87, pages: 64, rate: '60%' },
        { browser: 'Others', sessions: 17, pages: 64, rate: '85.90%' },
    ]
}