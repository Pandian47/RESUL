export const splitTextForPersonalize = (data) => {
    const result = [];
    let i = 0;
    if(!data) return [];
    while (i < data.length) {
        if (data[i] === '[' && data[i + 1] === '[') {
            const start = i;
            i += 2;
            let content = '';
            while (i < data.length && !(data[i] === ']' && data[i + 1] === ']')) {
                content += data[i];
                i++;
            }

            if (data[i] === ']' && data[i + 1] === ']') {
                result.push(`[[${content.trim()}]]`);
                i += 2;
            } else {
                i = start + 2; 
            }
        } else {
            i++;
        }
    }

    return result;
};

