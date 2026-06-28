
export const removeUrlParameters = ({ domain, adaptiveUrl, fieldInsertName, index, setValue }) => {
    let parameters = domain?.split('?')[1];
    let paramsSplit = parameters?.split('&')?.filter((split, splitIndex) => splitIndex !== index);
    const appendValue = parameters ? domain?.split('?')[0] + '?' + paramsSplit?.join('&') : domain;
    setValue(`${fieldInsertName}.domain`, appendValue);
    if (adaptiveUrl?.length) {
        const adaptiveValue = paramsSplit ? adaptiveUrl?.split('?')[0] + '?' + paramsSplit?.join('&') : adaptiveUrl;
        setValue(`${fieldInsertName}.adaptiveUrl`, adaptiveValue);
    }
};

// export const findDuplicates = (watchFields) => {
//     const data = watchFields[0]?.parameters;
//     const duplicate = {};

//     let isDuplicate = [false, 0];

//     for (let i = 0; i < length; i++) {
//         if (duplicate[JSON.stringify(data[i])]) {
//             isDuplicate = [true, i];
//         } else {
//             duplicate[JSON.stringify(data[i])] = true;
//         }
//     }
//     console.log(isDuplicate, duplicate, 'duplicate values');
//     return isDuplicate;
// };

export const findDuplicates = (watchLink) => {
    for (let i = 0; i < watchLink?.length; i++) {
        const duplicates = {};
        for (let j = 0; j < watchLink[i]?.parameters?.length; j++) {
            const currentValue = watchLink[i]?.parameters[j];
            if (duplicates[currentValue.tags]) {
                return [true, i, j];
            } else {
                duplicates[currentValue.tags] = 1;
            }
        }
    }
    return [false, 0, 0];
};

export const insertParameters = (watchFields, fieldName, idx, index, appendValueOne, appendValueTwo, setValue) => {
    const isQuestionIncludes = watchFields.domain;
    const adaptiveUrl = watchFields.adaptiveUrl;
    if (isQuestionIncludes?.includes('?')) {
        let parameters = isQuestionIncludes?.split('?')[1];
        let paramsSplit = parameters?.split('&');
        paramsSplit[index] = appendValueOne !== '' ? `${appendValueOne}=[[${appendValueTwo}]]` : '';
        const appendValue = isQuestionIncludes?.split('?')[0] + '?' + paramsSplit?.join('&');
        setValue(`${fieldName}[${idx}].domain`, appendValue);
        if (adaptiveUrl?.length) {
            const adaptiveValue = adaptiveUrl?.split('?')[0] + '?' + paramsSplit?.join('&');
            setValue(`${fieldName}[${idx}].adaptiveUrl`, adaptiveValue);
        }
    } else {
        const appendValue = isQuestionIncludes?.includes('?')
            ? `&${appendValueOne}=[[${appendValueTwo}]]`
            : `?${appendValueOne}=[[${appendValueTwo}]]`;
        setValue(`${fieldName}[${idx}].domain`, watchFields.domain + appendValue);
        if (adaptiveUrl?.length) {
            const adaptiveValue = adaptiveUrl?.includes('?')
                ? `&${appendValueOne}=[[${appendValueTwo}]]`
                : `?${appendValueOne}=[[${appendValueTwo}]]`;
            setValue(`${fieldName}[${idx}].adaptiveUrl`, adaptiveUrl + adaptiveValue);
        }
    }
};
