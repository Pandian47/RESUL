
const parseDDMMMYYYYToDate = (value) => {
    if (!value || typeof value !== 'string') return null;
    const parts = value.trim().split(/\s+/);
    if (parts.length !== 3) return null;
    const [dd, mmm, yyyy] = parts;
    const date = new Date(`${mmm} ${dd}, ${yyyy}`);
    return isNaN(date.getTime()) ? null : date;
};

export const filterValue = {
    String: {
        // 1
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        in: 'Contains',
        'not in': 'Not contains',
        Like: 'Like',
        Doesnotlike: 'Does not like',
        Startswith: 'Starts with',
        Endswith: 'Ends with',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
    DateTime: {
        // 8
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        isafterorequalto: 'Is after or equal to',
        isafter: 'Is after',
        isbeforeorequalto: 'Is before or equal to',
        isbefore: 'Is before',
        between: 'Between',
        // notbetween: 'Not between',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
    Integer: {
        // 4 & 3
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        isgreaterthanorequalto: 'Is greater than or equal to',
        isgreaterthan: 'Is greater than',
        islessthanorequalto: 'Is less than or equal to',
        islessthan: 'Is less than',
        between: 'Between',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
};
export const FORM_INITIAL_STATE = {
    defaultValues: {
        attributes: [
            {
                attributeName: '',
                attributeValue: '',
                attributeComparison: 'Contains',
                attributeMutipleValues: [],
                attributeTo: '',
            },
        ],
        gracePeriod: '',
        conversionValue: '',
        conversionKey: '',
        isCrossBU: false,
    },
    mode: 'onTouched',
};

const findAttributeFieldNumber = (fieldType) => {
    switch (fieldType) {
        case 'D':
            return 1;
        case 'AN':
            return 2;
        case 'NR':
            return 3;
        case 'NR':
            return 4;
        case 'AN':
            return 8;
        default:
            return 8;
    }
};

const handleAttributeFromTo = (value, fieldType) => {
    if (fieldType === 3 || fieldType === 4 || fieldType === 8) {
        const splitValues = (value?.split(',') || []).map((v) => (v || '').trim());
        const fromRaw = splitValues[0] ?? '';
        const toRaw = splitValues[1] ?? '';
        if (fieldType === 8) {
            const fromDate = parseDDMMMYYYYToDate(fromRaw);
            const toDate = parseDDMMMYYYYToDate(toRaw);
            return [fromDate, toDate];
        }
        return [fromRaw, toRaw];
    } else {
        return [value];
    }
};

export const handleOfflineConversionEdit = async (
  offlineConversion,
  getAttributeField,
  conversionValues,
  setFixedValue
) => {
  const {
    conversionAttibutesJson = [],
    conversionValueAttributeValues = 0,
    conversionValueAttributeId = '[]',
    gracePeriod = 0,
    conversionMatchingKeys,
    conversionMatchingKeyId,
  } = offlineConversion?.OfflineConversionEdit[0] || {};

  const OfflineConversionValues = offlineConversion?.OfflineConversionValues;
  const OfflineConversionAttributes =
    offlineConversion?.OfflineConversionAttributes;

  const finalAttributesData = [];

  for (const attribute of conversionAttibutesJson) {
    const findDataAttributeId = OfflineConversionAttributes?.find(
      (conversion) =>
        conversion?.solrFieldName === attribute?.SOLRFieldName
    );

    const attributeNameValues = {
      dataAttributeId: findDataAttributeId?.dataAttributeId ?? 0,
      fieldTypeId: findDataAttributeId?.fieldTypeId,
      solrFieldName: attribute?.SOLRFieldName,
      uiPrintableName: attribute?.Name,
    };

    let dropdownData = [];
    let apiFailed = false;

    if (attribute?.FieldType === 'D') {
      try {
        dropdownData = await getAttributeField(attribute);
      } catch (error) {
        apiFailed = true;
        dropdownData = [];
      }
    }

    finalAttributesData.push({
      attributeName: attributeNameValues,
      attributeValue:
        findDataAttributeId?.fieldTypeId !== 1
          ? handleAttributeFromTo(
              attribute?.Value,
              findDataAttributeId?.fieldTypeId
            )[0]
          : '',
      attributeComparison:
        filterValue?.String[attribute?.CompareValue] ||
        attribute?.CompareValue,
      attributeMutipleValues:
        findDataAttributeId?.fieldTypeId === 1
          ? attribute?.Value?.split(',')
          : [],
      attributeTo: handleAttributeFromTo(
        attribute?.Value,
        findDataAttributeId?.fieldTypeId
      )[1],
      dropdownData,
      apiFailed,
    });
  }

  const parsedIds = JSON.parse(conversionValueAttributeId);
  const isFixedValue = String(parsedIds).includes('99999999999999');
  setFixedValue(isFixedValue);

  const filterEditConversionValue = OfflineConversionValues?.filter(
    (value) => String(parsedIds).includes(String(value.dataAttributeId))
  );

  const parseConversionKeyId = (val) => {
    if (val == null || val === '') return null;
    if (Array.isArray(val)) return val[0] ?? null;
    if (typeof val === 'string' && val.includes(',')) return val.split(',')[0]?.trim() ?? null;
    return val;
  };
  const conversionKeyId = parseConversionKeyId(conversionMatchingKeys) ?? parseConversionKeyId(conversionMatchingKeyId);
  const OfflineConversionMatchingKey = offlineConversion?.OfflineConversionMatchingKey || [];
  const conversionKey =
    conversionKeyId && OfflineConversionMatchingKey?.length
      ? OfflineConversionMatchingKey.find(
          (item) => String(item?.Id) === String(conversionKeyId) || String(item?.dataAttributeId) === String(conversionKeyId)
        ) || null
      : null;

  return {
    gracePeriod: gracePeriod || '0',
    conversionValue: filterEditConversionValue,
    conversionValueAttributeValues,
    attributes: finalAttributesData,
    conversionKey: conversionKey || null,
  };
};
