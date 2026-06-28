export const planningSteps = [
    {
        step: 1,
        stepTitle: 'Plan',
        completed: ['execute', 'create-communication'],
        path: 'communication-creation',
    },
    {
        step: 2,
        stepTitle: 'Create',
        path: 'create-communication',
        completed: ['execute'],
    },
    {
        step: 3,
        stepTitle: 'Analyze & execute',
        path: 'execute',
        completed: [],
    },
];

export const planningSteps_ROI = [
    {
        step: 1,
        stepTitle: 'Plan',
        completed: ['execute', 'create-communication'],
        path: 'communication-creation',
    },
    {
        step: 2,
        stepTitle: 'Create',
        path: 'create-communication',
        completed: ['execute'],
    },
    {
        step: 3,
        stepTitle: 'Calculate ROI & Optimize',
        path: 'execute',
        completed: [],
        isRoi: true,
    },
    {
        step: 4,
        stepTitle: 'Execute',
        path: 'execute',
        completed: [],
        isExceute: true
    },
];
