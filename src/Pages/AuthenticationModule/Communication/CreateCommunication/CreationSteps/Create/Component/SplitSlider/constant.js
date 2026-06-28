export const colors = ['splitA','splitB','splitC','splitD'];
export const boxText = ['A', 'B', 'C', 'D'];

export const splitBoxClassName = (width) => {
    if (width < 30) return 'rsswb-small';
    else if (width < 60) return 'rsswb-medium';
    else return 'rsswb-large';
};

export const imgSplitClassName = (width) => {
    if (width < 30) return 'img-split-small';
    else if (width < 60) return 'img-split-medium';
    else return 'img-split-large';
};

export const labelStyle = (color) => ({
    background: color,
});
