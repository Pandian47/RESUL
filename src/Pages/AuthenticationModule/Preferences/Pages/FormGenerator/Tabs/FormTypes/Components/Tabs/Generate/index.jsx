import { COPIED_SUCCESSFULLY, COPY, GENERATE_HTML_SNIPPET } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { baseURL } from 'Constants/EndPoints';
import { Environment } from '../../../constant';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';
import RSTooltip from 'Components/RSTooltip';
import *  as placeholder  from 'Constants/GlobalConstant/Placeholders';

const Generate = ({ formDataValues, saveData, fromTellAFriend = false, formSubscription = false}) => {
    const [generatedResult, setGeneratedResult] = useState('');
    const [isCopied, setIsCopied] = useState('');
     let url = baseURL.split('//')[1].split('.')[0];
     let settingType = Environment[url];
     
     // Create envurl variable based on settingType
     const envurl = settingType === 'P' 
         ? 'https://formapi.resul.io' 
         : 'https://formapiv5.resul.io';
     
     const formscript = `${envurl}/js/form.js`;
    const generateHTMLContent = () => {
        const inputTypes = formDataValues?.formGenerationColumn;
        const submit = formDataValues?.submitSetting;
        const termsConditions = formDataValues?.tcTemplate;
                // <div id='Resul_Form' APIKEY='2196-f4f0811b_658c_45e7_9432_2f307b93c235-S-E' style='display: none'>
        //     <form method='Post' id='search-form' action='https://resu.io/Subscription/IndexInsertTemp/cust_f4f0811b_658c_45e7_9432_2f307b93c235/2196'>
        var result = `<html>
        <input type="hidden" id="hdnImageURL" value="${envurl}"/>
        <div id="Submitpopup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.1); backdrop-filter: blur(5px); justify-content: center; align-items: center; z-index: 999;">
        <div style="background: #fff; color: #2f353b; border-radius: 10px; width: 400px; max-width: 90%; box-shadow: 0 5px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif; text-align: center; padding: 30px 20px; position: relative;">
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
                <div style="background: #2f353b; color: #fff; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 30px; margin-bottom: 15px;">&#10003;</div>
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Thank You</h2>
                <span onclick="SubmitPopupClose();" style="position: absolute; top: 10px; right: 15px; font-size: 22px; cursor: pointer; font-weight: bold; color: #2f353b;">&times;</span>
            </div>
            <div style="font-size: 16px; line-height: 1.4;">
                <p>The form was submitted successfully.</p>
            </div>
        </div>
    </div>
     <div id='Resul_Form' APIKEY='${saveData?.data?.formId}-${saveData?.data?.tenantId}-${settingType}'>
            <form method='Post' id='search-form' action='${envurl}/Subscription/IndexInsertTemp/cust_${saveData?.data?.tenantId}/${saveData?.data?.formId}'>  
                <input type='hidden' value='' id='hdnrid' name='rid'>
            <input type='hidden' value='' id='hdnresulid' name='resulid'>
      <input type='hidden' value='' id='hdncid' name='cid'>
      <input id='hdnSourceURL' value='[[SourceURL]]' name='SourceURL' type='hidden'>
      <input value='0' id='hdnuniquecode' name='uniquecode' type='hidden'>
      <input id='hdnpagereferrerurl' value='[[RefURL]]' name='pagereferrerurl' type='hidden'>
      <input value='0' id='hdnIskycredirecturl' name='kycredirecturl' type='hidden'>
      <input value='0' id='hdnIskyc' name='iskyc' type='hidden'>
      <input type='hidden' value='[[GROUPCOUNT]]' id='hdngroupiconcount' name='groupiconcount'>
      <input type='hidden' value='no' id='hdnIsNotsubmit' name='Notsubmit'>
`;
//         let tempResult = inputTypes?.map((item, idx) => {
//             const { columnType, dataAttributeName, fieldDetails, columnName, content } = item;
//             //debugger;
//             console.log('dataAttributeName', dataAttributeName);
//             console.log('columnType', columnType);
//             let columnObj = {};
//             let temp = JSON.parse(fieldDetails)?.map((field) => {
//                 let tempField = field?.split(':');
//                 columnObj = {
//                     ...columnObj,
//                     [tempField?.[0]]: tempField?.[1],
//                 };
//             });
//             const { validation, txtplaceholder, validationtext, radval, comboval } = columnObj;
//             if (columnType === 'Textbox') {
//                 result += `<div class='row rp-form-row rp${columnType}' id='${
//                     columnType + '_' + dataAttributeName.replace(' ', '-')
//                 }' validationrequired='${validation}'>
//                             <div class='col-sm-3 col-xs-12 rp-form-label'>${columnName}</div> 
//                             <div class='col-sm-5 col-xs-12 rp-form-field'>
//                             <div class='form_field_loadIcons_placing seg_loaderCount hide'></div>
//                             <input type=${InputTypesContent[columnType]} class=Not name='${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' placeholder='${txtplaceholder}' validationrequired='${validation}' /> 
//                             </div>
//                             <div class='error-block'> 
//                             <div class='input-error' id='errmsg${
//                                 validationtext + columnType + '_' + dataAttributeName.replace(' ', '-')
//                             }'>*Required</div> 
//                             </div>
//                             </div>`;
//             } else if (columnType === 'Radio') {
//                 let tempRadVal = radval?.split('^')?.map((rad) => {
//                     return `<input type='radio' value='${rad}' name='${columnName}' />
//                     <span class='lbl'>${rad}</span>`;
//                 });
//                 result += `<div class='row rp-form-row rp${columnType}' id='rselected${
//                     '_' + dataAttributeName.replace(' ', '-')
//                 }' validationrequired='${validation}'>
//                             <div class='col-sm-3 col-xs-12 rp-form-label'>${columnName}</div>
//                             <div class='col-sm-5 col-xs-12 rp-form-field'>
//                             ${tempRadVal?.join('')}
//                             </div>
//                             <div class='error-block'>
//                             <div class='input-error' id='errmsgrselected${
//                                 '_' + dataAttributeName.replace(' ', '-')
//                             }'>*Required</div>
//                             </div>
//                             </div>`;
//             } else if (columnType === 'Combobox') {
//                 let tempComboVal = comboval?.split('^')?.map((combo) => {
//                     return `<option>${combo}</option>`;
//                 });
//                 result += `<div class='row rp-form-row rpCombo' id='combo${
//                     '_' + dataAttributeName.replace(' ', '-')
//                 }' validationrequired='${validation}'>
//                             <div class='col-sm-3 col-xs-12 rp-form-label'>${columnName}</div>
//                             <div class='col-sm-5 col-xs-12 rp-form-field'>
//                             <select class="Not" id="${dataAttributeName.replace(
//                                 ' ',
//                                 '-',
//                             )}" name="${dataAttributeName.replace(' ', '-')}">
//                             ${tempComboVal?.join('')}
//                             </select>
//                             </div>
//                             <div class='error-block'>
//                             <div class='input-error' id='errmsgcombo${
//                                 '_' + dataAttributeName.replace(' ', '-')
//                             }'>*Required</div>
//                             </div>
//                             </div>
//                             </div>`;
//             } else if (columnType === 'TextBlock') {
//                 result += `<div> 
//                 <span id="span_content" style="font-size: 14pt; font-family:mukta-bold; background-color: transparent; color: rgb(0, 0, 0);"> {Your form heading goes here}            </span>
//                     <br>
//                     <span style="font-size:10pt; background-color: transparent; color: rgb(0, 0, 0);">Lorem ipsum dolor sit amet, adipiscing elit, sed diam nonummy nibh euismod tincidunt.</span>
//               </div>
//               `;
//             } else if (columnType === 'TimeDate') {
//                 result += `<div class='row rp-form-row rp${InputTypesContent[columnType]}' id='timdate${
//                     '_' + dataAttributeName.replace(' ', '-')
//                 }' validationrequired='${validation}'>
//                 <div class='col-sm-3 col-xs-12 rp-form-label'>${columnName}</div> 
//                 <div class='col-sm-5 col-xs-12 rp-form-field'>
//                 <input  class=Not name='${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' placeholder='${txtplaceholder}' validationrequired='${validation}' /> 
//                             </div>
//                             <div class='error-block'> 
//                             <div class='input-error' id='errmsgtimdate${
//                                 '_' + dataAttributeName.replace(' ', '-')
//                             }'>*Required</div> 
//                             </div>
//                             </div>`;
//             } else if (columnType === 'Hidden') {
//                 result += `<input type="hidden" value="${columnName}" id="UserType" name="UserType">`;
//             } else if (columnType === 'Consent Checkbox') {
//                 result += `<div class='row rp-form-row rp${
//                     InputTypesContent.Consent
//                 }' id='opdata_${dataAttributeName.replace(' ', '-')}' validationrequired='${validation}'>
//                             <div class='col-sm-3 col-xs-12 rp-form-label'></div>
//                             <div class='col-sm-5 col-xs-12 rp-form-field'>
//                             <input type='checkbox' value='on' name='${dataAttributeName.replace(' ', '-')}' />
//                             <span class='lbl'>${columnName}</span>
//                             </div>
//                             <div class='error-block'>
//                             <div class='input-error' id='errmsgopdata${
//                                 '_' + dataAttributeName.replace(' ', '-')
//                             }'>*Required</div> 
//                             </div>
//                             </div>`;
//             } else if (columnType === 'checkbox') {
//                 result += `<div class='row rp-form-row rpcheckbox' id='opdata_${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' validationrequired='${validation}'>
//                 <div class='col-sm-3 col-xs-12 rp-form-label'>Prefered state</div>
//                 <div class='col-sm-5 col-xs-12 rp-form-field'>
//                   <input type='checkbox' value='chennai' name='${dataAttributeName.replace(' ', '-')}' />
//                   <span class='lbl'>chennai</span>
//                   <input type='checkbox' value='mumbai' name='${dataAttributeName.replace(' ', '-')} '/>
//                   <span class='lbl'>mumbai</span>
//                   <input type='checkbox' value='delhi' name='${dataAttributeName.replace(' ', '-')}' />
//                   <span class='lbl'>delhi</span>
//                 </div>
//                 <div class='error-block'>
//                   <div class='input-error' id='errmsgopdata_${dataAttributeName.replace(' ', '-')}'>*required</div>
//                 </div>
//               </div>
//         `;
//             } else if (columnType === 'GroupControl') {
//                 result += `<div id="divcountid1" idlimit=1 class="groupicongenerate row rp-form-row">
//                 <div class="col-sm-3 col-xs-12 rp-form-label">Participant 1</div>
//                 <div class="col-sm-9">
//                   <div class="row">
//                     <div class=''>
//                       <div class='col-sm-2 rp-form-field'>
//                         <select class='row Not' id='Grp_title_1' name='Grp_title_1' style='margin-left:0;'>
//                           <option>Mr</option>
//                           <option>Mrs</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div class='hide'>
//                       <div class='col-sm-5 rp-form-field'>
//                         <input name='Grp_name_1' type='text' placeholder='Full name' class='' />
//                       </div>
//                     </div>
//                     <div class=''>
//                       <div class='col-sm-3 rp-form-field'>
//                         <input name='Grp_firstname_1' type='text' placeholder='First name' class='' />
//                       </div>
//                     </div>
//                     <div class=''>
//                       <div class='col-sm-2 rp-form-field'>
//                         <input name='Grp_lastname_1' type='text' placeholder='Last name' class='' />
//                       </div>
//                     </div>
//                     <div class=''>
//                       <div class='error-block' style='margin-left: 0;'>
//                         <div class='input-error' id='Grp_email_error1'>*Invalid email</div>
//                       </div>
//                       <div class='col-sm-3 rp-form-field'>
//                         <input name='Grp_email_1' type='text' placeholder='Email ID' class='' />
//                       </div>
//                     </div>
//                     <div class=''>
//                       <div class='col-sm-2 rp-form-field row'>
//                         <input name='Grp_mobile_1' type='text' placeholder='Mobile' class='' />
//                       </div>
//                     </div>
//                     <img id='grpaddicon' src='https://resulticks.team/images/plus-fill-small.svg' class='addRowIcon' title='Add' onclick='addgroup(this)' width='20px' height='20px' style='cursor:pointer;color: #06c  !important;margin-top: 14px;width: 15px;position: relative;margin-left:10px;' />
//                   </div>
//                 </div>
//               </div>
//         `;
//             } else if (columnType === 'CommentRating') {
//                 result += `<div class="row rp-form-row" id="cmtsurvey_${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}" validationrequired="no">
//                 <label class="col-sm-4 col-xs-12 rp-form-label">Enter your comments question</label>
//                 <div class="col-sm-8 col-xs-12 rp-form-field commentsQuestions">
//                     <grammarly-extension data-grammarly-shadow-root="true" class="dnXmp" style="position: absolute; top: 0px; left: 0px; pointer-events: none;"></grammarly-extension>
//                     <grammarly-extension data-grammarly-shadow-root="true" class="dnXmp" style="position: absolute; top: 0px; left: 0px; pointer-events: none;"></grammarly-extension>
//                     <textarea maxlength="500" name="1234Testing" rows="2" cols="10" placeholder="Enter your comments" onkeyup="return isNumbercount(this)" style="width: 100%;" spellcheck="false"></textarea>
//                     <small class="pull-right" style="margin-top: 5px; color: #666;"><span class="countshow" id="spncount">0</span><span>/500</span></small>
//                     <div class="error-block"><div class="input-error" id="errmsmobilenumbercmtsurvey031_1234Testing">*Required</div></div>
//                 </div>
//             </div>

            

//             `;
//             } else if (columnType === 'RangeSlider') {
//                 result += `<div class="row rp-form-row" id="rangeslider_Staff" validationrequired="no">
//                 <input type="hidden" name="Staff" id="Staff" value="" /> <label class="col-sm-4 col-xs-12 rp-form-label">Enter your slider question</label>
//                 <div class="col-sm-8 col-xs-12 rp-form-field">
//                     <div class="bgWhite border-wrap col-xs-12 padding20 margin-B0">
//                         <ul class="previewRangeSlider">
//                             <li>Bad</li>
//                             <li>Good</li>
//                             <li>Very good</li>
//                         </ul>
//                         <div id="div_Staff" class="slidecontainer" style="--custom-radius: 50%; --custom-thumb-color: #42b708;">
//                             <input type="range" min="0" max="100" value="0" class="slider" id="myRange_Staff" style="background: linear-gradient(90deg, rgb(204, 0, 0) 0%, rgb(102, 204, 51)) 100% center;" />
//                             <div class="sliderBlk"><span id="sliderValue_Staff" slicolumn="Staff">0</span></div>
//                         </div>
//                     </div>
//                     <div class="error-block"><div class="input-error" id="errmsmobilenumberrangeslider0_Staff">*Required</div></div>
//                 </div>
//             </div>
//             `;
//             } else if (columnType === 'Matrix') {
//                 result += `<div class="row rp-form-row" id='matrixrating_${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' validationrequired='${validation}'>
//                 <label class="col-sm-4 col-xs-12 rp-form-label"> Enter your Matrix Rating Scale question</label>
//                 <div class="col-sm-8 col-xs-12 rp-form-field">
//                     <table border="0" cellpadding="0" cellspacing="0" class="previewMatrixRating content-grid table-responsive">
//                         <thead>   Define column name with in <thead>
//                             <tr>
//                                 <td>&nbsp;</td>
//                                 <td>column 1<br _moz_dirty="true" /></td>   Column name is  “column 1”
//                                 <td><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">column 2</span><br _moz_dirty="true" /></td>  Column name is  “column 2”
            
//                                 <td><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">column 3</span><br _moz_dirty="true" /></td>
//                                 <td><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">column 4</span><br _moz_dirty="true" /></td>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td>
//                                     <span>Row 1<br _moz_dirty="true" /></span>     Define Row name in <Span> tag
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^1_column^1" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^1_column^2" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^1_column^3" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^1_column^4" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td>
//                                     <span><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">Row 2</span><br _moz_dirty="true" /></span>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^2_column^1" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^2_column^2" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^2_column^3" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^2_column^4" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td>
//                                     <span><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">Row 3</span><br _moz_dirty="true" /></span>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^3_column^1" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^3_column^2" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^3_column^3" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^3_column^4" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td>
//                                     <span><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">Row 4</span><br _moz_dirty="true" /></span>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^4_column^1" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^4_column^2" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^4_column^3" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^4_column^4" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td>
//                                     <span><span style="font-family: mukta-regular; -webkit-text-stroke-width: 0.0016px;">Row 5</span><br _moz_dirty="true" /></span>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^5_column^1" name="Purchase_Type" class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^5_column^2" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^5_column^3" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                                 <td>
//                                     <label><input type="checkbox" value="Row^5_column^4" name='${dataAttributeName.replace(
//                                         ' ',
//                                         '-',
//                                     )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                     <div class="error-block"><div class="input-error" id='errmsgmatrixrating_${dataAttributeName.replace(
//                         ' ',
//                         '-',
//                     )}'>*Required</div></div>
//                 </div>
//             </div>


//             <div class="row rp-form-row" id='matrixrating_${dataAttributeName.replace(
//                 ' ',
//                 '-',
//             )}' validationrequired='${validation}'>
//     <label class="col-sm-4 col-xs-12 rp-form-label"> Enter your Matrix Rating Scale question</label>
//     <div class="col-sm-8 col-xs-12 rp-form-field">
//         <table border="0" cellpadding="0" cellspacing="0" class="previewMatrixRating content-grid table-responsive">
//             <thead>
//                 <tr>
//                     <td>&nbsp;</td>
//                     <td>Column value</td>
//                     <td>Column value</td>
//                     <td>Column value</td>
//                     <td>Column value</td>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr>
//                     <td><span>Row value</span></td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td><span>Row value</span></td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td><span>Row value</span></td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td><span>Row value</span></td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td><span>Row value</span></td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                     <td>
//                         <label><input type="radio" value="Row^value_Column^value" name='${dataAttributeName.replace(
//                             ' ',
//                             '-',
//                         )}' class="checkbox checkboxquestion" /><span class="lbl"></span></label>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//         <div class="error-block"><div class="input-error" id='errmsgmatrixrating_${dataAttributeName.replace(
//             ' ',
//             '-',
//         )}'>*Required</div></div>
//     </div>
// </div>

//             `;
//             } else if (columnType === 'multichoice') {
//                 const curr = formDataValues?.formGenerationColumn?.filter((item) => item.columnType === 'multichoice');
//                 const formatData = JSON.parse(curr[0].fieldDetails);
//                 const filtered = formatData.filter((data) => data.includes('MCchoicetype'))[0].split(':')[1];
//                 console.log('filtered', filtered);
//                 if (filtered === 'C') {
//                     result += `<div class="row rp-form-row" id='multichoice_${dataAttributeName.replace(
//                         ' ',
//                         '-',
//                     )}' validationrequired="no">
//                 <label class="col-sm-4 col-xs-12 rp-form-label">Enter your Multiple choise Question<br _moz_dirty="true" /></label>
//                 <div class="col-sm-8 col-xs-12 rp-form-field">
//                     <ul class="previewMultiChoice">
//                         <li>
//                             <label style="position: relative;">
//             <input type="checkbox" value="Question 1" name='${dataAttributeName.replace(
//                 ' ',
//                 '-',
//             )}' class="checkbox checkboxquestion" /><span class="lbl">Question 1</span></label>
//                         </li>
//                         <li>
//                             <label style="position: relative;"><input type="checkbox" value="Question 2" name='${dataAttributeName.replace(
//                                 ' ',
//                                 '-',
//                             )}' class="checkbox checkboxquestion" /><span class="lbl">Question 2</span></label>
//                         </li>
//                         <li>
//                             <label style="position: relative;"><input type="checkbox" value="Question 3" name='${dataAttributeName.replace(
//                                 ' ',
//                                 '-',
//                             )}' class="checkbox checkboxquestion" /><span class="lbl">Question 3</span></label>
//                         </li>
//                     </ul>
//                     <div class="error-block"><div class="input-error" id='errmsgmultichoice_${dataAttributeName.replace(
//                         ' ',
//                         '-',
//                     )}'>*Required</div></div>
//                 </div>
//             </div>
//                 `;
//                 } else if (filtered === 'R') {
//                     result += `<div class="row rp-form-row" id='multichoice_${dataAttributeName.replace(
//                         ' ',
//                         '-',
//                     )} validationrequired="no">
//     <label class="col-sm-4 col-xs-12 rp-form-label">Enter your Multiple choise Question<br _moz_dirty="true" /></label>
//     <div class="col-sm-8 col-xs-12 rp-form-field">
//         <ul class="previewMultiChoice">
//             <li>
//                 <label style="position: relative;"><input type="radio" value="Question 1" name='${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' class="checkbox checkboxquestion" /><span class="lbl">Question 1</span></label>
//             </li>
//             <li>
//                 <label style="position: relative;"><input type="radio" value="Question 2" name='${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' class="checkbox checkboxquestion" /><span class="lbl">Question 2</span></label>
//             </li>
//             <li>
//                 <label style="position: relative;"><input type="radio" value="Question 3" name='${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )}' class="checkbox checkboxquestion" /><span class="lbl">Question 3</span></label>
//             </li>
//         </ul>
//         <div class="error-block"><div class="input-error" id='errmsgmultichoice_${dataAttributeName.replace(
//             ' ',
//             '-',
//         )}'>*Required</div></div>
//     </div>
// </div>

//             `;
//                 }
//             } else if (columnType === 'Rankrating') {
//                 result += `<div class="row rp-form-row" id='rnking_${dataAttributeName.replace(
//                     ' ',
//                     '-',
//                 )} validationrequired='${validation}'>
//                 <label class="col-sm-4 col-xs-12 rp-form-label">Enter your question</label>
//                 <div class="col-sm-8 col-xs-12 rp-form-field">
//                     <ul class="previewRanking">
//                         <li class="col-xs-12 rp-form-field">
//                             <div class="previewRankingAnswer">choise1</div>     
//                             <div class="previewRankingDropdown">
//                                 <select class="Not" id="123TestDev" name='${dataAttributeName.replace(' ', '-')}'>
//                                     <option value="0">-- Rank --</option>
//                                     <option value="choise1_1">1</option>       
//                                     <option value="choise1_2">2</option>
//                                     <option value="choise1_3">3</option>
//                                     <option value="choise1_4">4</option>
//                                     <option value="choise1_5">5</option>
//                                 </select>
//                             </div>
//                         </li>
//                         <li class="col-xs-12 rp-form-field">
//                             <div class="previewRankingAnswer">choise1</div>
//                             <div class="previewRankingDropdown">
//                                 <select class="Not" id='rnking_${dataAttributeName.replace(
//                                     ' ',
//                                     '-',
//                                 )} name='${dataAttributeName.replace(' ', '-')}'>
//                                     <option value="0">-- Rank --</option>
//                                     <option value="choise1_1">1</option>
//                                     <option value="choise1_2">2</option>
//                                     <option value="choise1_3">3</option>
//                                     <option value="choise1_4">4</option>
//                                     <option value="choise1_5">5</option>
//                                 </select>
//                             </div>
//                         </li>
//                         <li class="col-xs-12 rp-form-field">
//                             <div class="previewRankingAnswer">choise1</div>
//                             <div class="previewRankingDropdown">
//                                 <select class="Not" id='rnking063_${dataAttributeName.replace(
//                                     ' ',
//                                     '-',
//                                 )} name='${dataAttributeName.replace(' ', '-')}'>
//                                     <option value="0">-- Rank --</option>
//                                     <option value="choise1_1">1</option>
//                                     <option value="choise1_2">2</option>
//                                     <option value="choise1_3">3</option>
//                                     <option value="choise1_4">4</option>
//                                     <option value="choise1_5">5</option>
//                                 </select>
//                             </div>
//                         </li>
//                     </ul>
//                     <div class="error-block"><div class="input-error" id='errmsgrnking_${dataAttributeName.replace(
//                         ' ',
//                         '-',
//                     )}'>*Required</div></div>
//                 </div>
//             </div>
//             `;
//             } else if (columnType === 'starrating') {
//                 const curr = formDataValues?.formGenerationColumn?.filter((item) => item.columnType === 'starrating');
//                 const formatData = JSON.parse(curr[0].fieldDetails);
//                 const filtered = formatData.filter((data) => data.includes('SRRatingType'))[0].split(':')[1];

//                 if (filtered === 'Heart') {
//                     result += `<div class="row rp-form-row rpRating" id="starRating047_Qualification" validationrequired="no">
//                 <input type="hidden" value="" id="hdn43" name="Qualification" />
//             <label class="col-sm-4 col-xs-12 rp-form-label">Enter your star Rating<br _moz_dirty="true" /></label>
//                 <div class="col-sm-5 col-xs-12 rp-form-field">
//                 <ul customcss="#66cc33" class="previewRating heartRating" id="ulunique43">   
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,43)" abox="1" id="rateselect1" rel="tooltip" data-placement="top" data-original-title="Terrible"><i class="icon-heart-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,43)" abox="2" id="rateselect2" rel="tooltip" data-placement="top" data-original-title="Bad"><i class="icon-heart-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,43)" abox="3" id="rateselect3" rel="tooltip" data-placement="top" data-original-title="Ok"><i class="icon-heart-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,43)" abox="4" id="rateselect4" rel="tooltip" data-placement="top" data-original-title="Good"><i class="icon-heart-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,43)" abox="5" id="rateselect5" rel="tooltip" data-placement="top" data-original-title="Great"><i class="icon-heart-small icon-md"></i></a>
//             </li>
//         </ul>
//         <div class="error-block"><div class="input-error" id="errmsmobilenumberstarRating047_Qualification">*Required</div></div>
//     </div>
// </div>`;
//                 } else if (filtered === 'Smiley') {
//                     result += `<div class="row rp-form-row rpRating" id="starRating041_Region" validationrequired="no">
//     <input type="hidden" value="" id="hdn50" name="Region" /><label class="col-sm-4 col-xs-12 rp-form-label">Enter your question</label>
//     <div class="col-sm-5 col-xs-12 rp-form-field">
//         <ul customcss="#66cc33" class="previewRating smileyRating" id="ulunique50">
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,50)" abox="1" id="rateselect1" rel="tooltip" data-placement="top" data-original-title="Terrible"><i class="icon-smiley7-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,50)" abox="2" id="rateselect2" rel="tooltip" data-placement="top" data-original-title="Bad"><i class="icon-smiley4-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,50)" abox="3" id="rateselect3" rel="tooltip" data-placement="top" data-original-title="Ok"><i class="icon-smiley8-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,50)" abox="4" id="rateselect4" rel="tooltip" data-placement="top" data-original-title="Good"><i class="icon-smiley2-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,50)" abox="5" id="rateselect5" rel="tooltip" data-placement="top" data-original-title="Great"><i class="icon-smiley1-small icon-md"></i></a>
//             </li>
//         </ul>
//         <div class="error-block"><div class="input-error" id="errmsmobilenumberstarRating041_Region">*Required</div></div>
//     </div>
// </div>`;
//                 } else if (filtered === 'Star') {
//                     result += `<div class="row rp-form-row rpRating" id="starRating044_AB-Account-Type" validationrequired="no">
//     <input type="hidden" value="2" id="hdn56" name="AB_Account_Type" /><label class="col-sm-4 col-xs-12 rp-form-label">Enter your question</label>
//     <div class="col-sm-5 col-xs-12 rp-form-field">
//         <ul customcss="#66cc33" class="previewRating commonRating" id="ulunique56">
//             <li class="">
//                 <a href="javascript:;" class="active" onclick="clickstar(this,56,)" abox="1" id="rateselect1" rel="tooltip" data-placement="top" data-original-title="Terrible" style="color: rgb(102, 204, 51);">
//                     <i class="icon-star-small icon-md"></i>
//                 </a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,56)" class="active" abox="2" id="rateselect2" rel="tooltip" data-placement="top" data-original-title="Bad" style="color: rgb(102, 204, 51);">
//                     <i class="icon-star-small icon-md"></i>
//                 </a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" class="" onclick="clickstar(this,56)" abox="3" id="rateselect3" rel="tooltip" data-placement="top" data-original-title="Ok"><i class="icon-star-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" class="" abox="4" onclick="clickstar(this,56)" id="rateselect4" rel="tooltip" data-placement="top" data-original-title="Good"><i class="icon-star-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" class="" abox="5" onclick="clickstar(this,56)" id="rateselect5" rel="tooltip" data-placement="top" data-original-title="Great"><i class="icon-star-small icon-md"></i></a>
//             </li>
//         </ul>
//         <div class="error-block"><div class="input-error" id="errmsmobilenumberstarRating044_AB-Account-Type">*Required</div></div>
//     </div>
// </div>`;
//                 } else if (filtered === 'Thumb') {
//                     result += `<div class="row rp-form-row rpRating" id="starRating06_123Dev" validationrequired="no">
//     <input type="hidden" value="" id="hdn6" name="123Dev" /><label class="col-sm-4 col-xs-12 rp-form-label">Enter your question</label>
//     <div class="col-sm-5 col-xs-12 rp-form-field">
//         <ul customcss="#66cc33" class="previewRating thumbRating" id="ulunique6">
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,6)" abox="1" id="rateselect1" rel="tooltip" data-placement="top" data-original-title="Terrible"><i class="icon-like-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,6)" abox="2" id="rateselect2" rel="tooltip" data-placement="top" data-original-title="Bad"><i class="icon-like-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,6)" abox="3" id="rateselect3" rel="tooltip" data-placement="top" data-original-title="Ok"><i class="icon-like-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,6)" abox="4" id="rateselect4" rel="tooltip" data-placement="top" data-original-title="Good"><i class="icon-like-small icon-md"></i></a>
//             </li>
//             <li class="">
//                 <a href="javascript:;" onclick="clickstar(this,6)" abox="5" id="rateselect5" rel="tooltip" data-placement="top" data-original-title="Great"><i class="icon-like-small icon-md"></i></a>
//             </li>
//         </ul>
//         <div class="error-block"><div class="input-error" id="errmsmobilenumberstarRating06_123Dev">*Required</div></div>
//     </div>
// </div>`;
//                 }
//             }
//         });
//         {
//             termsConditions &&
//                 (result += `<div class="row rp-form-row termsandconditions_block">
//             <div class="col-sm-4 col-xs-12 rp-form-label">&nbsp;</div>
//             <div class="col-sm-8 col-xs-12 rp-form-field">
//               <label>
//                 <input class="checkbox" id="chkterms" name="checkbox" type="checkbox">
//                 <span class="lbl"> I agree to the <a href="javascript:;">Terms &amp; Conditions</a>  
//                 </span>
//               </label>
//               <div class="error-block">
//                 <div class="input-error" id="errmsgPersonterms">*Required</div>
//               </div>
//             </div>
//           </div>
//     `);
//         }
//         {
//             submit &&
//                 (result += `<div class='row rp-form-row buttons_block'>
//         <div class='col-sm-4 col-xs-12 rp-form-label'>&nbsp;</div>
//         <div class='col-sm-5 col-xs-12 rp-form-field'>
//           <a class='btn btn-link pull-left' onclick='clearpostsubmit();' style='margin-right:10px;'>Cancel</a>
//           <div class='submit_loadIcons_outerBlk pull-left'>
//             <div class='submit_loadIcons_placing seg_loaderCount hide'></div>
//             <input type=button value='Submit' onclick=formdatapost('undefined') />
//           </div>
//         </div>
//       </div>
//     `);
//         }

        result += `</form>

        </div>
       <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script type="text/javascript" src="https://run.resulticks.com/scripts/ui-bootstrap.js"></script>
<script type="text/javascript" src="${formscript}"></script>
<script>
 function formdatapost(ctrl) { var objvalidation = formEmbedcodevalidation(); if (objvalidation) { $.ajax({ async: false, type: "POST", url: $("#search-form").attr("action"), data: $("#search-form").serialize(), success: function (data) { clearpostsubmit(); } }); } }
</script>
        </html>`;
        return result;
    };

    const generateTellAFriendContent = () => {
        let formValues = JSON.parse(formDataValues?.htmlCodeClient);
        let count = formValues?.CountParticipant
        return `<div id="Classicdiv">

            <input type="hidden" value="Subscription/TellFriendInsert/dbId=cust_${saveData?.data?.tenantId}/formid=${saveData?.data?.formId}" id="hdnq">
            <form method="Post" id="search-form" action="Subscription/TellFriendInsert/cust_${saveData?.data?.tenantId}/${saveData?.data?.formId}">
                <input type="hidden" name="groupiconcount" id="groupiconcount" value="0">
                <input type="hidden" name="rid" id="rid" value="0">
                <input name="numberOfPeopleAdded" type="text" class=" emojifont required" placeholder=" " autocomplete="new-password" value="${count}">
                <input type="hidden" name="cid" id="cid" value="0">
                <input type="hidden" name="pagereferrerurl" id="hdnpagereferrerurl" value="${window.location.origin}/Recipients/AddFormGeneration">
                <input type="hidden" name="shortcode" id="hdnshortcode">
                <input type="hidden" name="SourceURL" id="hdnSourceURL" value="${window.location.origin}/">
                <div id="divformcreation">

                </div>
            </form>
        </div>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="${window.location.origin}/scripts/TellFriendJS.js"></script>
    `
    }
    useEffect(() => {
        var temp
        if(fromTellAFriend){
            temp = generateTellAFriendContent();
        }else{
            temp = generateHTMLContent();
        }
        setGeneratedResult(temp);
                
    }, []);

  //  console.log('Form data val;ues :::: ', formDataValues);
    return (
        <div className="">
            {/* <span className="mb30">Generate</span> */}
            <div className="text-right my20">
                {
                    <div className="d-flex justify-content-between ">
                     <h4 className="m0">{GENERATE_HTML_SNIPPET}</h4>
                        <div className='rs-qr-link-copy position-relative right5'>
                            {isCopied && <small className="color-primary-green lh0">{COPIED_SUCCESSFULLY}</small>}
                        <RSTooltip text={COPY} className="lh0">
                            <i
                                onClick={async () => {
                                    if ('clipboard' in navigator) {
                                        try {
                                            await navigator.clipboard.writeText(generatedResult).then(() => {
                                                setIsCopied(true);
                                                setTimeout(() => {
                                                    setIsCopied(false);
                                                }, 1500);
                                            });
                                        } catch (err) {
                                                                                    }
                                    }
                                }}
                                className={`${copy_medium} color-primary-blue icon-md`}
                            ></i>
                        </RSTooltip>
                            </div>
                    </div>
                }
            </div>
            <div className="EmbedAPI-bordered">
                <p className="css-scrollbar">
                    <SyntaxHighlighter
                        lineProps={{
                            style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                        }}
                        wrapLines={true}
                        language={'jsx'}
                        style={solarizedlight}
                        customStyle={{ backgroundColor: 'white', paddingTop: 0 }}
                    >
                        {generatedResult}
                    </SyntaxHighlighter>
                </p>
            </div>
        </div>
    );
};

export default Generate;

