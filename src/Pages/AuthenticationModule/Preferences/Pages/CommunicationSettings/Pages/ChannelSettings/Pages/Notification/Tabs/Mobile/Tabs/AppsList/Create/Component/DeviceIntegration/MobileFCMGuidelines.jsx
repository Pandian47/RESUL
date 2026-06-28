import { useState, useEffect, useMemo } from "react";
import { RSPrimaryButton, RSSecondaryButton } from "Components/Buttons";
import "./MobileFCMGuidelines.scss";

// Importing images extracted from the Word document
import img1 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image1.jpeg";
import img4 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image4.jpeg";
import img5 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image5.jpeg";
import img6 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image6.jpeg";
import img7 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image7.jpeg";
import img8 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image8.jpeg";
import img10 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image10.jpeg";
import img11 from "../../../../../../Web/Tabs/Web/Create/Component/Images/selectmobileplatform.png";
import img12 from "../../../../../../Web/Tabs/Web/Create/Component/Images/appnickname.png";
import img14 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image14.jpeg";
import img16 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image16.jpeg";
import img18 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image18.jpeg";
import img19 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image19.jpeg";
import img20 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image20.jpeg";
import img21 from "../../../../../../Web/Tabs/Web/Create/Component/Images/image21.jpeg";
import androidPlatform from "../../../../../../Web/Tabs/Web/Create/Component/Images/androidplatform.png";
import androidGoogleService from "../../../../../../Web/Tabs/Web/Create/Component/Images/androidgoogleservice.png";
import androidFirebaseConfig from "../../../../../../Web/Tabs/Web/Create/Component/Images/androidfirebaseSDK.png";
import androidConsole from "../../../../../../Web/Tabs/Web/Create/Component/Images/androidcontinueconsole.png";

import iosRegister from "../../../../../../Web/Tabs/Web/Create/Component/Images/iosregister.png";
import iOSService from "../../../../../../Web/Tabs/Web/Create/Component/Images/iosserviceaccount.png";
import iOSFirebaseSDK from "../../../../../../Web/Tabs/Web/Create/Component/Images/iosfirebaseSDK.png";
import iOSinitializeSDK from "../../../../../../Web/Tabs/Web/Create/Component/Images/iOSinitialialize.png";

// Common steps shared between Android and iOS (Steps 1-7)
const commonStepsBeforePlatform = [
    { title: "STEP 1", description: "Go to firebase.google.com and click Sign-In.", image: img1 },
    { title: "STEP 2", description: "Enter your email ID and click Next.", image: img4 },
    { title: "STEP 3", description: "Enter your password and click Next.", image: img5 },
    { title: "STEP 4", description: "Click the Go to console button.", image: img6 },
    { title: "STEP 5", description: "Click on Create a project.", image: img7 },
    { title: "STEP 6", description: "Enter your project name and click Continue.", image: img8 },
    { title: "STEP 7", description: "Disable or keep Google Analytics settings.", image: img10 },
];

// Platform-specific steps for Android (Steps 8-9)
const androidPlatformSteps = [
    { title: "STEP 8", description: "Select the Android icon to add an Android app.", image: androidPlatform },
    { title: "STEP 9", description: "Enter Android package name and register app.", image: img12 },
    { title: "STEP 10", description: "Download and then add config file.", image: androidGoogleService },
    { title: "STEP 11", description: "Add Firebase SDK.", image: androidFirebaseConfig },
    { title: "STEP 12", description: "Click continue to console.", image: androidConsole },
];

// Platform-specific steps for iOS (Steps 8-9)
const iosPlatformSteps = [
    { title: "STEP 8", description: "Select the iOS icon to add an iOS app.", image: img11 },
    { title: "STEP 9", description: "Enter iOS bundle ID and register app.", image: iosRegister },
    { title: "STEP 10", description: "Download GoogleService-Info.plist and then add in app.", image: iOSService },
     { title: "STEP 11", description: "Add Firebase SDK using CocoaPods or Swift package manager", image: iOSFirebaseSDK },
     { title: "STEP 12", description: "Initialize Firebase in AppDelegate", image: iOSinitializeSDK },
];

// Common steps after platform selection (Steps 10-19)
const commonStepsAfterPlatform = [
    { title: "STEP 13", description: "Goto the project settings", image: img14 },
    { title: "STEP 14", description: "Under the Project settings page, select the Cloud Messaging tab and ensure that Firebase Cloud Messaging API (V1) is enabled", image: img16 },
    { title: "STEP 15", description: "Copy the generated key pair value.", image: img18 },
    { title: "STEP 16", description: "Select Service Accounts.", image: img19 },
    { title: "STEP 17", description: "Click Generate new private key.", image: img20 },
    { title: "STEP 18", description: "Click Generate key.", image: img21 },
    { title: "STEP 19", description: "Hope firebase setup is done" }
];

const PLATFORMS = {
    ANDROID: 0,
    IOS: 1
};

// Tab data for platform selection
const platformTabData = [
    { id: 0, text: 'Android', component: () => null },
    { id: 1, text: 'iOS', component: () => null }
];

export default function MobileFCMGuidelines({ show, onHide, platformName }) {
        let index = 0;
    if (platformName?.length > 0) {
        index = platformName.toLowerCase().includes('android') ? PLATFORMS.ANDROID : PLATFORMS.IOS;
    }
        const [current, setCurrent] = useState(0);
    const [selectedPlatform, setSelectedPlatform] = useState(index);


    // Build steps array based on selected platform
    const steps = useMemo(() => {
                let index = 0;
        let platformSteps = androidPlatformSteps
        if (platformName?.length > 0) {
            index = platformName.toLowerCase().includes('android') ? PLATFORMS.ANDROID : PLATFORMS.IOS;
            if(index === 1){
                platformSteps = iosPlatformSteps
            }
        }
        // const platformSteps = selectedPlatform === PLATFORMS.ANDROID
        //     ? androidPlatformSteps
        //     : iosPlatformSteps;

        return [
            ...commonStepsBeforePlatform,
            ...platformSteps,
            ...commonStepsAfterPlatform
        ];
    }, [selectedPlatform]);

    // Reset to first step when modal opens
    useEffect(() => {
        if (show) {
            setCurrent(0);
            const p = (platformName || '').toLowerCase();
            if (p.includes('ios')) {
                setSelectedPlatform(PLATFORMS.IOS);
            } else {
                setSelectedPlatform(PLATFORMS.ANDROID);
            }
        }
    }, [show, platformName]);

    // Check if current step is a platform-specific step (step 8 or 9)
    const isPlatformSpecificStep = current >= 7 && current <= 8;

    const handlePlatformChange = (item, index) => {
        setSelectedPlatform(index);
    };

    const next = () => {
        if (current < steps.length - 1) {
            setCurrent(current + 1);
        }
    };

    const prev = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    };

    return (
        <div className="mobile-fcm-guidelines-modal">
            <div className="fcm-carousel-container">
                {/* Platform Tab Bar - Show only on platform-specific steps */}
                {/* {isPlatformSpecificStep && (
                    <div className="fcm-platform-tabs-wrapper">
                        <RSTabbar
                            tabData={platformTabData}
                            defaultTab={selectedPlatform}
                            callBack={handlePlatformChange}
                            className="fcm-platform-tabs"
                            activeClass="active"
                            defaultClass="fcm-tab-item"
                        />
                    </div>
                )} */}

                <div className="fcm-carousel">
                    {steps[current].image !== null && steps[current].image !== undefined && (
                        <img src={steps[current].image} alt={steps[current].title} className="fcm-image" />
                    )}

                    <div className="fcm-step-info">
                        <h3 className="fcm-step-title">{steps[current].title}</h3>
                        <p className="fcm-step-desc">{steps[current].description}</p>
                    </div>
                </div>

                <div className="fcm-nav">
                    <RSSecondaryButton
                        onClick={prev}
                        disabled={current === 0}
                        className="fcm-btn fcm-btn-prev"
                    >
                        Previous
                    </RSSecondaryButton>
                    <span className="fcm-indicator">{current + 1} / <span className="color-secondary-grey">{steps.length}</span></span>
                    <RSPrimaryButton
                        onClick={next}
                        disabled={current === steps.length - 1}
                        className="fcm-btn fcm-btn-next"
                    >
                        Next
                    </RSPrimaryButton>
                </div>
            </div>
        </div>
    );
}
