import { COPIED_SUCCESSFULLY, COPY, EMBEDED_SCRIPT } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { baseURL } from 'Constants/EndPoints';
import { Environment } from '../../../constant';
import SyntaxHighlighter, { solarizedlight } from 'Utils/modules/prismSyntaxHighlight';
import RSTooltip from 'Components/RSTooltip';
import *  as placeholder  from 'Constants/GlobalConstant/Placeholders';

const Embed = ({ saveData, formDataValues, fromTellAFriend = false, formSubscription = false }) => {
    let url = baseURL.split('//')[1].split('.')[0];
    const [isCopied, setIsCopied] = useState('');
    let settingType = Environment[url];
    
    // Create envurl variable based on settingType
    const envurl = settingType === 'P' 
        ? 'https://formapi.resul.io' 
        : 'https://formapiv5.resul.io';
    
    const formscript = `${envurl}/js/form.js`;
    const generateTellAFriendContent = () => {
        let formValues = JSON.parse(formDataValues?.htmlCodeClient);
        let count = formValues?.CountParticipant
         
        return `<div id="Classicdiv">
            <input type="hidden" id="hdnImageURL" value="${envurl}"/>

            <input type="hidden" value="Subscription/TellFriendInsert/dbId=cust_${saveData?.data?.tenantId}/formid=${saveData?.data?.formId}" id="hdnq">
            <form method="Post" id="search-form" action="${envurl}/Subscription/TellFriendInsert/cust_${saveData?.data?.tenantId}/${saveData?.data?.formId}">
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
    const embedCode = fromTellAFriend ? generateTellAFriendContent() :
     [
        `<input type="hidden" id="hdnImageURL" value="${envurl}"/>
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
            <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
            <script type="text/javascript" src="https://run.resulticks.com/scripts/ui-bootstrap.js"></script>
            <script type="text/javascript" src="${formscript}"></script>
        </div>`,
    ];
    

    return (
        <div>
            <div className="text-right my20">
                {
                    <div className="d-flex justify-content-between ">
                        <h4 className="mb0">{EMBEDED_SCRIPT}</h4>
                        <div className='rs-qr-link-copy position-relative right5'>
                            {isCopied && <small className="color-primary-green lh0">{COPIED_SUCCESSFULLY}</small>}
                            <RSTooltip text={COPY} className="lh0">
                                <i
                                    onClick={async () => {
                                        if ('clipboard' in navigator) {
                                            try {
                                                await navigator.clipboard.writeText(embedCode).then(() => {
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
                <Row>
                    <Col sm={12}>
                        <div>
                            <p className="css-scrollbar">
                                <SyntaxHighlighter
                                    lineProps={{
                                        style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' },
                                    }}
                                    wrapLines={true}
                                    language={'html'}
                                    style={solarizedlight}
                                    customStyle={{ backgroundColor: 'white', paddingTop: 0 }}
                                >
                                    {embedCode}
                                </SyntaxHighlighter>
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Embed;

