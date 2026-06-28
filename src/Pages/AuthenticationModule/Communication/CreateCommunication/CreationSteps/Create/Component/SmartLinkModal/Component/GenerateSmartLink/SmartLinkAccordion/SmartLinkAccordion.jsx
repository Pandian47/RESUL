import { circle_minus_fill_edge_large, circle_plus_fill_edge_large, delete_medium } from 'Constants/GlobalConstant/Glyphicons';
// import React, { memo } from 'react';
// ///packages
// import { Accordion, Row, Col } from 'react-bootstrap';
// import { useFieldArray, useFormContext } from 'react-hook-form';
// //custom comps
// import RSTooltip from 'Components/RSTooltip';
// // //components
// import WebSection from '../WebAccordion/WebSection';
// import MobileSection from '../MobileAccordion/MobileSection';

// const SmartLinkAccordion = (props) => {
//     const { field, index, inputType, platformName, setActiveIndex, activeIndex, fieldName, disableDiv } = props;
//     const {
//         control,
//         formState: { isValid, submitCount, errors, isDirty },
//     } = useFormContext();

//     const { remove } = useFieldArray({
//         control,
//         name: fieldName,
//     });

//     const accordianIcon = (index) =>
//         activeIndex === index
//             ? `${circle_minus_fill_edge_large} icon-md rs-accordion-icon-collapse`
//             : `${circle_plus_fill_edge_large} icon-md rs-accordion-icon-expand`;

//     const removePlatform = (idx) => {
//         remove(idx);
//         if (idx !== 0) {
//             const temp = { ...state };
//             const currentTitle = temp.tabs[idx].title;
//             let prevTitle;
//             if (idx > 1) {
//                 prevTitle = temp.tabs[idx - 1].title;
//             }
//             temp.tabs.splice(idx, 1);
//             const tempPlatForm = [...platforms];
//             if (!platforms.includes(currentTitle) && currentTitle !== 'Mobile') {
//                 tempPlatForm.push(currentTitle);
//             }
//             if (prevTitle && !platforms.includes(prevTitle)) tempPlatForm.push(prevTitle);
//             setPlatforms(tempPlatForm);
//             setState(temp);
//         }
//         if (isGenerateLink) setIsGenerateLink(false);
//     };
//     return (
//         <div>
//             <Accordion activeKey={activeIndex} key={field.id}>
//                 <Accordion.Item eventKey={index}>
//                     <Accordion.Header onClick={(e) => setActiveIndex(index)}>
//                         {/* <Row>
//                             <Col>
//                                 <RSTooltip text="Add mobile device" position="top">
//                                     <i className={`${accordianIcon(index)}`} onClick={(e) => setActiveIndex(index)} />
//                                 </RSTooltip>
//                             </Col>

//                             <Col>
//                                 <span>
//                                     {inputType === 'WEB' ? 'Web' : platformName ? platformName : 'Mobile Platform'}
//                                 </span>
//                             </Col>
//                             <Col>
//                                 <RSTooltip text="Delete" position="top">
//                                     <i
//                                         className={`${
//                                             index !== 0 &&
//                                             `${circle_minus_fill_edge_large} icon-md color-primary-red rs-accordion-item-remove`
//                                         }`}
//                                         onClick={() => removePlatform(index)}
//                                     />
//                                 </RSTooltip>
//                             </Col>
//                         </Row> */}

//                         <RSTooltip text="Add mobile device" position="top">
//                             <i className={`${accordianIcon(index)}`} onClick={(e) => setActiveIndex(index)} />
//                         </RSTooltip>
//                         <span>{inputType === 'WEB' ? 'Web' : platformName ? platformName : 'Mobile Platform'}</span>
//                         <RSTooltip text="Delete" position="top">
//                             <i
//                                 className={`${
//                                     index !== 0 &&
//                                     `${delete_medium} icon-md color-primary-red rs-accordion-item-remove position-absolute right15`
//                                 }`}
//                                 onClick={() => removePlatform(index)}
//                             />
//                         </RSTooltip>
//                     </Accordion.Header>
//                     <Accordion.Body>
//                         <WebSection {...props} />
//                         <MobileSection {...props} />
//                     </Accordion.Body>
//                 </Accordion.Item>
//             </Accordion>
//         </div>
//     );
// };

// export default memo(SmartLinkAccordion);
