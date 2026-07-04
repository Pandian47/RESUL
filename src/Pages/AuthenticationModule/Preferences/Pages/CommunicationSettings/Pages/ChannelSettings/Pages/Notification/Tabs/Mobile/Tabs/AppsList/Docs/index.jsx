import { createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { iOSAppOnBoard } from 'Assets/Images';
import { useEffect, useRef, useState } from 'react';
import { map as _map, get as _get, keys as _keys } from 'Utils/modules/lodashReplacements';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import Scrollspy from 'react-scrollspy';
import KendoGrid from 'Components/RSKendoGrid';
import { saveWebPushTenantData } from 'Reducers/preferences/CommunicationSettings/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { PDFExport } from '@progress/kendo-react-pdf';


//import { DATACATALOGUE_GRID } from '../../constant';
// export const DATACATALOGUE_GRID = {
//     status: true,
//     message: 'Success',
//     data: [
//         {
//             AppName: 'Client ID (Android & iOS)',
//             VisionRetailNOV16: 'f4922fe0_5f5d_49b2_8752_2160c4cbc648',
//         },
//         {
//             AppName: 'APP ID (Android & iOS)',
//             VisionRetailNOV16: 'd83871f6-f5e8-49b2-b7b4-c44b3615ec5d',
//         },
//         {
//             AppName: 'Access Token (Android)',
//             VisionRetailNOV16: '0a392553d584c492df9a862dd3c166738fef2842',
//         },
//     ],
// };

const PushAppSDKDocs = () => {
    const scrollRef = useRef();
    const wrapperRef = useRef();
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [tenantId, setTenantId] = useState('');
    const state = useQueryParams();

	 const pdfExportComponent = useRef(null);
    useEffect(() => {
        if(state?.isDDL==='Download'){
            pdfExportComponent.current.save();
        }
        if (!!state) getData();
    }, [state]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const getData = async () => {
        const { status, tenantId: id } = await dispatch(
            saveWebPushTenantData({ clientId, userId, departmentId, webnotifySettingId: state?.id }),
        );
        if (status) {
            setTenantId(id);
        }
    };
    const DATACATALOGUE_GRID = {
        status: true,
        message: 'Success',
        data: [
            {
                AppName: 'Client ID (Android & iOS)',
                VisionRetailNOV16: tenantId,
            },
            {
                AppName: 'APP ID (Android & iOS)',
                // VisionRetailNOV16: 'd83871f6-f5e8-49b2-b7b4-c44b3615ec5d',
                VisionRetailNOV16: _get(state, 'appId', ''),
            },
            {
                AppName: 'Access Token (Android)',
                VisionRetailNOV16: '0a392553d584c492df9a862dd3c166738fef2842',
            },
        ],
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
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={'Mobile SDK Integration (Native)'}
                rightCommonMenus
                isBack
                backPath={'/preferences/communication-settings'}
                state={createCommunicationSettingsNavState('notification', {
                    subfrom: 'MP',
                    notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
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
                    fileName={`Mobile SDK Integration (Native) - ${new Date().getFullYear()}`}
                    author="RESUL"
                >
                    <div className="rs-scrollspay-wrapper">
                        <div className="rs-scrollspay-menu css-scrollbar" ref={scrollRef}>
                            <Scrollspy
                                items={[
                                    '1',
                                    '1.1',
                                    '1.2',
                                    '2',
                                    '2.1',
                                    '2.2',
                                    '3',
                                    '3.1',
                                    '3.2',
                                    '3.3',
                                    '3.4',
                                    '3.5',
                                    '4',
                                    '4.1',
                                    '4.2',
                                    '4.3',
                                    '4.4',
                                    '4.5',
                                ]}
                                offset={-90}
                                currentClassName="is-current"
                            >
                                <li className="text-indent-left-first" onClick={() => onScrollMenu('1')}>
                                    <a href="javascript:void(0)">1. Information required</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('1.1')}>
                                    <a href="javascript:void(0)">1.1. Android</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('1.2')}>
                                    <a href="javascript:void(0)">1.2. iOS</a>
                                </li>
                                <li className="text-indent-left-first" onClick={() => onScrollMenu('2')}>
                                    <a href="javascript:void(0)">2. Purpose of Mobile SDK</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('2.1')}>
                                    <a href="javascript:void(0)">2.1. deployed at end-points</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('2.2')}>
                                    <a href="javascript:void(0)">2.2. Android and iOS setup</a>
                                </li>
                                <li className="text-indent-left-first" onClick={() => onScrollMenu('3')}>
                                    <a href="javascript:void(0)">3. Android</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('3.1')}>
                                    <a href="javascript:void(0)">3.1. Installing the SDK</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('3.2')}>
                                    <a href="javascript:void(0)">3.2. Initializing the SDK</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('3.3')}>
                                    <a href="javascript:void(0)">3.3. Deep linking</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('3.4')}>
                                    <a href="javascript:void(0)">3.4. App Configuration</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('3.5')}>
                                    <a href="javascript:void(0)">3.5. Additional tracking</a>
                                </li>
                                <li className="text-indent-left-first" onClick={() => onScrollMenu('4')}>
                                    <a href="javascript:void(0)">4. IOS</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('4.1')}>
                                    <a href="javascript:void(0)">4.1. Installing the SDK</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('4.2')}>
                                    <a href="javascript:void(0)">4.2. Initializing the SDK</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('4.3')}>
                                    <a href="javascript:void(0)">4.3. Push Notification</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('4.4')}>
                                    <a href="javascript:void(0)">4.4. Deep linking</a>
                                </li>
                                <li className="text-indent-left-second" onClick={() => onScrollMenu('4.5')}>
                                    <a href="javascript:void(0)">4.5. Additional tracking</a>
                                </li>
                            </Scrollspy>
                        </div>
                        <div className="rs-scrollspay-content">
                            <section id="1">
                                <h1>1. Information required</h1>
                            </section>
                            <section id="1.1" className="text-indent-left-second">
                                <h2>1.1. Android</h2>
                                <ul>
                                    <li>App name</li>
                                    <li>Package name</li>
                                    <li>Play store URL</li>
                                    <li>Deep link url scheme</li>
                                    <li>Deep link host</li>
                                    <li>Push notification Project ID</li>
                                    <li>Push notification API key</li>
                                    <li>Push client name FCM or GCM</li>
                                </ul>
                            </section>
                            <section id="1.2" className="text-indent-left-second">
                                <h2>1.2. iOS</h2>
                                <ul>
                                    <li>Push Notification</li>
                                    <ul>
                                        <li>APNS - Push notification Certificate.p12 file & password</li>
                                        <li>FCM - Server key</li>
                                    </ul>
                                    <li>Deeplinking</li>
                                    <ul>
                                        <li>App name</li>
                                        <li>Bundle ID</li>
                                        <li>App store URL</li>
                                        <li>Url Schemes</li>
                                        <li>Identifier</li>
                                    </ul>
                                </ul>
                            </section>
                            <section id="2">
                                <h1>2. Purpose of RESUL mobile SDK</h1>
                                <p>
                                    SDK responds to the requests coming from the authenticated app (based on the unique
                                    identifier configured during the mobile app integration. Below are the usage of the
                                    Mobile SDK)
                                </p>
                                <ul>
                                    <li>Device Details</li>
                                    <li>Automatic event</li>
                                    <li>Dynamic event</li>
                                    <li>Screen spend time</li>
                                    <li>Deep link (SmartLink)</li>
                                    <li>User journey</li>
                                    <li>Push notifications</li>
                                    <li>Dynamic offer</li>
                                    <li>In-app notification</li>
                                    <li>Communication tracking</li>
                                    <li>Beacons, NFC, QR Scan</li>
                                    <li>Location update</li>
                                </ul>
                                <p>
                                    <b>Note:</b> iOS Only - If you want to track storyboard screen then app developer
                                    needs to set Restoration ID by enabling Use Storyboard ID. Before doing this app
                                    developer has to set Storyboard ID
                                </p>
                                <p>
                                    <img src={iOSAppOnBoard} alt="iOSAppOnBoard" />
                                </p>
                            </section>
                            <section id="2.1" className="text-indent-left-second">
                                <h3>2.1. Mobile SDK code to be deployed at end-points:</h3>
                                <div className="highlight">
                                    <pre>
                                        <code>
                                            <h3 className="mb5 mt15">Android</h3>
                                            <p className="mb20">
                                                compile <span className="hljs-string">'io.resu:ReAndroidSDK_</span>
                                                <span className="clientIDValue hljs-string">
                                                    {/* f4922fe0_5f5d_49b2_8752_2160c4cbc648 */}
                                                    {tenantId}
                                                </span>
                                                <span className="hljs-string">:-SNAPSHOT'</span>
                                            </p>
                                            <h3 className="mb5 mt15">iOS</h3>
                                            <p className="mb15">
                                                pod{' '}
                                                <span className="hljs-string">
                                                    {/* 'REIOSSDK_f4922fe0_5f5d_49b2_8752_2160c4cbc648' */}
                                                    {'REIOSSDK_' + tenantId}
                                                </span>
                                            </p>
                                        </code>
                                    </pre>
                                </div>
                            </section>
                            <section id="2.2" className="text-indent-left-second">
                                <h3>2.2. Credentials for Android and iOS setup:</h3>
                                <KendoGrid
                                    data={DATACATALOGUE_GRID?.data}
                                    column={_map(_keys(DATACATALOGUE_GRID.data[0]), (item) => ({
                                        field: item,
                                        title: item,
                                        //width: 205,
                                    }))}
                                    scrollable={'scrollable'}
                                />
                            </section>
                            <section id="3" className="mb0">
                                <h2>3. Android</h2>
                            </section>
                            <section id="3.1" className="text-indent-left-second">
                                <h3>3.1. Installing the SDK</h3>
                                <ul>
                                    <li>
                                        Add dependencies to root/build.gradle
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs perl">
                                                    <p className="grey">
                                                        //Top-level build file where you can add configuration options
                                                        common to all.
                                                        <span className="hljs-function">
                                                            <span className="hljs-keyword">sub</span>-
                                                            <span className="hljs-title">projects</span>{' '}
                                                            <span className="hljs-title">or</span>{' '}
                                                            <span className="hljs-title">modules</span>.
                                                        </span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            <span className="hljs-title">buildscript</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p> repositories {'{'}</p>
                                                    <p> jcenter()</p>
                                                    <p> mavenCentral()</p>
                                                    <p> {'}'}</p>
                                                    <p> dependencies {'{'}</p>
                                                    <p>
                                                        {' '}
                                                        classpath{' '}
                                                        <span className="hljs-string">
                                                            'com.android.tools.build:gradle:2.3.3'
                                                        </span>
                                                    </p>
                                                    <p> {'}'}</p>
                                                    <p>{'}'}</p>
                                                    <p>allprojects {'{'}</p>
                                                    <p> repositories {'{'}</p>
                                                    <p> jcenter()</p>
                                                    <p> mavenCentral()</p>
                                                    <p className="system-integration-maven"> maven {'{'}</p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        url <span className="hljs-string">"https://jitpack.io"</span>
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        credentials {'{'} username authToken {'}'}
                                                    </p>
                                                    <p className="system-integration-maven"> {'}'}</p>
                                                    <p> {'}'}</p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        configurations.all {'{'}
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        resolutionStrategy {'{'}
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        cacheChangingModulesFor <span className="hljs-number">
                                                            0
                                                        </span>, <span className="hljs-string">'seconds'</span>
                                                    </p>
                                                    <p className="system-integration-maven"> {'}'}</p>
                                                    <p className="system-integration-maven"> {'}'}</p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Paste the authtoken in the gradle.properties file
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs apache">
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # Project-wide Gradle settings.
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # IDE (e.g. Android Studio) users:
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # Gradle settings configured through the IDE *will override*
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # any settings specified in this file.
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # For more details on how to configure your build
                                                            environment visit
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            #
                                                            https://www.gradle.org/docs/current/userguide/build_environment.html
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # Specifies the JVM arguments used for the daemon process.
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # The setting is particularly useful for tweaking memory
                                                            settings.
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-attribute">org</span>
                                                        .gradle.jvmargs=-Xmx1536m
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        <span className="hljs-attribute">authToken</span>=
                                                        <span className="accessTokenValueAndroid">
                                                            0a392553d584c492df9a862dd3c166738fef2842
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # When configured, Gradle will run in incubating parallel
                                                            mode.
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            # This option should only be used with decoupled projects.
                                                            More details, visit
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment">
                                                            #
                                                            https://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-comment"># org.gradle.parallel=true</span>
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Add dependencies to app/build.gradle
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs nginx">
                                                    <p>
                                                        <span className="hljs-attribute">apply</span> plugin:{' '}
                                                        <span className="hljs-string">'com.android.application</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string">android {'{'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> compileSdkVersion 24</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> buildToolsVersion '</span>
                                                        <span className="hljs-number">25</span>.
                                                        <span className="hljs-number">0</span>.
                                                        <span className="hljs-number">0</span>
                                                        <span className="hljs-string">'</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> defaultConfig {'{'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> applicationId "com.sample"</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> minSdkVersion 14</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> targetSdkVersion 23</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> versionCode 1</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> versionName "1.0"</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> {'}'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> dependencies {'{'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> compile fileTree(dir: '</span>
                                                        libs
                                                        <span className="hljs-string">', include: ['</span>
                                                        <span className="hljs-regexp">*.jar</span>
                                                        <span className="hljs-string">'])</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> compile '</span>
                                                        com.android.support:appcompat-v7:
                                                        <span className="hljs-number">25</span>.
                                                        <span className="hljs-number">0</span>.
                                                        <span className="hljs-number">0</span>
                                                        <span className="hljs-string">'</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p className="system-integration-maven">
                                                        <span className="hljs-string"> compile '</span>
                                                        io.resu:ReAndroidSDK_
                                                        <span className="clientIDValue">
                                                            f4922fe0_5f5d_49b2_8752_2160c4cbc648
                                                        </span>
                                                        :-SNAPSHOT<span className="hljs-string">'</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string"> {'}'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                    <p>
                                                        <span className="hljs-string">{'}'}</span>
                                                    </p>
                                                    <span className="hljs-string"></span>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="3.2" className="text-indent-left-second">
                                <h3>3.2. Initializing the SDK</h3>
                                <ul>
                                    <li>
                                        Paste the Application.java inside the oncreate method -
                                        app/src/main/java/com/resulticks /example/myapplication/App.java
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs java">
                                                    <p>
                                                        <span className="hljs-keyword">package</span>{' '}
                                                        com.resulticks.sample;
                                                    </p>
                                                    <p>
                                                        <span className="hljs-keyword">import</span>{' '}
                                                        android.app.Application;
                                                    </p>
                                                    <p>
                                                        <span className="hljs-keyword">import</span>{' '}
                                                        io.mob.resu.reandroidsdk.ReAndroidSDK;
                                                    </p>
                                                    <p>
                                                        <span className="hljs-keyword">public</span>{' '}
                                                        <span className="hljs-className">
                                                            <span className="hljs-keyword">class</span>{' '}
                                                            <span className="hljs-title">App</span>{' '}
                                                            <span className="hljs-keyword">extends</span>{' '}
                                                            <span className="hljs-title">Application</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onCreate</span>
                                                            <span className="hljs-params">()</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">super</span>.onCreate();
                                                    </p>
                                                    <p className="grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            // RESUL Object Intialization
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        ReAndroidSDK.getInstance(
                                                        <span className="hljs-keyword">this</span>);{' '}
                                                    </p>
                                                    <p> {'}'}</p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Send push notification every time the token is received -
                                        app/src/main/java/com/resulticks /example/myapplication/MainActivity.java
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs coffeescript">
                                                    <p>
                                                        MRegisterUser userDetails ={' '}
                                                        <span className="hljs-keyword">new</span> MRegisterUser();
                                                    </p>
                                                    <p>
                                                        userDetails.setEmail(
                                                        <span className="hljs-string">" &lt;Email &gt; "</span>);
                                                    </p>
                                                    <p>
                                                        userDetails.setDeviceToken(
                                                        <span className="hljs-string">
                                                            "&lt;Device token FCM Or GCM&gt;"
                                                        </span>
                                                        );
                                                    </p>
                                                    <p>
                                                        userDetails.setName(
                                                        <span className="hljs-string">" &lt;Name optional&gt; "</span>);
                                                    </p>
                                                    <p>
                                                        userDetails.setGender(
                                                        <span className="hljs-string">" &lt;Gender optional&gt; "</span>
                                                        );
                                                    </p>
                                                    <p>
                                                        userDetails.setAge(
                                                        <span className="hljs-string">" &lt;Age optional&gt; "</span>);
                                                    </p>
                                                    <p>
                                                        userDetails.setPhone(
                                                        <span className="hljs-string">" &lt;Phone&gt; "</span>);
                                                    </p>
                                                    <p>
                                                        ReAndroidSDK.getInstance(
                                                        <span className="hljs-keyword">this</span>
                                                        ).onDeviceUserRegister(userDetails);
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Paste the FCM or GCM push notification receiver class inside the
                                        onMessageReceived method
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs cpp">
                                                    <p>
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onMessageReceived</span>
                                                            <span className="hljs-params">
                                                                (RemoteMessage remoteMessage)
                                                            </span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        <span className="hljs-keyword">if</span>{' '}
                                                        (ReAndroidSDK.getInstance(
                                                        <span className="hljs-keyword">this</span>
                                                        ).onReceivedCampaign(remoteMessage.getData()))
                                                    </p>
                                                    <p className="system-integration-maven">
                                                        {' '}
                                                        <span className="hljs-keyword">return</span>;
                                                    </p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="3.3" className="text-indent-left-second">
                                <h3>3.3. Deep linking</h3>
                                <ul>
                                    <li>
                                        Paste the Deep linking AndroidManifest.xml inside the intent-filter
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs">
                                                    <p>
                                                        &lt;data android:scheme=“&lt;scheme &gt;” android:host=
                                                        ”&lt;host &gt;” /&gt;
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Paste the App install receiver AndroidManifest.xml inside the application tag
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs xml">
                                                    <p>
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">receiver</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "io.mob.resu.reandroidsdk.InstallReferrerReceiver"
                                                            </span>{' '}
                                                            <span className="hljs-attr">android:exported</span>=
                                                            <span className="hljs-string">"true"</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">action</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "com.android.vending.INSTALL_REFERRER"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">receiver</span>&gt;
                                                        </span>
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Get Communication details
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs java">
                                                    <p>
                                                        <span className="hljs-keyword">public</span>{' '}
                                                        <span className="hljs-class">
                                                            <span className="hljs-keyword">class</span>{' '}
                                                            <span className="hljs-title">MainActivity</span>{' '}
                                                            <span className="hljs-keyword">extends</span>{' '}
                                                            <span className="hljs-title">AppCompatActivity</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">protected</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onCreate</span>
                                                            <span className="hljs-params">
                                                                (Bundle savedInstanceState)
                                                            </span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">super</span>
                                                        .onCreate(savedInstanceState);
                                                    </p>
                                                    <p> setContentView(R.layout.activity_main);</p>
                                                    <p> {'}'}</p>
                                                    <p className="margin-T20">
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onStart</span>
                                                            <span className="hljs-params">()</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">super</span>.onStart();
                                                    </p>
                                                    <p className="grey">
                                                        {' '}
                                                        <span className="hljs-comment">// RESUL CampaignData</span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        ReAndroidSDK.getCampaignData(
                                                        <span className="hljs-keyword">
                                                            new
                                                        </span> IDeepLinkInterface() {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onInstallDataReceived</span>
                                                            <span className="hljs-params">(String data)</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>&nbsp;</p>
                                                    <p> {'}'}</p>
                                                    <p className="margin-T20">
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onDeepLinkData</span>
                                                            <span className="hljs-params">(String data)</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>&nbsp;</p>
                                                    <p> {'}'}</p>
                                                    <p className="margin-T20">
                                                        {' '}
                                                        ©<span className="hljs-function">Override</span>
                                                    </p>
                                                    <span className="hljs-function"></span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            {' '}
                                                            <span className="hljs-keyword">public</span>{' '}
                                                            <span className="hljs-keyword">void</span>{' '}
                                                            <span className="hljs-title">onNotificationData</span>
                                                            <span className="hljs-params">(String data)</span>{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>&nbsp;</p>
                                                    <p> {'}'}</p>
                                                    <p> {'});'}</p>
                                                    <p> {'}'}</p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="3.4" className="text-indent-left-second">
                                <h3>3.4. App Configuration</h3>
                                <ul>
                                    <li>
                                        Paste the meta data AndroidManifest.xml inside the application tag (App id
                                        reffer App credential's table)
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs xml">
                                                    <p>
                                                        <span className="php">
                                                            <span className="hljs-meta">&lt;?</span>xml version=
                                                            <span className="hljs-string">"1.0"</span> encoding=
                                                            <span className="hljs-string">"utf-8"</span>
                                                            <span className="hljs-meta">?&gt;</span>
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">manifest</span>{' '}
                                                            <span className="hljs-attr">xmlns:android</span>=
                                                            <span className="hljs-string">
                                                                "https://schemas.android.com/apk/res/android"
                                                            </span>{' '}
                                                            <span className="hljs-attr">package</span>=
                                                            <span className="hljs-string">"com.visionbank"</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">uses-permission</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.permission.GET_ACCOUNTS"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">uses-permission</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.permission.INTERNET"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">uses-permission</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.permission.ACCESS_NETWORK_STATE"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p className="margin-T20 grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            &lt;!-- Application Class--&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">application</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "&lt;Your Custom Application Class&gt;"
                                                            </span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:allowBackup</span>=
                                                            <span className="hljs-string">"true"</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:icon</span>=
                                                            <span className="hljs-string">"©mipmap/ic_launcher"</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:label</span>=
                                                            <span className="hljs-string">"©string/app_name"</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:supportsRtl</span>=
                                                            <span className="hljs-string">"true"</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:theme</span>=
                                                            <span className="hljs-string">"©style/AppTheme"</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p className="margin-T20 grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            &lt;!-- launcher Activity Class--&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">activity</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "&lt;Your lancher activity&gt;"
                                                            </span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:screenOrientation</span>
                                                            =<span className="hljs-string">"portrait"</span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-tag"></span>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            {' '}
                                                            <span className="hljs-attr">android:theme</span>=
                                                            <span className="hljs-string">
                                                                "©style/AppTheme.NoActionBar"
                                                            </span>
                                                            &gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">action</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.intent.action.MAIN"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">category</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.intent.category.LAUNCHER"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">intent-filter</span>{' '}
                                                            <span className="hljs-attr">android:autoVerify</span>=
                                                            <span className="hljs-string">"true"</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">action</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.intent.action.VIEW"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">category</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.intent.category.DEFAULT"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">category</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "android.intent.category.BROWSABLE"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p className="margin-T20 grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            &lt;!-- Deep link setup--&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">data</span>{' '}
                                                            <span className="hljs-attr">android:host</span>=
                                                            <span className="hljs-string">"&lt;host&gt;"</span>{' '}
                                                            <span className="hljs-attr">android:scheme</span>=
                                                            <span className="hljs-string">"&lt;urlscheme&gt;"</span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">activity</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p className="margin-T20 grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            &lt;!-- App id reffer App credential's table --&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">meta-data</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">"resul.key"</span>{' '}
                                                            <span className="hljs-attr">android:value</span>=
                                                            <span className="hljs-string">"api_key_</span>
                                                        </span>
                                                        <span className="appIDValue">
                                                            <span className="hljs-tag">
                                                                <span className="hljs-string">
                                                                    d83871f6-f5e8-49b2-b7b4-c44b3615ec5d
                                                                </span>
                                                            </span>
                                                        </span>
                                                        <span className="hljs-tag">
                                                            <span className="hljs-string">"</span> /&gt;
                                                        </span>
                                                    </p>
                                                    <p className="margin-T20 grey">
                                                        {' '}
                                                        <span className="hljs-comment">
                                                            &lt;!-- RESUL install referrer Reciver --&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">receiver</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "io.mob.resu.reandroidsdk.InstallReferrerReceiver"
                                                            </span>{' '}
                                                            <span className="hljs-attr">android:exported</span>=
                                                            <span className="hljs-string">"true"</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;<span className="hljs-name">action</span>{' '}
                                                            <span className="hljs-attr">android:name</span>=
                                                            <span className="hljs-string">
                                                                "com.android.vending.INSTALL_REFERRER"
                                                            </span>{' '}
                                                            /&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">intent-filter</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">receiver</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">application</span>&gt;
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="hljs-tag">
                                                            &lt;/<span className="hljs-name">manifest</span>&gt;
                                                        </span>
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="3.5" className="text-indent-left-second">
                                <h3>3.5. Additional tracking</h3>
                                <ul>
                                    <li>
                                        Update the location
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">ReAndroidSDK</span>
                                                        <span className="hljs-selector-class">.getInstance</span>(
                                                        <span className="hljs-selector-tag">context</span>)
                                                        <span className="hljs-selector-class">.onLocationUpdate</span>(
                                                        <span className="hljs-selector-tag">latitude</span>,{' '}
                                                        <span className="hljs-selector-tag">longitude</span>);
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To do custom event tracking
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">ReAndroidSDK</span>
                                                        <span className="hljs-selector-class">.getInstance</span>(
                                                        <span className="hljs-selector-tag">context</span>)
                                                        <span className="hljs-selector-class">.onTrackEvent</span>(
                                                        <span className="hljs-selector-tag">JSONObject</span>,{' '}
                                                        <span className="hljs-selector-tag">eventName</span>);
                                                    </p>
                                                    <p>
                                                        <span className="hljs-selector-tag">ReAndroidSDK</span>
                                                        <span className="hljs-selector-class">.getInstance</span>(
                                                        <span className="hljs-selector-tag">context</span>)
                                                        <span className="hljs-selector-class">.onTrackEvent</span>(
                                                        <span className="hljs-selector-tag">eventName</span>);
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To get the communication notifications list
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">ReAndroidSDK</span>
                                                        <span className="hljs-selector-class">.getInstance</span>(
                                                        <span className="hljs-selector-tag">context</span>)
                                                        <span className="hljs-selector-class">.getNotifications</span>
                                                        ();
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To delete the communication notifications
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">ReAndroidSDK</span>
                                                        <span className="hljs-selector-class">.getInstance</span>(
                                                        <span className="hljs-selector-tag">context</span>)
                                                        <span className="hljs-selector-class">.deleteNotification</span>
                                                        (<span className="hljs-selector-tag">data</span>);
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="4" className="mb0">
                                <h2>4. IOS</h2>
                            </section>
                            <section id="4.1" className="text-indent-left-second">
                                <h3>4.1. Installing the SDK</h3>
                                <p>The easiest way to get REIOSSDK into your iOS project is to use CocoaPods.</p>
                                <ul>
                                    <li>Install CocoaPods using gem install cocoapods</li>
                                    <li>
                                        If this is your first time using CocoaPods, run pod setup to create a local
                                        CocoaPods spec mirror.
                                    </li>
                                    <li>
                                        Create a file in your Xcode project called Podfile and add the following line:
                                    </li>
                                    <div className="highlight styleP">
                                        <pre>
                                            {' '}
                                            <code className="hljs nginx">
                                                <p>
                                                    <span className="hljs-attribute">pod</span>{' '}
                                                    <span className="hljs-string">
                                                        'REIOSSDK_f4922fe0_5f5d_49b2_8752_2160c4cbc648'
                                                    </span>
                                                </p>
                                            </code>
                                        </pre>
                                    </div>
                                    <li>
                                        Our Debug and Release framework only works with real iPhone or iPad devices not
                                        the simulator. App developers must use real iPhone or iPad devices for testing
                                    </li>
                                </ul>
                                <p>
                                    <b>Note:</b> Frameworks that built with iPhone and iPhone Simulator got more chance
                                    to be rejected by apple while publishing app to Appstore
                                </p>
                            </section>
                            <section id="4.2" className="text-indent-left-second">
                                <h3>4.2. Initializing the SDK</h3>
                                <ul>
                                    <li>
                                        To start tracking with the RESUL Swift SDK, you must first initialize it with
                                        your api key(App ID) in Appdelegate class with didFinishLaunchingWithOptions
                                        method
                                        <p>
                                            To initialize the sdk, first add import REIOSSDK and call (App id reffer App
                                            credential's table)
                                        </p>
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">REiosHandler</span>
                                                        <span className="hljs-selector-class">.initWithApi</span>(
                                                        <span className="hljs-selector-tag">apiKey</span>: “
                                                        <span className="appIDValue">
                                                            <span className="hljs-selector-tag">
                                                                d83871f6-f5e8-49b2-b7b4-c44b3615ec5d
                                                            </span>
                                                        </span>
                                                        ”)
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="4.3" className="text-indent-left-second">
                                <h3>4.3. Push Notification</h3>
                                <ul>
                                    <li>
                                        Adding custom category
                                        <p className="mt15">
                                            If you have to register your custom category for push notification then call
                                            this method with your custom push notification category of type Set
                                            {'<UNNotificationCategory>'} else send [ ] empty category to register for
                                            push notification.
                                        </p>
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">REiosHandler</span>
                                                        <span className="hljs-selector-class">.getNotification</span>()?
                                                        <span className="hljs-selector-class">
                                                            .registerCategoryWithRemoteNotification
                                                        </span>
                                                        (<span className="hljs-selector-tag">category</span>:{' '}
                                                        <span className="hljs-selector-attr">[:]</span>)
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        You can send push notification token using below method
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs cs">
                                                    <p>
                                                        <span className="hljs-function">
                                                            func <span className="hljs-title">application</span>(
                                                            <span className="hljs-params">
                                                                _ application: UIApplication,
                                                            </span>
                                                        </span>
                                                    </p>
                                                    <span className="hljs-function">
                                                        <span className="hljs-params"> </span>
                                                    </span>
                                                    <p>
                                                        <span className="hljs-function">
                                                            <span className="hljs-params">
                                                                didRegisterForRemoteNotificationsWithDeviceToken
                                                                deviceToken: Data
                                                            </span>
                                                            ){' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">let</span> tokenString =
                                                        deviceToken.reduce(<span className="hljs-string">""</span>){' '}
                                                        {'{'} <span className="hljs-keyword">string</span>,{' '}
                                                        <span className="hljs-keyword">byte</span>{' '}
                                                        <span className="hljs-keyword">in</span>
                                                    </p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">string</span> + String(format:{' '}
                                                        <span className="hljs-string">"%02X"</span>,{' '}
                                                        <span className="hljs-keyword">byte</span>)
                                                    </p>
                                                    <p> {'}'}</p>
                                                    <p>
                                                        {' '}
                                                        REiosHandler.sdkRegistrationWith(name:
                                                        <span className="hljs-string">"&lt;Optional&gt;"</span>,phone:
                                                        <span className="hljs-string">"&lt;Optional&gt;"</span>, email:
                                                        <span className="hljs-string">"&lt;Email Mandatory&gt;"</span>
                                                        ,deviceToken:
                                                        <span className="hljs-string">
                                                            "&lt;Device Token Mandatory&gt;"
                                                        </span>
                                                        ,age:<span className="hljs-string">"&lt;Optional&gt;"</span>
                                                        ,gender:<span className="hljs-string">"&lt;Optional&gt;"</span>)
                                                    </p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        Passing your notification data in appdelegate class for below methods
                                        <ul className="mt15">
                                            <li>
                                                Present notification in foreground
                                                <div className="highlight styleP">
                                                    <pre>
                                                        {' '}
                                                        <code className="hljs cs">
                                                            <p>
                                                                <span className="hljs-function">
                                                                    <span className="hljs-keyword">public</span> func{' '}
                                                                    <span className="hljs-title">
                                                                        userNotificationCenter
                                                                    </span>
                                                                    (
                                                                    <span className="hljs-params">
                                                                        _ center: UNUserNotificationCenter, willPresent
                                                                        notification: UNNotification,
                                                                        withCompletionHandler completionHandler:
                                                                        ©escaping (UNNotificationPresentationOptions
                                                                    </span>
                                                                    ) -&gt; Void){' '}
                                                                </span>
                                                                {'{'}
                                                            </p>
                                                            <p>
                                                                {' '}
                                                                REiosHandler.getNotification()?.setForegroundNotification(notification:
                                                                notification, completionHandler: {'{'}
                                                            </p>
                                                            <p>
                                                                {' '}
                                                                <span className="hljs-function">
                                                                    handler <span className="hljs-keyword">in</span>
                                                                </span>
                                                            </p>
                                                            <span className="hljs-function"></span>
                                                            <p>
                                                                <span className="hljs-function">
                                                                    {' '}
                                                                    <span className="hljs-title">
                                                                        completionHandler
                                                                    </span>
                                                                    (<span className="hljs-params">handler</span>)
                                                                </span>
                                                            </p>
                                                            <span className="hljs-function"></span>
                                                            <p>
                                                                <span className="hljs-function"> {'})'}</span>
                                                            </p>
                                                            <span className="hljs-function"></span>
                                                            <p>
                                                                <span className="hljs-function">{'}'}</span>
                                                            </p>
                                                            <span className="hljs-function"></span>
                                                        </code>
                                                    </pre>
                                                </div>
                                            </li>
                                            <li>
                                                Setting up notification action
                                                <div className="highlight styleP">
                                                    <pre>
                                                        {' '}
                                                        <code className="hljs cs">
                                                            <p>
                                                                <span className="hljs-function">
                                                                    func{' '}
                                                                    <span className="hljs-title">
                                                                        userNotificationCenter
                                                                    </span>
                                                                    (
                                                                    <span className="hljs-params">
                                                                        _ center: UNUserNotificationCenter, didReceive
                                                                        response: UNNotificationResponse,
                                                                        withCompletionHandler completionHandler:
                                                                        ©escaping (
                                                                    </span>
                                                                    ) -&gt; Swift.Void){' '}
                                                                </span>
                                                                {'{'}
                                                            </p>
                                                            <p>
                                                                {' '}
                                                                REiosHandler.getNotification()?.setNotificationAction(response:
                                                                response)
                                                            </p>
                                                            <p>{'}'}</p>
                                                        </code>
                                                    </pre>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </section>
                            <section id="4.4" className="text-indent-left-second">
                                <h3>4.4. Deep linking</h3>
                                <ul>
                                    <li>
                                        Passing deep linking data
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs cs">
                                                    <p>
                                                        <span className="hljs-function">
                                                            func <span className="hljs-title">application</span>(
                                                            <span className="hljs-params">
                                                                _ application: UIApplication, open url: URL,
                                                                sourceApplication: String?, annotation: Any
                                                            </span>
                                                            ) -&gt; Bool{' '}
                                                        </span>
                                                        {'{'}
                                                    </p>
                                                    <p> REiosHandler.getDeeplink()?.handleOpenlink(url: url)</p>
                                                    <p>
                                                        {' '}
                                                        <span className="hljs-keyword">return</span>{' '}
                                                        <span className="hljs-literal">true</span>
                                                    </p>
                                                    <p>{'}'}</p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <section id="4.5" className="text-indent-left-second">
                                <h3>4.5. Deep linking</h3>
                                <ul>
                                    <li>
                                        To get user location call this method
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs cpp">
                                                    <p>
                                                        REiosHandler.updateLocation(lat:{' '}
                                                        <span className="hljs-string">"&lt;latitude&gt;"</span>,{' '}
                                                        <span className="hljs-keyword">long</span>:{' '}
                                                        <span className="hljs-string">"&lt;longitude&gt;"</span>)
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To do the custom tracking
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs apache">
                                                    <p>
                                                        <span className="hljs-attribute">REiosHandler</span>
                                                        .addEvent(eventName:{' '}
                                                        <span className="hljs-string">"&lt;name&gt;"</span>, data:{' '}
                                                        <span className="hljs-string">"&lt;[:]&gt;"</span>)
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To get In app notification list call the below method
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">REiosHandler</span>
                                                        <span className="hljs-selector-class">
                                                            .getNotificationList
                                                        </span>
                                                        ()
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                    <li>
                                        To delete In app message with selected item call this method
                                        <div className="highlight styleP">
                                            <pre>
                                                {' '}
                                                <code className="hljs css">
                                                    <p>
                                                        <span className="hljs-selector-tag">REiosHandler</span>
                                                        <span className="hljs-selector-class">
                                                            .deleteNotificationListWith
                                                        </span>
                                                        (<span className="hljs-selector-tag">dict</span>: "&lt;
                                                        <span className="hljs-selector-attr">[String : Any]</span>&gt;")
                                                    </p>
                                                </code>
                                            </pre>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                    </PDFExport>
                }
            </Container>
        </div>
    );
};

export default PushAppSDKDocs;
