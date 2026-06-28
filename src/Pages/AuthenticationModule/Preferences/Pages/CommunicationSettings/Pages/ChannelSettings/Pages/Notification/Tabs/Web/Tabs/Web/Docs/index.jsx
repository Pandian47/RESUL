import { getEnvironment } from 'Utils/modules/environment';
import { createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import Scrollspy from 'react-scrollspy';
import useQueryParams from 'Hooks/useQueryParams';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { saveWebPushTenantData } from 'Reducers/preferences/CommunicationSettings/request';
import { PDFExport } from '@progress/kendo-react-pdf';


const WebSDKIntegration = () => {
    const scrollRef = useRef();
    const wrapperRef = useRef();
    const location = useQueryParams('/communication');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState('');
    const env = getEnvironment();
    const urlBase = `sdk.resul.${env === 'TEAM' ? 'team' : 'io'}`;
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const pdfExportComponent = useRef(null);

    useEffect(() => {
        if (location?.isDDL === 'Download') {
            if (gridData) {
                pdfExportComponent.current.save();
            }
        }
        if (!!location) getData();
    }, [location, gridData]);

    const getData = async () => {
        const { status, tenantId } = await dispatch(
            saveWebPushTenantData({ clientId, userId, departmentId, webnotifySettingId: location?.id }),
        );
        if (status) {
            setGridData(tenantId);
        }
    };
    const handleScroll = () => {
        let scrollYAxis = window.scrollY;
        let bottomHeight = window.innerHeight + scrollYAxis;
        if (scrollYAxis > 45) {
            scrollRef.current?.classList.add('stickyScrollTop');
        } else {
            scrollRef.current?.classList.remove('stickyScrollTop');
        }
        if (bottomHeight > wrapperRef.current.clientHeight + 160) {
            scrollRef.current?.classList.add('stickyScrollBottom');
        } else {
            scrollRef.current?.classList.remove('stickyScrollBottom');
        }
    };

    const onScrollMenu = (id) => {
        const element = document.getElementById(id);
        window.scroll(element.offsetLeft, element.offsetTop - 90);
    };

    return (
        <div className="page-content-holder web-sdk-integration-docs">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={'Web SDK Integration'}
                rightCommonMenus
                isBack
                isBuDisabled
                isAgencyDisabled
                backPath={'/preferences/communication-settings'}
                state={createCommunicationSettingsNavState('notification', {
                    subfrom: 'WP',
                    notificationTabId: NOTIFICATION_TAB_ID.WEB,
                })}
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container className="page-content px0" ref={wrapperRef}>
                {
                    <PDFExport
                        keepTogether="p"
                        // paperSize="A4"
                        margin="1cm"
                        ref={pdfExportComponent}
                        paperSize="auto"
                        // margin={40}
                        fileName={`Web SDK Integration (Native) - ${new Date().getFullYear()}`}
                        author="RESUL"
                    >
                        <div className="rs-scrollspay-wrapper">
                            <div className="rs-scrollspay-menu css-scrollbar" ref={scrollRef}>
                                <Scrollspy
                                    items={[
                                        '1',
                                        '1.1',
                                        '1.2',
                                        '1.3',
                                        '1.4',
                                        '2',
                                        '3',
                                        '3.1',
                                        '3.2',
                                        '3.3',
                                        '3.4',
                                        '3.5',
                                        '3.6',
                                    ]}
                                    offset={-90}
                                    currentClassName="is-current"
                                >
                                    <li className="text-indent-left-first" onClick={() => onScrollMenu('1')}>
                                        <a href="javascript:void(0)">1. Introduction</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('1.1')}>
                                        <a href="javascript:void(0)">1.1 Scope</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('1.2')}>
                                        <a href="javascript:void(0)">1.2 Definitions, acronyms, and abbreviations</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('1.3')}>
                                        <a href="javascript:void(0)">1.3 Document conventions</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('1.4')}>
                                        <a href="javascript:void(0)">1.4 References</a>
                                    </li>
                                    <li className="text-indent-left-first" onClick={() => onScrollMenu('2')}>
                                        <a href="javascript:void(0)">2. Getting started with SDK setup</a>
                                    </li>
                                    <li className="text-indent-left-first" onClick={() => onScrollMenu('3')}>
                                        <a href="javascript:void(0)">3. Installing Web SDK</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('3.1')}>
                                        <a href="javascript:void(0)">3.1 Register</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('3.2')}>
                                        <a href="javascript:void(0)">3.2 Custom event tracking</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('3.3')}>
                                        <a href="javascript:void(0)">3.3 Client form data capture</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('3.4')}>
                                        <a href="javascript:void(0)">3.4 Conversion tracking</a>
                                    </li>
                                    <li className="text-indent-left-second" onClick={() => onScrollMenu('3.5')}>
                                        <a href="javascript:void(0)">3.5 Location update</a>
                                    </li>
                                    {/* <li className="text-indent-left-second" onClick={() => onScrollMenu('3.6')}>
                                        <a href="javascript:void(0)">3.6 Dynamic zone</a>
                                    </li> */}
                                </Scrollspy>
                            </div>
                            <div className="rs-scrollspay-content">
                                <section id="1">
                                    <h1>1. Introduction</h1>
                                    <p>
                                        Brands use a wide range of offline and online communication touchpoints with
                                        multiple identities across them. Resulticks analytics is a value-added analytics
                                        service to track and report website and native app traffic and app behavior.
                                        Integration to Resulticks analytics module enables the availability of a broad
                                        range of services such as user journey reporting, augmentation of customer data
                                        and creating or trigger campaigns. The generation of analytic services involves
                                        data capture using the software development kit (SDK). It involves generating
                                        the SDK code snippet by Resulticks application and embedding the code snippet
                                        onto a destination landing page(s) in a website and mobile app.
                                    </p>
                                    <p>
                                        This documentation introduces the basics of getting started guidance on enabling
                                        Resulticks analytic services for Web capabilities using the Web SDK package.
                                    </p>
                                </section>
                                <section id="1.1" className="text-indent-left-second">
                                    <h2>1.1 Scope</h2>
                                    <p>
                                        The document’s scope is limited to the audience involved in the initial
                                        application setup required by the product administrators and by the brand
                                        organization in providing information necessary for managing the mobile SDK
                                        setup.
                                    </p>
                                </section>
                                <section id="1.2" className="text-indent-left-second">
                                    <h2>1.2 Definitions, acronyms, and abbreviations</h2>
                                    <p>
                                        <table class="table table-bordered">
                                            <thead>
                                                <tr className="table-primary">
                                                    <th scope="col">Acronyms/ Definition</th>
                                                    <th scope="col">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>FCM</td>
                                                    <td>Firebase cloud messaging</td>
                                                </tr>
                                                <tr>
                                                    <td>GCM</td>
                                                    <td>Google cloud messaging</td>
                                                </tr>
                                                <tr>
                                                    <td>Mobile SDK</td>
                                                    <td>Software development kit for mobile application (app)</td>
                                                </tr>
                                                <tr>
                                                    <td>NFC</td>
                                                    <td>Near field communication</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </p>
                                </section>
                                <section id="1.3" className="text-indent-left-second">
                                    <h2>1.3 Document conventions</h2>
                                    <p>
                                        Read and understand the document conventions given below, considered throughout
                                        the document to understand the content/text.
                                    </p>
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr className="table-primary">
                                                <th scope="col">Style</th>
                                                <th scope="col">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Hyperlink</td>
                                                <td className="color-primary-blue">Text in blue color.</td>
                                            </tr>
                                            <tr>
                                                <td>Normal text</td>
                                                <td>Sentences/ paragraphs in grey color</td>
                                            </tr>
                                            <tr>
                                                <td>Note</td>
                                                <td>An essential message for consideration.</td>
                                            </tr>
                                            <tr>
                                                <td>Reference</td>
                                                <td>
                                                    The reference relates to the detailed additional information for
                                                    consideration.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Text highlighted in grey color</td>
                                                <td>
                                                    Text highlighted in gray colour refers to a code sample about the
                                                    subject.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Text in italics</td>
                                                <td>Code snippets considered as an example</td>
                                            </tr>
                                            <tr>
                                                <td>Text in bold</td>
                                                <td>An item/label in the software/product/application/services</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </section>
                                <section id="1.3" className="text-indent-left-second">
                                    <h2>1.4 References</h2>
                                    <p>
                                        The document’s references are the necessary information from Resulticks
                                        engineering, the product development team, and other related sources.
                                    </p>
                                </section>
                                <section id="2" className="mb0">
                                    <h1>2. Getting started with SDK setup</h1>
                                    <p>
                                        SDK is a set of components considered towards data collection for analytic
                                        purposes and targeting specific platforms such as the web. SDK responds to the
                                        requests from an authenticated app based on the unique identifier configured
                                        during the Web SDK integration.{' '}
                                    </p>
                                    <p>
                                        The prerequisites section details a set of environmental components required
                                        before enabling the SDK code at the respective endpoints.
                                    </p>
                                </section>
                                <section id="3" className="mb0">
                                    <h1>3. Installing Web SDK</h1>
                                    <p>
                                        To install the Web SDK, add the code snippet given below into the web domain
                                        HTML at the codebase body and paste the firebase-messaging-sw.js file into your
                                        web site hosted root folder if any folder change in service worker update the
                                        file path in the script tag “fcm_service_path”
                                    </p>
                                    <p>Use this Script tag:</p>
                                    <div className='box-design mb21'>
                                         <p>
                                        {`<script fcm_service_path = "/firebase-messaging-sw.js" src="https://${urlBase}/handlers/${gridData}.sdk" defer="defer"></script>`}
                                    </p>
                                    </div>
                                </section>
                                <section id="3.1" className="text-indent-left-second">
                                    <h2>3.1 Register</h2>
                                    <p>
                                        The function sends a push notification every time the authorization token is
                                        received/refreshed.
                                    </p>
                                    <h3>
                                        <b>Method - userRegister</b>
                                    </h3>
                                    <p>
                                        Use the method ‘userRegister’ for SDK user registration. In the JavaScript file
                                        related to the login page, paste the ‘userRegister’ method and calls the method
                                        after the user login function is successful.
                                    </p>
                                     <div className='box-design mb21'>
                                         <pre>
                                        <code>
                                            {`  var userDetails =  {
        "uniqueId":"",        //mandatory uniqueId.
        "email":"",           //optional
        "phone":"",           //optional
        "name":"",            //optional
        "profileUrl":"",      //optional
        "age":"",             //optional
        "dateOfBirth":"",     //optional
        "gender":""           //optional
  }

window.ReWebSDK.userRegister(userDetails);  //mandatory event
`}
                                        </code>
                                    </pre>
                                     </div>
                                    <p>Based on the above code snippet, the ‘uniqueId’ can be customized</p>
                                    <ul>
                                        <p>Enable the following parameters as mandatory at the code level:</p>
                                        <li>uniqueId</li>
                                    </ul>
                                    <h3>
                                        <b>Method – userLogout</b>
                                    </h3>
                                    <p>
                                        Use the method <b>userLogout</b> to <b>unsubscribe the FCM token </b> for a user
                                        from receiving a web push notification.
                                    </p>
                                    <div className='box-design'>
                                        <pre>
                                        <code>{`window.ReWebSDK.userLogout()`}</code>
                                    </pre>
                                    </div>
                                </section>
                                <section id="3.2" className="text-indent-left-second">
                                    <h2>3.2 Custom event tracking</h2>
                                    <p>
                                        The SDK provides a feature to set-up events related to the brand as the trigger
                                        point for communications. For example, consider a user of a bank. If the user
                                        visits an app page, reads about the personal loan, and then moves to a different
                                        page without filling in the form to see if he is eligible for a loan. Consider
                                        setting-up this user behavior as a custom event and use it as a trigger to
                                        retarget the specific user withpush notification (In-app message) instantly.
                                    </p>
                                    <ul>
                                        <p>Track the following two types of events using the listed two methods:</p>
                                        <div className='box-design'>
                                            <pre>
                                            <code>
                                                {`
    • eventName                                      //mandatory

    • Product detail should be given inside the data //optional data attribute

    Example :

    data: {                                          //Example data attribute
                                              
          productId: 'P234234',
          productName: 'Mobile Phone' 
          
          }`}
                                            </code>
                                        </pre>
                                        </div>
                                    </ul>
                                    <h3>
                                        <b>Method – customEvent</b>
                                    </h3>
                                    <p>Use the method customEvent to enable custom event tracking.</p>
                                    <div className='box-design'>
                                        <pre>
                                        <code>
                                            {`// Object syntax
 var cusEvent = {
                eventName: '' ,                        //mandatory eventName
                data: { 'any_attribute': '' }          //optional data attribute
                };
window.ReWebSDK.customEvent(cusEvent);                 //mandatory eventName

// Event type 1 - Example 1
var res1 = {
            eventName: 'add to cart'                  //mandatory eventName
            };
window.ReWebSDK.customEvent(resEvent1);               //mandatory event

// Event type 2 - Example 2
var res2 = {
            eventName: 'Product Purchased',           //mandatory eventName
            data: {                                   //optional data attribute
            productId: 'P234234',
            productName: 'Mobile Phone'
            }
 };
window.ReWebSDK.customEvent(resEvent2);               //mandatory event`}
                                        </code>
                                    </pre>
                                    </div>
                                </section>
                                <section id="3.3" className="text-indent-left-second">
                                    <h2>3.3 Client form data capture</h2>
                                    <p>
                                        Form data capture extracts information from an electronic form and converts it
                                        into data readable in electronic form. Tracks a brand's user behavior by data
                                        capturing refers to collecting related information through electronic documents
                                        such as any form. The brand tracks the user behavior like the 'Signup form' and
                                        the 'Application form'. At the backend, Resulticks provides support to track
                                        these forms by enabling the SDK package.
                                    </p>
                                    <h3>
                                        <b>Method – formCapture</b>
                                    </h3>
                                    <p>
                                        Use the method <b>formDataCapture</b> to collect the brand’s user details
                                        without any Resulticks web form.
                                    </p>
                                    <div className='box-design mb21'>
                                        <pre>
                                        <code>
                                            {`var formDetails= {
"formId":"",                                  //mandatory formId
"email":"",                                   //optional
"phone": "",                                  //optional
"name":"",                                    //optional
"profileUrl":"",                              //optional
"age" : "",                                   //optional
"dateOfBirth" : ""                            //optional
}
window.ReWebSDK.formDataCapture(formDetails); //mandatory event
`}
                                        </code>
                                    </pre>
                                    </div>
                                    <p>
                                        <b>Note:</b> Generate the fields to be captured with ‘formId’ in the
                                        application’s form creation page. The previously identified data fields in the
                                        form are used and validated using the above method.
                                    </p>
                                </section>
                                <section id="3.4" className="text-indent-left-second">
                                    <h2>3.4 Conversion tracking</h2>
                                    <p>
                                        Tracks if the contact completes the call to action associated with the campaign
                                        communications for different communication channels. For example, purchase.
                                    </p>
                                    <h3>
                                        <b>Method – conversionTracking</b>
                                    </h3>
                                    <p>
                                        Use the method <b>conversionTracking</b> for campaign conversion.
                                    </p>
                                    <div className='box-design'>
                                        <pre>
                                        <code>{`window.ReWebSDK.conversionTracking();`}</code>
                                    </pre>
                                    </div>
                                </section>
                                <section id="3.5" className="text-indent-left-second">
                                    <h2>3.5 Location update</h2>
                                    <p>
                                        The application enables tracking users' locations using GPS on their devices if
                                        they have permitted to use the device location. Then, use near field
                                        communications (NFC) as a trigger to target the user with contextual
                                        communication based on the proximity to one of the NFC beacons.
                                    </p>
                                    <p>
                                        <b>Method – locationUpdate</b> - Use the method ‘locationUpdate’ for updating
                                        the user location details.
                                    </p>
                                    <div className='box-design'>
                                        <pre>
                                        <code>
                                            {`var location = {
latitude: 13.067439,                    //mandatory latitude
longitude: 80.237617                    //mandatory longitude
}
window.ReWebSDK.userLocation(location);
`}
                                        </code>
                                    </pre>
                                    </div>
                                </section>
                                {/* <section id="3.6" className="text-indent-left-second">
                                    <h2>3.6 Dynamic zone</h2>
                                    <p>
                                        The Dynamic Zone feature allows seamless integration of personalized banner ads
                                        into your website.Each banner is fully configurable in terms of size, placement,
                                        and identifier.This ensures maximum engagement and relevance for your
                                        audience.Dynamic Zones are designed for scalability and ease of implementation
                                        across multiple web pages.
                                    </p>
                                    <h3>
                                        <b>Method – Script tag element - </b>
                                    </h3>
                                    <pre>
                                        <code>
                                            {`<div id="Resul-banner-ads" banner-props='{"bannerName": "XXX","width": XXX,"height": XXX }'></div>`}
                                        </code>
                                    </pre>
                                    <h3>
                                        <b>Editable Parameter : </b>
                                    </h3>
                                    <ul>
                                        <li>bannerName – Desired banner name her (Eg : Resul_Sample _Banner)</li>
                                        <li>Width - Desired Width (Eg: 10,20,30 … upto 990)</li>
                                        <li>Height - Desired Height (Eg: 10,20,30 … upto 990)</li>
                                    </ul>
                                    <p>
                                        <b>Example </b>
                                    </p>
                                    <pre>
                                        <code>
                                            {`<div id="Resul-banner-ads" banner-props='{"bannerName": "Banner_Name","width":
 600,"height": 350}'></div>`}
                                        </code>
                                    </pre>
                                    <p>
                                        <b>Note: </b>
                                        {`The inserted <div> element must strictly follow the structure provided in the example for proper functionality.`}
                                    </p>
                                    <p>
                                        <b>Recommended Sizes : </b>
                                    </p>
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr class="table-primary">
                                                <th scope="col">Banner Type</th>
                                                <th scope="col">Width (px)</th>
                                                <th scope="col">Height (px)</th>
                                                <th scope="col">Use Case / Placement</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Top Hero Banner</td>
                                                <td>980</td>
                                                <td>200</td>
                                                <td>Top or bottom of pages (desktop)</td>
                                            </tr>
                                            <tr>
                                                <td>Category Strip Banner</td>
                                                <td>728</td>
                                                <td>90</td>
                                                <td>In-content or sidebars</td>
                                            </tr>
                                            <tr>
                                                <td>Grid Tile Ad Banner</td>
                                                <td>300</td>
                                                <td>250</td>
                                                <td>Sidebars or within content</td>
                                            </tr>
                                            <tr>
                                                <td>Sidebar Vertical Banner</td>
                                                <td>160</td>
                                                <td>600</td>
                                                <td>Mobile header or footer</td>
                                            </tr>
                                            <tr>
                                                <td>Mid-Scroll Wide Banner</td>
                                                <td>970</td>
                                                <td>250</td>
                                                <td>Sidebars (tall vertical ads)</td>
                                            </tr>
                                            <tr>
                                                <td>Footer Banner</td>
                                                <td>980</td>
                                                <td>120</td>
                                                <td>More impactful vertical placement</td>
                                            </tr>
                                            <tr>
                                                <td>Popup Modal Banner</td>
                                                <td>400</td>
                                                <td>600</td>
                                                <td>Prominent top placement (desktop)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </section> */}
                                {/* <section id="2.1" className="text-indent-left-second">
                                        <h2>2.1 Prerequisites</h2>
                                        <p>
                                            The prerequisites section details a set of environmental components required before
                                            enabling the SDK code at the respective endpoints.
                                        </p>
                                        <p>
                                            To install the Web SDK, add the code snippet given below into the web domain HTML at
                                            the codebase body.
                                        </p>
                                        <p>Example:</p>
                                        <p>
                                            {`<script resulconfig="/resulconfig.json" src="https://sdk.resul.io/handlers/${gridData}.sdk" defer="defer"></script>`}
                                        </p>
                                    </section>
                                    <section id="2.2" className="text-indent-left-second">
                                        <h2>2.2 Resulconfig.json</h2>
                                        <p>
                                            Place the given <strong>resulconfig.json</strong> in the root folder and update the
                                            configuration if needed.
                                        </p>
                                        <p>
                                            <strong>Note</strong> The product owner provides the{' '}
                                            <strong>resulconfig.json</strong> to the identified brand(s).
                                        </p>
                                        <p>Example - Configuration parameters as follows:</p>
                                    </section>
                                    <section id="2.3" className="text-indent-left-second">
                                        <h2>2.3 Register</h2>
                                        <p>
                                            The function sends a push notification every time the authorization token is
                                            received/refreshed.
                                        </p>
                                        <p>
                                            <strong>Method - userRegister</strong>
                                        </p>
                                        <p>
                                            Use the method ‘userRegister’ for SDK user registration. In the JavaScript file
                                            related to the login page, paste the ‘userRegister’ method and calls the method
                                            after the user login function is successful.
                                        </p>
                                        <p>
                                            {' '}
                                            <strong>window.ReWebSDK.userRegister(userDetails);</strong>
                                        </p>
                                        <p>
                                            Based on the above code snippet, the ‘uniqueId’ can be customized, and the ‘Email
                                            ID’ and ‘mobile ID’ can also be customized.
                                        </p>
                                        <p>Enable the following parameters as mandatory at the code level:</p>
                                        <ul>
                                            <li>uniqueId, email, and mobile</li>
                                        </ul>
                                        <p>
                                            <strong>Method – user Logout</strong>
                                        </p>
                                        <p>
                                            Use the method <strong>user Logout</strong> to{' '}
                                            <strong>unsubscribe the FCM token </strong> for a user from receiving a web push
                                            notification.
                                        </p>
                                        <p>
                                            <strong>window.ReWebSDK.userLogout()</strong>
                                        </p>
                                        <p>
                                            The SDK provides a feature to set-up events related to the brand as the trigger
                                            point for communications. For example, consider a user of a bank. If the user visits
                                            an app page, reads about the personal loan, and then moves to a different page
                                            without filling in the form to see if he is eligible for a loan.Consider setting-up
                                            this user behavior as a custom event and use it as a trigger to retarget the
                                            specific user with push notification (In-app message) instantly.
                                        </p>
                                        <p>Track the following two types of events using the listed two methods:</p>
                                        <ul>
                                            <li>Event/ event name</li>
                                            <li>Product detail</li>
                                        </ul>
                                        <p>
                                            <strong>Method – custom Event</strong>
                                        </p>
                                        <p>
                                            Use the method <strong>custom Event</strong> to enable custom event tracking.
                                        </p>
                                        <p>
                                            &nbsp;<em>// Event type 1</em>
                                        </p>
                                        <p>
                                            <strong>&nbsp;window.</strong>ReWebSDK.customEvent(resEvent1);
                                        </p>
                                        <p>
                                            &nbsp;<em>// Event type 2</em>
                                        </p>
                                        <p>
                                            <strong>&nbsp;window.</strong>ReWebSDK.customEvent(resEvent2);
                                        </p>
                                    </section>
                                    <section id="2.4" className="text-indent-left-second">
                                        <h2>2.4 Client form data capture</h2>
                                        <p>
                                            Form data capture extracts information from an electronic form and converts it into
                                            data readable in electronic form.&nbsp; Tracks a brand's user behavior by data
                                            capturing refers to collecting related information through electronic documents such
                                            as any form.&nbsp; The brand tracks the user behavior like the 'Signup form' and the
                                            'Application form'. At the backend, RESUL provides support to track these forms by
                                            enabling the SDK package.
                                        </p>
                                        <p>
                                            <strong>Method – form Capture</strong>
                                        </p>
                                        <p>
                                            Use the method <strong>form Data Capture</strong> to collect the brand’s user
                                            details without any RESUL web form.
                                        </p>
                                        <p>
                                            <strong>window.ReWebSDK.formDataCapture(formDetails);</strong>
                                        </p>
                                        <p>
                                            <strong>Note </strong>Generate the fields to be captured with ‘formId’ in the
                                            application’s form creation page. The previously identified data fields in the form
                                            are used and validated using the above method.
                                        </p>
                                    </section>
                                    <section id="2.5" className="text-indent-left-second">
                                        <h2>2.5 Conversion tracking</h2>
                                        <p>
                                            Tracks if the contact completes the call to action associated with the
                                            communications for different communication channels. For example, purchase.
                                        </p>
                                        <p>
                                            <strong>Method – conversion Tracking</strong>
                                        </p>
                                        <p>
                                            Use the method <strong>conversion Tracking</strong> for communication conversion.
                                        </p>
                                        {/* <p>&nbsp;</p> */}
                                {/* <p>
                                    <strong>&nbsp;window.</strong>ReWebSDK.conversionTracking();
                                </p> */}
                                {/* </section>
                                    <section id="2.6" className="text-indent-left-second">
                                        <h2>2.6 Location update</h2>
                                        <p>
                                            The application enables tracking users' locations using GPS on their devices if they
                                            have permitted to use the device location. Then, use near field communications (NFC)
                                            as a trigger to target the user with contextual communication based on the proximity
                                            to one of the NFC beacons.
                                        </p>
                                        <p>
                                            <strong>Method – location Update</strong> - Use the method ‘locationUpdate’ for
                                            updating the user location details.
                                        </p>
                                        <p>
                                            <strong>window.ReWebSDK.userLocation(location);</strong>
                                        </p>
                                        <p>
                                            <em>--- The document ends here ---</em>
                                        </p>
                                    </section> */}
                            </div>
                        </div>
                    </PDFExport>
                }
            </Container>
        </div>
    );
};

export default WebSDKIntegration;
