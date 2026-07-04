import { find as _find } from 'Utils/modules/lodashReplacements';
import { SELECT_DIFFERENT_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';

export const HEADER_MAPPING_DD_CLASS = 'add-import-audience-header-dd';
export const HEADER_MAPPING_DD_DUPLICATE_ERROR_CLASS = `${HEADER_MAPPING_DD_CLASS}--duplicate-error`;
export const HEADER_MAPPING_DD_ERROR_MESSAGE_CLASS = `${HEADER_MAPPING_DD_CLASS}__error-message`;

export const getHeaderMappingDropdownErrorClassName = (message) =>
    message === SELECT_DIFFERENT_ATTRIBUTE ? HEADER_MAPPING_DD_DUPLICATE_ERROR_CLASS : '';

export const getHeaderMappingDropdownErrorMessageClassName = (message) =>
    message === SELECT_DIFFERENT_ATTRIBUTE ? HEADER_MAPPING_DD_ERROR_MESSAGE_CLASS : '';

export const shouldUseHeaderMappingDropdownErrorContainer = (message) =>
    Boolean(message) && message !== SELECT_DIFFERENT_ATTRIBUTE;

const buildUniqueIdentifierIcons = () => [
    {
        icon: <i className={G.user_star_medium} />,
        iconSource: G.user_star_medium,
        name: 'user',
    },
];

const buildPrimaryKeyIdentifiers = () => [
    {
        icon: <i className={G.settings_medium} />,
        name: 'settings',
        iconSource: G.settings_medium,
        disabled: true,
    },
];

export const iconMapping = (dataCatalogueAttrs, icon, dispatchState, index, row, uniqueKeyIndex) => {
    const attr = _find(dataCatalogueAttrs, (item) => item.attributeName?.toLowerCase() === icon?.toLowerCase());
    const isPrimary = attr?.isBrandId || !!(row[index] === row[uniqueKeyIndex]) ? true : false;
    if (isPrimary) {
        dispatchState({
            type: 'UPDATE_INITIAL_UNIQUE_IDENTIFIER',
            payload: {
                uniqueKeyIndex: !!(row[index] === row[uniqueKeyIndex]) ? uniqueKeyIndex : index,
                uniqueIdentifier: icon,
                isUniqueAttrSelected: attr?.isBrandId ? true : false,
            },
        });
    }
    return {
        selectedIcon: {
            name: isPrimary ? 'user' : 'settings',
            icon: <i className={isPrimary ? G.user_star_medium : G.settings_large} />,
            iconSource: isPrimary ? G.user_star_medium : G.settings_large,
        },
        iconList: isPrimary ? buildPrimaryKeyIdentifiers() : buildUniqueIdentifierIcons(),
    };
};

export const getUniqueIdentifierIcons = buildUniqueIdentifierIcons;
export const getPrimaryKeyIdentifiers = buildPrimaryKeyIdentifiers;
