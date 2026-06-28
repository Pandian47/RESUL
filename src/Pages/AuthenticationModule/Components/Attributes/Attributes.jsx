import { truncateTitle } from 'Utils/modules/displayCore';
import { attributeListData, enabledisableAttribute, getCategoryAttributesDataIndex, getCategoryAttributesFromStore, getCategoryGroupKey } from './constant';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ATTRIBUTES, DATASETS_DISABLED, SEARCH_ATTRIBUTES_VALUES } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_down_fill_edge_mini, circle_arrow_up_fill_edge_mini, expand_all_medium, justify_dropdown_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useMemo, useState } from 'react';
import _hasIn from 'lodash/hasIn';
import _get from 'lodash/get';
import { Accordion, Card } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSSearchField from 'Components/RSSearchField';
import RSTooltip from 'Components/RSTooltip';
import { KendoIconDropdown } from 'Components/RSDropDown';
import { RSCheckbox } from 'Components/RSInput';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
// import RSCheckbox from 'Components/FormFields/RSCheckbox';
import {
    addBrandError,
    addPartnerError,
    getallAttributes,
    zeroDayAttributeDisable,
} from '../SegmentationLists/constant';
import { ZERO_DAY_FIELD_NAME } from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreation/constant';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import useQueryParams from 'Hooks/useQueryParams';
import usePartnerDataEnabled from 'Hooks/usePartnerDataEnabled';
import { useSelector } from 'react-redux';
import { SegmentAttributesSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const Attributes = ({
    data,
    getSelectedList,
    targetListContext,
    isDisable,
    updateVersium,
    ispartnerDigipop,
    ispartnerDigipopstate,
    setIspartnerDigipopstate,
    isUpdate,
    disablePartnerData = false,
}) => {
    const locationAudience = useQueryParams('/audience');
    const { SubSegmentExp_List, fullAttributeJSONValues } = useSelector(
        ({ dataTargetListReducer }) => dataTargetListReducer,
    );
    const { watch, trigger, getFieldState, getValues, formState, reset } = useFormContext();
    const [isExpandedAll, setIsExpandedAll] = useState(true);
    const [activeKey, setActiveKey] = useState(0);
    const [searchedAttribute, setSearchedAttribute] = useState('');
    const [isSearchFieldActive, setIsSearchFieldActive] = useState(false);

    const isPartnerDataEnabled = usePartnerDataEnabled();
    const { targetListState, dispatchState } = useContext(targetListContext);
    const {
        attributesData,
        searchAttributes,
        leftPanelAttributes,
        filterGroups,
        type,
        isZeroDayFiles,
        attributesLoading,
        adhocLeftPanelLoading,
        attributesLoadFailed,
        lookAlikeLeftPanelLoading,
        filterLabels,
        brandData,
        partnerData,
        attributesError,
        isPartnerAttSaved
    } = targetListState;

    const isPersona = type === 'persona';

    const attributes = watch();
    const listValue = getValues('segmentation.listName');
    const expandingCard = (attribute, attributeIdx) => {
        let isExpanded = false;
        let tempData = [...data];
        if (activeKey === attributeIdx + 1) {
            setActiveKey(-1);
            dispatchState({
                type: 'UPDATE',
                payload: [],
                field: 'searchAttributes',
            });
        }
        if (!isExpandedAll && activeKey !== attributeIdx + 1) {
            setActiveKey(attributeIdx + 1);
            handleSearchAttributes(Object.keys(attribute)[0]?.toLowerCase());
        }
        if (isExpandedAll && activeKey === 0 && attribute?.isExpanded === attributeIdx + 1) {
            isExpanded = true;
        }
        expandCard(attributeIdx, isExpanded);
        if (isExpandedAll && tempData?.every((item) => item.isExpanded > 0)) {
            setIsExpandedAll(false);
        }
    };

    const expandCollapseAll = (expand) => {
        const templeftPanelAttributes = [...leftPanelAttributes];
        const expandedKeys = leftPanelAttributes?.map((attribute, _) => Object.keys(attribute)[0]?.toLowerCase());
        if (expand) {
            handleSearchAttributes(expandedKeys);
        } else {
            dispatchState({
                type: 'UPDATE',
                payload: [],
                field: 'searchAttributes',
            });
        }
        templeftPanelAttributes?.map((attribute, attributeIdx) => {
            if (expand) {
                attribute.isExpanded = 0;
            } else {
                attribute.isExpanded = attributeIdx + 1;
            }
            return attribute;
        });
        dispatchState({
            type: 'UPDATE',
            payload: templeftPanelAttributes,
            field: 'leftPanelAttributes',
        });
    };

    const expandCard = (cardIndex, isExpanded) => {
        const templeftPanelAttributes = [...leftPanelAttributes];
        if (isExpanded) {
            templeftPanelAttributes[cardIndex].isExpanded = 0;
        } else {
            templeftPanelAttributes[cardIndex].isExpanded = cardIndex + 1;
        }
        dispatchState({
            type: 'UPDATE',
            payload: templeftPanelAttributes,
            field: 'leftPanelAttributes',
        });
    };
    // const insertRemoveAttributes = (checked, props, index) => {
    //     const filterState = watch();
    //     const { zeroDayLists, filterLists, inclusionLists, exclusionLists, lookALikeAudLists, lookALikeAttrLists } = filterState;
    //     const zerodays = zeroDayLists?.length ? zeroDayLists : [];
    //     const inclusions = inclusionLists?.length ? inclusionLists : [];
    //     const exclusions = exclusionLists?.length ? exclusionLists : [];
    //     const lookAudLike = lookALikeAudLists?.length ? lookALikeAudLists : [];
    //     const lookAttrLike = lookALikeAttrLists?.length ? lookALikeAttrLists : [];
    //     const { item, itemIndex } = props;

    //     if (checked) {
    //         const findIndex = getallAttributes(getValues());
    //         if (findIndex === -1) {
    //             getSelectedList(filterGroups.activeGroup, item);
    //             const attributesTemp = [...attributesData];
    //             attributesTemp[index][item.category][itemIndex + 5].isChecked = checked;
    //             let leftpanelTemp = [...leftPanelAttributes];
    //             leftpanelTemp[index][item.category].push(item);

    //             dispatchState({
    //                 type: 'UPDATE',
    //                 payload: leftpanelTemp,
    //                 field: 'leftPanelAttributes',
    //             });
    //             dispatchState({
    //                 type: 'UPDATE',
    //                 payload: attributesTemp,
    //                 field: 'attributesData',
    //             });
    //         } else {
    //             trigger();
    //         }
    //     } else {
    //         let leftpanelTemp = [...leftPanelAttributes[index][item.category]];
    //         leftpanelTemp = leftpanelTemp?.filter((attribute, _) => attribute.name !== item.name);
    //         leftPanelAttributes[index][item.category] = [...leftpanelTemp];

    //         let tempZeroDayLists = [...zerodays];
    //         tempZeroDayLists = tempZeroDayLists?.filter((attribute, _) => attribute.name !== item.name);

    //         let tempFilterLists = [...filterLists];
    //         tempFilterLists = tempFilterLists?.filter((attribute, _) => attribute.name !== item.name);

    //         let tempInclusionLists = [...inclusions];
    //         tempInclusionLists = tempInclusionLists?.filter((attribute, _) => attribute.name !== item.name);

    //         let tempExclusionLists = [...exclusions];
    //         tempExclusionLists = tempExclusionLists?.filter((attribute, _) => attribute.name !== item.name);

    //         let tempLookAudi = [...lookAudLike];
    //         tempLookAudi = tempLookAudi?.filter((attribute, _) => attribute.name !== item.name);

    //         let tempLookAttr = [...lookAttrLike];
    //         tempLookAttr = tempLookAttr?.filter((attribute, _) => attribute.name !== item.name);

    //         const attributes = [...attributesData];
    //         attributes[index][item.category][itemIndex + 5].isChecked = checked;

    //         dispatchState({
    //             type: 'UPDATE',
    //             payload: attributes,
    //             field: 'attributesData',
    //         });

    //         dispatchState({
    //             type: 'UPDATE',
    //             payload: [...leftPanelAttributes],
    //             field: 'leftPanelAttributes',
    //         });
    //         setValue('zeroDayLists', tempZeroDayLists);
    //         setValue('filterLists', tempFilterLists);
    //         setValue('inclusionLists', tempInclusionLists);
    //         setValue('exclusionLists', tempExclusionLists);
    //         setValue('lookALikeAudLists', tempLookAudi);
    //         setValue('lookALikeAttrLists', tempLookAttr);
    //     }
    // };

    const resolveAttributeStoreIndex = (categoryIndex, item, dropdownItemIndex) => {
        const categoryList = attributesData[categoryIndex]?.[item.category];
        if (!Array.isArray(categoryList)) return dropdownItemIndex;

        const attributeIndex = categoryList.findIndex((attr) => attr.name === item.name);
        return attributeIndex >= 0 ? attributeIndex : dropdownItemIndex;
    };

    const insertRemoveAttributes = (checked, props, index) => {
        const filterState = watch();
        const {
            zeroDayLists = [],
            filterLists = [],
            inclusionLists = [],
            exclusionLists = [],
            lookALikeAudLists = [],
            lookALikeAttrLists = [],
        } = filterState;
        const item = props?.item ?? props;
        const itemIndex = props?.itemIndex;

        if (!item || itemIndex == null) return;

        const attributeStoreIndex = resolveAttributeStoreIndex(index, item, itemIndex);

        if (checked) {
            const findIndex = getallAttributes(getValues());
            if (findIndex === -1) {
                getSelectedList(filterGroups.activeGroup, item);
                const attributesTemp = [...attributesData];

                const currentItem = attributesTemp[index][item.category][attributeStoreIndex];
                const updatedItem = {
                    ...currentItem,
                    isChecked: checked,
                };
                attributesTemp[index][item.category][attributeStoreIndex] = updatedItem;
                let leftpanelTemp = [...leftPanelAttributes];
                leftpanelTemp[index][item.category].push(item);

                dispatchState({ type: 'UPDATE', payload: leftpanelTemp, field: 'leftPanelAttributes' });
                dispatchState({ type: 'UPDATE', payload: attributesTemp, field: 'attributesData' });
            } else {
                trigger();
            }
        } else {
            let leftpanelTemp = [...leftPanelAttributes[index][item.category]];
            leftpanelTemp = leftpanelTemp?.filter((attribute) => attribute.name !== item.name);
            leftPanelAttributes[index][item.category] = [...leftpanelTemp];

            const removeAttributeFromList = (list) => list.filter((attribute) => attribute.name !== item.name);

            let finalFormStateValue = {};

            filterGroups?.groups?.forEach((group) => {
                const currentGroupFormState = watch(group);
                const updateGroupFormState = removeAttributeFromList(currentGroupFormState);
                finalFormStateValue[group] = updateGroupFormState;
            });

            const attributes = [...attributesData];
            attributes[index][item.category][attributeStoreIndex].isChecked = checked;

            dispatchState({ type: 'UPDATE', payload: attributes, field: 'attributesData' });
            dispatchState({ type: 'UPDATE', payload: [...leftPanelAttributes], field: 'leftPanelAttributes' });

            reset((formState) => ({
                ...formState,
                ...finalFormStateValue,
            }));
        }
    };

    const handleAttributeRowClick = (event, itemProps, categoryIndex) => {
        event.stopPropagation();
        const attributeItem = itemProps?.item ?? itemProps;
        if (!attributeItem) return;
        if (attributeItem?.sOLRCountValue === 0 || !isListNameValidForAttributes) return;
        insertRemoveAttributes(!isAttributeSelectedInFilters(attributeItem), itemProps, categoryIndex);
    };

    const RenderAttribute = ({ item: itemProps, index: categoryIndex }) => {
        const attributeItem = itemProps?.item ?? itemProps;
        const itemIndex = itemProps?.itemIndex;

        if (!attributeItem) return null;

        const isLookAlikeItem = Boolean(attributeItem?.isLookAlike);
        const isAttributeDisabled =
            attributeItem?.sOLRCountValue === 0 || !isListNameValidForAttributes;
        const isAttributeChecked = isAttributeSelectedInFilters(attributeItem);

        return (
            <div
                className={isLookAlikeItem ? 'look-alike-attribute-row' : 'attribute-dropdown-row'}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => handleAttributeRowClick(event, itemProps, categoryIndex)}
            >
                <RSCheckbox
                    key={itemIndex}
                    disabled={isAttributeDisabled}
                    labelName={attributeItem.labelText}
                    checked={isAttributeChecked}
                    containerClass={isLookAlikeItem ? 'look-alike-attribute' : ''}
                    onChange={() => {}}
                />
            </div>
        );
    };

    const handleSearchAttributes = (expandedKeys) => {
        const attributes = [];
        attributesData
            ?.filter((attribute, _) => {
                const [entries] = Object.entries(attribute);
                const [key, value] = entries;
                if (expandedKeys?.includes(key?.toLowerCase())) {
                    return value;
                }
            })
            ?.forEach((attribute) => attributes.push(...Object.values(attribute)?.flat()));
        dispatchState({
            type: 'UPDATE',
            payload: attributes,
            field: 'searchAttributes',
        });
    };

    function getMatchedSearchAttributes(searchedAttribute, filterLabels, searchAttributes) {
        if (!searchedAttribute) return searchAttributes;

        const query = searchedAttribute.toLowerCase();
        const matchSOLRFieldName = [];

        if (fullAttributeJSONValues?.length) {
            for (const attributeJSONValue of fullAttributeJSONValues) {
                for (const [sOLRFieldName, attributeValues] of Object.entries(attributeJSONValue)) {
                    for (const value of attributeValues) {
                        if (value && value?.toLowerCase().includes(query)) {
                            matchSOLRFieldName.push(sOLRFieldName);
                        }
                    }
                }
            }
        }

        const uniqueSOLRFields = [...new Set(matchSOLRFieldName)];

        const matchedAttributes = searchAttributes.filter((attr) => uniqueSOLRFields.includes(attr?.sOLRFieldName));

        return matchedAttributes;
    }

    const searchAttr = useMemo(() => {
        if (!searchedAttribute) return searchAttributes;
        const query = searchedAttribute?.toLowerCase();
        return searchAttributes?.filter((attri) => {
            const label = attri?.labelText?.toString().toLowerCase() || '';
            return label.includes(query);
        });
    }, [searchAttributes, searchedAttribute]);

    const matchedValueAttributes = useMemo(() => {
        const searchByAttributeValue = isPersona
            ? []
            : getMatchedSearchAttributes(searchedAttribute, filterLabels, searchAttributes);

        return searchByAttributeValue;
    }, [searchAttributes, searchedAttribute]);

    const getListnameState = !isPersona && !updateVersium && getFieldState(`segmentation.listName`, formState);
    const getListerrorState = !isPersona && !updateVersium && _hasIn(formState.segmentation, 'listName');
    const _isEmpty = !isPersona && !updateVersium && _get(getValues()?.segmentation, 'listName', '') === '';
    const isListNameValidForAttributes = isPersona
        ? true
        : !getListnameState?.invalid && !getListerrorState && !_isEmpty;

    const isAttributeSelectedInFilters = (attributeItem) => {
        if (!attributeItem?.labelText) return false;
        if (attributeItem?.isChecked) return true;

        return filterGroups?.groups?.some((group) =>
            Boolean(enabledisableAttribute(getValues()[group], attributeItem.labelText)),
        );
    };

    const handleClickOff = (list) => {
        if (list?.category === 'File' && locationAudience?.isMDCSubSegment && SubSegmentExp_List?.[0]?.listType === 1) {
            return false;
        } else {
            if (list?.sOLRCountValue === 0) {
                return true;
            }
            return false;
        }
    };

    const handleActiveClassAdd = (list) => {
        let finalActiveClass = '';
        filterGroups?.groups?.forEach((group) => {
            return (finalActiveClass += `${enabledisableAttribute(getValues()[group], list?.labelText)}`);
        });
        return finalActiveClass;
    };
    const attributeClass = (list) => {
        return `${handleClickOff(list) ? 'click-off ' : ''} ${handleActiveClassAdd(list)}`;
    };

    const renderMatchedAttributes = (matchedAttributes, sectionTitle) => {
        return (
            <div className="position-relative d-lg-inline">
                <div
                    className={`fs17 p10  bg-tertiary-blue lh20 mb2 ${
                        sectionTitle !== 'Match by attribute name' ? 'mt12' : ''
                    } `}
                >
                    {sectionTitle}
                </div>
                {matchedAttributes?.length ? (
                    <ul className="searchList">
                        {matchedAttributes.map((attribute, ind) => (
                            <li
                                key={`value-${attribute.labelText}-${ind}`}
                                className={`${attributeClass(attribute)} ${
                                    (attribute.name ?? attribute.nAME) === ZERO_DAY_FIELD_NAME &&
                                    zeroDayAttributeDisable(attributes)
                                        ? 'click-off'
                                        : ''
                                } ${attribute?.category.toLowerCase() === 'versium' ? 'bg-versium-color' : ''} ${
                                    attribute?.isLookAlike ? 'bg-primary-blue text-white' : ''
                                } ${
                                    filterGroups?.activeGroup === 'lookALikeAttrLists'
                                        ? attribute?.isLookAlike
                                            ? ''
                                            : 'click-off'
                                        : ''
                                }`}
                                title={
                                    attribute?.isLookAlike
                                        ? `Similarity score : ${attribute?.lookAlikeConfig?.["similarityscore"]}%`
                                        : attribute?.sOLRCountValue != null
                                        ? `Count: ${attribute.sOLRCountValue}`
                                        : ''
                                }
                                onClick={async () => {
                                    const findIndex = getallAttributes(getValues());
                                    if (findIndex === -1 && formState.isValid) {
                                        const finalName = attribute.name ?? attribute.nAME;
                                        if (ZERO_DAY_FIELD_NAME === finalName && !isZeroDayFiles) {
                                            let tempFilterGroups = {
                                                ...filterGroups,
                                            };
                                            tempFilterGroups.groups = ['zeroDayLists'];
                                            tempFilterGroups.activeGroup = 'zeroDayLists';
                                            await dispatchState({
                                                type: 'UPDATE',
                                                payload: tempFilterGroups,
                                                field: 'filterGroups',
                                            });
                                            dispatchState({
                                                type: 'UPDATE_ZERO_DAY_FILES',
                                            });
                                            getSelectedList('zeroDayLists', attribute);
                                        } else {
                                            getSelectedList(filterGroups.activeGroup, attribute);
                                        }
                                    } else {
                                        trigger();
                                    }
                                }}
                            >
                                {attribute.labelText?.length > 29 ? (
                                    <RSTooltip
                                        text={
                                            attribute?.sOLRCountValue != null
                                                ? `${attribute.labelText} (Count: ${attribute.sOLRCountValue})`
                                                : attribute.labelText
                                        }
                                        position="top"
                                        innerContent={false}
                                    >
                                        {truncateTitle(attribute.labelText, 29)}
                                    </RSTooltip>
                                ) : (
                                    attribute.labelText
                                )}
                                <label>+</label>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="d-flex justify-content-center align-items-center h-25 noDataFound position-relative">
                        <NoDataAvailableRender message={'No match found'} isShowIcon={false} />
                    </div>
                )}
            </div>
        );
    };

    const finalMatchAttributeSection = isPersona
        ? [
              {
                  matchedAttributes: searchAttr,
                  sectionTitle: 'Attribute matches',
              },
          ]
        : [
              {
                  matchedAttributes: searchAttr,
                  sectionTitle: 'Attribute matches',
              },
              {
                  matchedAttributes: matchedValueAttributes,
                  sectionTitle: 'Value matches',
              },
          ];

    return (
        <>
            {attributesLoading || adhocLeftPanelLoading || lookAlikeLeftPanelLoading ? (
                <SegmentAttributesSkeleton />
            ) : attributesLoadFailed ? (
                <SegmentAttributesSkeleton isError />
            ) : (
                <div
                    className={`rs-targetList-leftSide ${
                        isUpdate &&
                        Object.keys(ispartnerDigipopstate)?.length > 0 &&
                        ispartnerDigipopstate?.listId === 2
                            ? 'pe-none'
                            : ''
                    }`}
                >
                    <div className="d-flex justify-content-between align-items-center mb15">
                        {(!isPartnerDataEnabled && !ispartnerDigipop) || disablePartnerData ? (
                            <h4 className="mb0 position-relative top4 left2">{ATTRIBUTES}</h4>
                        ) : (
                            <RSBootstrapdown
                                data={attributeListData}
                                alignRight
                                isObject
                                defaultItem={
                                    (Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                    ispartnerDigipopstate?.listId === 2) || isUpdate && isPartnerAttSaved
                                        ? attributeListData[1]
                                        : attributeListData[0]
                                }
                                fieldKey="listName"
                                customAlignRight
                                className={`${isSearchFieldActive ? 'pointer-event-none' : ''}`}
                                isActive
                                showUpdate
                                onSelect={(e) => {
                                    if (ispartnerDigipop) {
                                        setIspartnerDigipopstate(e);
                                    } else if (isPartnerDataEnabled) {
                                        const onlyContainsError = Object.entries(attributesError)?.filter(
                                            ([key, value]) =>
                                                value && (value === addPartnerError || value === addBrandError),
                                        );
                                        onlyContainsError?.[0]?.[0] &&
                                            dispatchState({
                                                type: 'UPDATE',
                                                payload: { ...attributesError, [onlyContainsError?.[0]?.[0]]: null },
                                                field: 'attributesError',
                                            });
                                        if (e?.listId === 1) {
                                            dispatchState({
                                                type: 'UPDATE_ATTRIBUTES',
                                                field: 'default',
                                                payload: {
                                                    attributesData: brandData?.attributesData,
                                                    leftPanelAttributes: brandData?.leftPanelAttributes,
                                                    searchAttributes: brandData?.searchAttributes,
                                                },
                                            });
                                        } else if (e?.listId === 2) {
                                            dispatchState({
                                                type: 'UPDATE_ATTRIBUTES',
                                                field: 'default',
                                                payload: {
                                                    attributesData: partnerData?.attributesData,
                                                    leftPanelAttributes: partnerData?.leftPanelAttributes,
                                                    searchAttributes: partnerData?.searchAttributes,
                                                },
                                            });
                                        }
                                    }
                                }}
                            />
                        )}
                        <RSSearchField
                            // isDebounce
                            searchedText={(text) => setSearchedAttribute(text)}
                            placeholder={SEARCH_ATTRIBUTES_VALUES}
                            debounceOnChange={true}
                            maxSearchLength={MAX_LENGTH50}
                            onActiveChange={setIsSearchFieldActive}
                            isCloseSearch={getValues('isResetSearchInput') ? true : false}
                        />
                    </div>
                    <div className={isDisable ? 'pe-none click-off' : ''}>
                        {searchedAttribute?.length ? (
                            <div className="accordionBlock">
                                {finalMatchAttributeSection?.map(({ matchedAttributes, sectionTitle }, index) => (
                                    <Fragment key={index}>
                                        {renderMatchedAttributes(matchedAttributes, sectionTitle)}
                                    </Fragment>
                                ))}
                            </div>
                        ) : (
                            <div className="accordionBlock mt25">
                                <div className="d-flex justify-content-end mb10 cp">
                                    <RSTooltip
                                        innerContent={false}
                                        text={`${activeKey !== 0 ? 'Expand all' : 'Collapse all'}`}
                                        position="top"
                                        className="lh0"
                                    >
                                        <i
                                            className={`${expand_all_medium} icon-md ${
                                                isExpandedAll ? 'color-primary-blue' : ''
                                            }`}
                                            onClick={() => {
                                                if (isExpandedAll) {
                                                    setActiveKey(-1);
                                                } else {
                                                    setActiveKey(0);
                                                }
                                                expandCollapseAll(!isExpandedAll);
                                                setIsExpandedAll(!isExpandedAll);
                                            }}
                                        />

                                        {/* <img
                                    src={isExpandedAll ? expand : collapse}
                                    alt="expandcollapse"
                                    width="24"
                                    height="24"
                                    onClick={() => {
                                        if (isExpandedAll) {
                                            setActiveKey(-1);
                                        } else {
                                            setActiveKey(0);
                                        }
                                        expandCollapseAll(!isExpandedAll);
                                        setIsExpandedAll(!isExpandedAll);
                                    }}
                                /> */}
                                    </RSTooltip>
                                </div>
                                <Accordion activeKey={activeKey}>
                                    {data?.map((attribute, attributeIdx) => {
                                        const groupHead = getCategoryGroupKey(attribute);
                                        const attributeValues = attribute[groupHead];
                                        const sortAttributeValues = attributeValues?.length
                                            ? attributeValues?.sort((a, b) => a.labelText.localeCompare(b.labelText))
                                            : attributeValues;
                                        const attributesDataIndex = getCategoryAttributesDataIndex(
                                            attributesData,
                                            groupHead,
                                        );
                                        const allAtttributes = getCategoryAttributesFromStore(
                                            attributesData,
                                            groupHead,
                                        );
                                        const resolvedAttributesDataIndex =
                                            attributesDataIndex >= 0 ? attributesDataIndex : attributeIdx;
                                        let sliceValue =
                                            ispartnerDigipopstate &&
                                            Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                            ispartnerDigipopstate?.listId === 2
                                                ? 20
                                                : data?.length > 2
                                                ? 5
                                                : 20;
                                        const isAttributeDropdownClickOff =
                                            allAtttributes?.length <= sliceValue ||
                                            (!isPersona && !updateVersium && listValue?.length < 3);

                                        return (
                                            <Card key={groupHead}>
                                                <Card.Header>
                                                    <div className="d-flex justify-content-between">
                                                        <div
                                                            className="rs-expand-collapse"
                                                            onClick={() => expandingCard(attribute, attributeIdx)}
                                                        >
                                                            <i
                                                                className={` icon-xs ${
                                                                    activeKey === attribute?.isExpanded
                                                                        ? 'color-primary-blue ' +
                                                                          circle_arrow_up_fill_edge_mini
                                                                        : 'color-primary-grey ' +
                                                                          circle_arrow_down_fill_edge_mini
                                                                }`}
                                                            />
                                                            {/* <span>{Object.keys(attribute)[0]}</span> */}
                                                            <span>
                                                                {Object.keys(attribute)[0]?.length > 19 ? (
                                                                    <RSTooltip
                                                                        text={Object.keys(attribute)[0]}
                                                                        position="top"
                                                                        className="d-inline-block"
                                                                    >
                                                                        <span className="m0">
                                                                            {truncateTitle(
                                                                                Object.keys(attribute)[0],
                                                                                19,
                                                                            )}
                                                                        </span>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <span className="m0">
                                                                        {Object.keys(attribute)[0]}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={
                                                                isAttributeDropdownClickOff
                                                                    ? 'pe-none click-off lh0 d-inline-block'
                                                                    : ''
                                                            }
                                                        >
                                                            <KendoIconDropdown
                                                                icon={` ${justify_dropdown_mini} icon-xs ${
                                                                    isAttributeDropdownClickOff ? '' : 'cp'
                                                                } color-primary-blue`}
                                                                data={allAtttributes?.slice(
                                                                    sliceValue,
                                                                    allAtttributes?.length,
                                                                )?.map(item => ({
                                                                    ...item,
                                                                    disabled: item?.sOLRCountValue === 0
                                                                }))}
                                                                isCustomRender
                                                                itemRender={(itemProps) => (
                                                                    <RenderAttribute
                                                                        item={itemProps}
                                                                        index={resolvedAttributesDataIndex}
                                                                    />
                                                                )}
                                                                popupSettings={{
                                                                    popupClass: `filterAttributeDropdownContainer`,
                                                                }}
                                                            />
                                                        </span>
                                                    </div>
                                                </Card.Header>
                                                <Accordion.Collapse eventKey={attribute?.isExpanded}>
                                                    <Card.Body>
                                                        <ul
                                                            className={`${
                                                                isListNameValidForAttributes
                                                                    ? ''
                                                                    : 'pe-none click-off'
                                                            }`}
                                                        >
                                                            {sortAttributeValues?.map((list, listIdx) => {
                                                                return (
                                                                    <li
                                                                        key={listIdx}
                                                                        className={`${attributeClass(list)}  ${
                                                                            (list.name ?? list.nAME) ===
                                                                                ZERO_DAY_FIELD_NAME &&
                                                                            zeroDayAttributeDisable(attributes)
                                                                                ? 'click-off'
                                                                                : ''
                                                                        } ${
                                                                            list?.category.toLowerCase() === 'versium'
                                                                                ? 'bg-versium-color'
                                                                                : ''
                                                                        } ${
                                                                            list?.isLookAlike ? 'bg-primary-blue text-white' : ''
                                                                        } ${
                                                                            filterGroups?.activeGroup ===
                                                                            'lookALikeAttrLists'
                                                                                ? list?.isLookAlike
                                                                                    ? ''
                                                                                    : 'click-off'
                                                                                : ''
                                                                        }`}
                                                                        title={
                                                                            list?.isLookAlike
                                                                                ? `Similarity score : ${list?.lookAlikeConfig?.["similarityscore"]}%`
                                                                                : list?.sOLRCountValue != null
                                                                                ? `Count: ${list.sOLRCountValue}`
                                                                                : ''
                                                                        }
                                                                        onClick={async () => {
                                                                            const findIndex = getallAttributes(
                                                                                getValues(),
                                                                            );
                                                                            if (findIndex === -1 && formState.isValid) {
                                                                                const finalName =
                                                                                    list.name ?? list?.nAME;
                                                                                if (
                                                                                    ZERO_DAY_FIELD_NAME === finalName &&
                                                                                    !isZeroDayFiles
                                                                                ) {
                                                                                    let tempFilterGroups = {
                                                                                        ...filterGroups,
                                                                                    };
                                                                                    tempFilterGroups.groups = [
                                                                                        'zeroDayLists',
                                                                                    ];
                                                                                    tempFilterGroups.activeGroup =
                                                                                        'zeroDayLists';
                                                                                    await dispatchState({
                                                                                        type: 'UPDATE',
                                                                                        payload: tempFilterGroups,
                                                                                        field: 'filterGroups',
                                                                                    });
                                                                                    dispatchState({
                                                                                        type: 'UPDATE_ZERO_DAY_FILES',
                                                                                    });
                                                                                    getSelectedList(
                                                                                        'zeroDayLists',
                                                                                        list,
                                                                                    );
                                                                                } else {
                                                                                    getSelectedList(
                                                                                        filterGroups.activeGroup,
                                                                                        list,
                                                                                    );
                                                                                }
                                                                            } else {
                                                                                trigger();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {list?.labelText?.length > 32 ? (
                                                                            <RSTooltip
                                                                                text={
                                                                                    list?.sOLRCountValue != null
                                                                                        ? `${list.labelText} (Count: ${list.sOLRCountValue})`
                                                                                        : list.labelText
                                                                                }
                                                                                position="top"
                                                                                innerContent={false}
                                                                            >
                                                                                {truncateTitle(list?.labelText, 28)}
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            list?.labelText
                                                                        )}
                                                                        {/* {list.labelText} */}
                                                                        <label>+</label>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </Card.Body>
                                                </Accordion.Collapse>
                                            </Card>
                                        );
                                    })}
                                </Accordion>
                            </div>
                        )}
                    </div>
                    <small className="mt5 font-xxs">{DATASETS_DISABLED}</small>
                </div>
            )}
        </>
    );
};

export default Attributes;
