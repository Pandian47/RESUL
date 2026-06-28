import CustomerJourneyFlow from 'Components/CustomerJourneyFlow';

const sampleApiData = {
    dimensions: [
        {
            dimension: 'Email',
            entry_count: 4,
            steps: [
                {
                    drop_offs: 3,
                    label: 'Starting pages',
                    step: 0,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/?resulid=aSWRXwyYTl8ZW18QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false',
                            to: 'https://conversionv5.resulticks.net/about-us.html',
                        },
                    ],
                },
                {
                    drop_offs: 0,
                    label: '1st Interaction',
                    step: 1,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/about-us.html',
                            to: 'https://conversionv5.resulticks.net/home-appliances.html',
                        },
                    ],
                },
                {
                    drop_offs: 0,
                    label: '2nd Interaction',
                    step: 2,
                    transitions: [
                        {
                            count: 1,
                            from: 'https://conversionv5.resulticks.net/home-appliances.html',
                            to: 'https://conversionv5.resulticks.net/contact.html',
                        },
                    ],
                },
            ],
        },
        {
            dimension: 'SMS',
            entry_count: 3,
            steps: [
                {
                    drop_offs: 2,
                    label: 'Starting pages',
                    step: 0,
                    transitions: [
                        {
                            count: 1,
                            // Same pathname (/) but different query params - should create branch
                            from: 'https://conversionv5.resulticks.net/?resulid=aSWRXwyYTl8ZW18QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false',
                            "to": "https://conversionv5.resulticks.net/home-appliances.html?resulid=aSWRXwyYTl8c218QV9OUFY2fE8x&utm_source=RESUL&utm_medium=email&utm_campaign=Test%20SDC%20Email%20Web%20Analytics_2a9&fUrl=false%22"
                        },
                    ],
                },
                {
                    drop_offs: 1,
                    label: '1st Interaction',
                    step: 1,
                    transitions: [],
                },
                {
                    drop_offs: 0,
                    label: '2nd Interaction',
                    step: 2,
                    transitions: [],
                },
            ],
        },
    ],
    step_summary: [
        {
            drop_offs: 0,
            label: 'Starting pages',
            step: 0,
            visits: 7,
        },
        {
            drop_offs: 5,
            label: '1st Interaction',
            step: 1,
            visits: 2,
        },
        {
            drop_offs: 1,
            label: '2nd Interaction',
            step: 2,
            visits: 1,
        },
        {
            drop_offs: 0,
            label: '3rd Interaction',
            step: 3,
            visits: 1,
        },
    ],
};

export default function UserInteraction() {
    return <CustomerJourneyFlow data={sampleApiData} />;
}
