import { useEffect, useState } from 'react';
import { Card, Container } from 'react-bootstrap';

import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const WebSDKModal = ({ show, handleCloseWeb, value }) => {
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(show);
    }, [show]);

    return (
        <RSModal
            show={isShow}
            size="lg"
            header={'Web SDK'}
            handleClose={handleCloseWeb}
            body={
                <div className="form-group mb0">
                    <Container>
                        <Card className="css-scrollbar" style={{ height: '215px', padding: '10px' }}>
                            <p>{`!function(){"use strict";var e=document.createElement("SCRIPT"),t=document.createElement("SCRIPT"),i=document.createElement("SCRIPT"),s=document.createElement("SCRIPT"),n=document.createElement("img"),a=!1;e.setAttribute("src","https://static.getclicky.com/js"),e.setAttribute("type","text/javascript"),e.setAttribute("async","true"),t.setAttribute("src","https://sdk.resu.io/scripts/pathanalyzer.js"),t.setAttribute("type","text/javascript"),i.setAttribute("src","https://sdk.resu.io/scripts/reswebnotify.js"),i.setAttribute("type","text/javascript"),s.setAttribute("src","https://sdk.resu.io/scripts/resclient.min.js"),s.setAttribute("type","text/javascript"),document.body.appendChild(e),n.setAttribute("src","https://static.getclicky.com/101108671ns.gif"),n.setAttribute("height","1"),n.setAttribute("width","1"),n.setAttribute("border","0"),n.setAttribute("style","display:none"),document.body.appendChild(n),document.body.appendChild(t),document.body.appendChild(i),document.body.appendChild(s),e.onload=e.onreadystatechange=function(){a||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(a=!0,function(){if(a){try{clicky.init(101108671)}catch(e){}setTimeout(function(){fnTrackUrl("cc33cd4b-2fea-4b94-9123-bb7d48ff673e")},2e3),setTimeout(function(){fnResWebNotify("cc33cd4b-2fea-4b94-9123-bb7d48ff673e")},2e3);try{setTimeout(function(){var e=new ClientJS,t=e.getFingerprint(),i=e.getDevice(),s=e.getDeviceType(),n=e.getDeviceVendor(),a=e.getCPU(),c=e.getScreenPrint(),r=(e.getColorDepth(),e.getCurrentResolution(),e.getAvailableResolution(),e.getDeviceXDPI(),e.getDeviceYDPI(),e.getOS(),e.getOSVersion(),e.isWindows(),e.isMac(),e.isLinux(),e.isUbuntu(),e.isSolaris(),e.isMobile(),e.isMobileMajor(),e.isMobileAndroid(),e.isMobileOpera(),e.isMobileWindows(),e.isMobileBlackBerry(),e.isMobileIOS(),e.isIphone(),e.isIpad(),e.isIpod(),e.getBrowserData()),o=(e.getUserAgent(),e.getTimeZone()),d=e.getLanguage(),u=e.getSystemLanguage(),l=(r.browser,{ua:r.ua,browser:r.browser,name:r.name,engine:r.engine,os:r.os,device:r.device,cpu:r.cpu}),p=window.location,g=p.protocol+"//"+p.host+p.pathname;g=document.URL;var b={FP:t,device:i,deviceType:s,deviceVendor:n,timezone:o,language:d,sysLanguage:u,cpuType:a,screenPrint:c,browserData:l,dbId:"cc33cd4b-2fea-4b94-9123-bb7d48ff673e",urlreferrer:g,dpid:"",cpid:"",spid:"",rpid:"",chnlp:""};fnTrackUrlwithData("cc33cd4b-2fea-4b94-9123-bb7d48ff673e",b)},2e3)}catch(e){void 0}e=window,t=document,i="script",s="ga",e.GoogleAnalyticsObject=s,e.ga=e.ga||function(){(e.ga.q=e.ga.q||[]).push(arguments)},e.ga.l=1*new Date,n=t.createElement(i),c=t.getElementsByTagName(i)[0],n.async=1,n.src="https://www.google-analytics.com/analytics.js",c.parentNode.insertBefore(n,c),ga("create","UA-50653884-1","resulticks.com"),ga("send","pageview")}var e,t,i,s,n,c}(),e.onload=e.onreadystatechange=null,document.body.removeChild(e))}}();`}</p>
                        </Card>
                    </Container>
                </div>
            }
            footer={
                <div className="btn-container d-flex justify-content-end m0">
                    <RSSecondaryButton
                        className="color-secondary-blue"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `<script src='${value}.sdk' type='text/javascript'></script>`,
                            );
                        }}
                    >
                        Edit
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            handleCloseWeb(false);
                        }}
                    >
                        OK
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default WebSDKModal;
