import { Fragment } from 'react';
import { formatPercentage, numberWithCommas } from 'Utils/modules/formatters';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import {
    buildMdmCountRowsFromItems,
    buildMdmCountRowsFromObject,
} from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { MDM_COUNT_LIST_SECTION_CONFIG } from 'Pages/AuthenticationModule/Audience/Pages/MasterData/constant';

export const CountListSection = ({
    title,
    data,
    items,
    totalRecipients = 0,
    headingClassName = MDM_COUNT_LIST_SECTION_CONFIG.primaryHeadingClassName,
    wrapPercentageInParens = true,
}) => {
    const rows = items
        ? buildMdmCountRowsFromItems(items)
        : buildMdmCountRowsFromObject(data, totalRecipients);

    return (
        <>
            <h4 className={headingClassName}>{title}</h4>
            <ul className={MDM_COUNT_LIST_SECTION_CONFIG.listClassName}>
                {rows.length ? (
                    rows.map(({ label, count, percentage }) => (
                        <li key={label}>
                            <span>{label}</span>
                            <span>{numberWithCommas(count)}</span>
                            <span>
                                {wrapPercentageInParens ? '(' : ''}
                                {formatPercentage(percentage)}
                                <span className="fs12">%</span>
                                {wrapPercentageInParens ? ')' : ''}
                            </span>
                        </li>
                    ))
                ) : (
                    <div className={MDM_COUNT_LIST_SECTION_CONFIG.emptyStateClassName}>
                        <NoDataAvailableRender />
                    </div>
                )}
            </ul>
        </>
    );
};

export const MdmCountListSections = ({
    sections,
    dividerClassName = MDM_COUNT_LIST_SECTION_CONFIG.dividerClassName,
}) =>
    sections.map((section, index) => (
        <Fragment key={section.title}>
            {index > 0 ? <div className={dividerClassName} /> : null}
            <CountListSection {...section} />
        </Fragment>
    ));
