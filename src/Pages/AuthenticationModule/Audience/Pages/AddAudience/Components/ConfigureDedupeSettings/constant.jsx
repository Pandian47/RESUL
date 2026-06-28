import { getCsvListType } from 'Utils/modules/browserUtils';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
export const mapFieldType = (fieldId) => {
    switch (fieldId) {
        case 1:
            return 'Text';
        case 3:
            return 'Decimal';
        case 4:
            return 'Integers';
        case 5:
            return 'Date';
        default:
            return 'Text';
    }
};

const convertInputJson = (formState) => {
    const inputJson = formState.settings.map((item) => ({
        ...item?.name,
        weightage: Number(item.weight) ?? 0,
        ngramLength: Number(item.grams) ?? 0,
    }));

    return { inputJson };
};

export const buildPayload = (formState, userDetails,type) => {
    const { inputJson } = convertInputJson(formState);
    return {
        jobId: 0,
        singleColumnThershold: Number(formState?.single) ?? 0,
        sensitiveColumnThershold: Number(formState?.combined) ?? 0,
        inputJson,
        sourceType: formState?.audienceBy?.typeId,
        listType: formState?.audienceBy?.typeId === 32 ? 5 : getCsvListType(formState?.listType),
        ...userDetails,
        dedupID: parseInt(formState?.dedupeSettingSaveStatus?.dedupeSettingId, 10) || 0,
        from: type || 'addAudience'
    };
};

export const handleValueRange = (value, min, max, allowDecimal = true) => {
    const numberConvert = allowDecimal ? parseFloat(value) : parseInt(value, 10);

    if (isNaN(numberConvert)) {
        return 'Enter a valid number';
    }

    if (numberConvert === 0) {
        return 'Enter a valid value';
    }

    if (numberConvert < min || numberConvert > max) {
        return `Enter value between ${min} and ${max}`;
    }

    return true;
};

export const dedupeSettingsAttributeData = [
    {
        AttributeName: 'Remotedatasource',
        DataAttributeID: 255,
        FieldTypeID: 1,
        SolrFieldName: 'Remotedatasource_s',
        UIPrintableName: 'Remote data source',
    },
    {
        AttributeName: 'Subscriptionform',
        DataAttributeID: 256,
        FieldTypeID: 3,
        SolrFieldName: 'Subscriptionform_d',
        UIPrintableName: 'Subscription forms',
    },
    {
        AttributeName: 'XML',
        DataAttributeID: 258,
        FieldTypeID: 8,
        SolrFieldName: 'XML_i',
        UIPrintableName: 'XML',
    },
];

const handleErrorMessage = (isDuplicate, value) => {
    const valueId = value?.dataAttributeID;
    const isExist = isDuplicate?.find((duplicate) => {
        return duplicate?.name?.dataAttributeID === valueId;
    });
    return isExist ? 'Duplicate attribute' : true;
};

export const handleAttributeDuplicates = (allSetting, value) => {
    let tempSet = new Set();
    const isDuplicate = allSetting.filter((setting) => {
        const settingId = setting?.name?.dataAttributeID;
        if (settingId) {
            if (tempSet.has(settingId)) {
                return true;
            }
            tempSet.add(settingId);
            return false;
        }
    });
    return handleErrorMessage(isDuplicate, value);
};

export const mapDedupeSettingResponseToForm = (apiResponse, allAttributes = []) => {
    if (!apiResponse?.inputAttributesJSON) {
        return null;
    }

    let parsedAttributes = [];
    if (typeof apiResponse.inputAttributesJSON === 'string') {
        parsedAttributes = parseAudienceJsonArray(apiResponse.inputAttributesJSON, []);
    } else if (Array.isArray(apiResponse.inputAttributesJSON)) {
        parsedAttributes = apiResponse.inputAttributesJSON;
    } else {
        return null;
    }

    if (!Array.isArray(parsedAttributes) || parsedAttributes.length === 0) {
        return null;
    }

    const attributesList = parsedAttributes?.length ? parsedAttributes : allAttributes;

    const formattedSettings = attributesList?.map((savedAttribute) => {
        return {
            ...savedAttribute,
            weight: savedAttribute.weightage || 0.5,
            compare: mapFieldType(savedAttribute.filedTypeId),
            grams: savedAttribute.ngramLength || 3,
        };
    });

    return {
        settings: formattedSettings,
        single: apiResponse.singelColumnThreshold || 0.7,
        combined: apiResponse.combinedColumnThreshold || 0.7,
    };
};
