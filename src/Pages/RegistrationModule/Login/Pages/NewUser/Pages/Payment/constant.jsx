export const PAYMENT_FREQUENCY = ['Monthly(1x)', 'Quarterly(3x)', 'Half-yearly(6x)', 'Annually(12x)'];

export const getFrequecy = (frequency, price) => {
    if (frequency === 'Monthly(1x)') {
        return 1 * price;
    } else if (frequency === 'Quarterly(3x)') {
        return 3 * price;
    } else if (frequency === 'Half-yearly(6x)') {
        return 6 * price;
    } else if (frequency === 'Annually(12x)') {
        return 12 * price;
    }
};
