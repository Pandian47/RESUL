// import React, { memo, useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
// import { Pager } from '@progress/kendo-react-data-tools';

// import { INITIAL_PAGE_CONFIG, INITIAL_GALLERY_CONFIG } from './constant';

// const RSPager = ({
//     data = [],
//     change = () => {},
//     totalRow,
//     isGallery = false,
//     config = INITIAL_PAGE_CONFIG,
//     className = '',
//     ...props
// }) => {
//     const [pageState, setPageState] = useState(isGallery === true ? INITIAL_GALLERY_CONFIG : INITIAL_PAGE_CONFIG);

//     let { skip, take } = pageState;

//     const handlePageChange = (event) => {
//         const { skip, take } = event;
//         setPageState({
//             ...pageState,
//             skip: skip,
//             take: take,
//         });
//         change([...data.slice(skip, skip + take)], skip, take);
//     };

//     useEffect(() => {
//         setPageState(config);
//     }, [config]);


//     useEffect(() => {
//     const replaceIcons = () => {
//         const mappings = [
//             { selector: '.k-i-caret-alt-to-left, .k-svg-i-caret-alt-to-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'] },
//             { selector: '.k-i-arrow-60-left, .k-svg-i-arrow-60-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
//             { selector: '.k-i-caret-alt-left, .k-svg-i-caret-alt-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
//             { selector: '.k-i-arrow-60-right, .k-svg-i-arrow-60-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
//             { selector: '.k-i-caret-alt-right, .k-svg-i-caret-alt-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
//             { selector: '.k-i-caret-alt-to-right, .k-svg-i-caret-alt-to-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'] },
//             { selector: '.k-i-arrow-double-left, .k-svg-i-arrow-double-left', classes: ['icon-rs-pagination-first-medium', 'icon-xs'] },
//             { selector: '.k-i-arrow-double-right, .k-svg-i-arrow-double-right', classes: ['icon-rs-pagination-last-medium', 'icon-xs'] },
//             { selector: '.k-i-chevron-left, .k-svg-i-chevron-left', classes: ['icon-rs-pagination-previous-medium', 'icon-xs'] },
//             { selector: '.k-i-chevron-right, .k-svg-i-chevron-right', classes: ['icon-rs-pagination-next-medium', 'icon-xs'] },
//         ];

//         mappings.forEach(({ selector, classes }) => {
//             const elements = document.querySelectorAll(selector);
//             elements.forEach(element => {
//                 element.classList.remove('k-icon');
//                 element.classList.remove('k-svg-icon');
//                 classes.forEach(className => element.classList.add(className));
//                 const svg = element.querySelector('svg');
//                 if (svg) {
//                     svg.style.display = 'none';
//                 }
//             });
//         });
//     };

//     // Run immediately and on any DOM changes
//     replaceIcons();
    
//     const timeoutId = setTimeout(replaceIcons, 100);
    
//     const observer = new MutationObserver(replaceIcons);
//     observer.observe(document.body, { childList: true, subtree: true });

//     return () => {
//         clearTimeout(timeoutId);
//         observer.disconnect();
//     };
// }, [data, pageState]);

//     return (
//         <Pager
//             skip={skip}
//             take={take}
//             total={isGallery ? totalRow : data?.length}
//             buttonCount={pageState.buttonCount}
//             info={pageState?.info}
//             type={pageState.type}
//             pageSizes={pageState.pageSizes}
//             previousNext={pageState.previousNext}
//             onPageChange={handlePageChange}
//             {...props}
//             className={className}
//         />
//     );
// };
// RSPager.propTypes = {
//     data: PropTypes.array,
//     change: PropTypes.func,
//     isGallery: PropTypes.bool,
//     config: PropTypes.object,
//     className: PropTypes.string,
// };

// export default memo(RSPager);
export { default } from 'Pages/KendoDocs/CommonComponents/ResPager'