import { useState, useEffect } from "react";
import { RSPrimaryButton, RSSecondaryButton } from "Components/Buttons";
import "./FCMGuidelinesModal.scss";

// Importing images extracted from the Word document
import img1 from "./Images/image1.jpeg";
import img4 from "./Images/image4.jpeg";
import img5 from "./Images/image5.jpeg";
import img6 from "./Images/image6.jpeg";
import img7 from "./Images/image7.jpeg";
import img8 from "./Images/image8.jpeg";
import img10 from "./Images/image10.jpeg";
import img11 from "./Images/image11.jpeg";
import img12 from "./Images/image12.jpeg";
import img13 from "./Images/image13.jpeg";
import img14 from "./Images/image14.jpeg";
import img15 from "./Images/image15.jpeg";
import img16 from "./Images/image16.jpeg";
import img17 from "./Images/image17.jpeg";
import img18 from "./Images/image18.jpeg";
import img19 from "./Images/image19.jpeg";
import img20 from "./Images/image20.jpeg";
import img21 from "./Images/image21.jpeg";

const steps = [
  { title: "STEP 1", description: "Go to firebase.google.com and click Sign-In.", image: img1 },
  { title: "STEP 2", description: "Enter your email ID and click Next.", image: img4 },
  { title: "STEP 3", description: "Enter your password and click Next.", image: img5 },
  { title: "STEP 4", description: "Click the Go to console button.", image: img6 },
  { title: "STEP 5", description: "Click on Create a project.", image: img7 },
  { title: "STEP 6", description: "Enter your project name and click Continue.", image: img8 },
  { title: "STEP 7", description: "Disable or keep Google Analytics settings.", image: img10 },
  { title: "STEP 8", description: "Select the Web App icon.", image: img11 },
  { title: "STEP 9", description: "Enter App nickname and register app.", image: img12 },
  { title: "STEP 10", description: "Scroll and click Continue to console.", image: img13 },
  { title: "STEP 11", description: "Open Project settings from the sidebar.", image: img14 },
  { title: "STEP 12", description: "Copy Firebase Configuration from the General tab.", image: img15 },
  { title: "STEP 13", description: "Enable Firebase Cloud Messaging API (V1).", image: img16 },
  { title: "STEP 14", description: "Click Generate Key Pair.", image: img17 },
  { title: "STEP 15", description: "Copy the generated key pair value.", image: img18 },
  { title: "STEP 16", description: "Select Service Accounts.", image: img19 },
  { title: "STEP 17", description: "Click Generate new private key.", image: img20 },
  { title: "STEP 18", description: "Click Generate key.", image: img21 },
  { title: "STEP 19", description: "JSON file downloads — share it for setup." }
];

export default function FCMGuidelinesModal({ show, onHide }) {
  const [current, setCurrent] = useState(0);

  // Reset to first step when modal opens
  useEffect(() => {
    if (show) {
      setCurrent(0);
    }
  }, [show]);

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
    <div className="fcm-guidelines-modal">
      <div className="fcm-carousel-container">
        <div className="fcm-carousel">
            {steps[current].image !== null && steps[current].image !== undefined &&  <img src={steps[current].image} alt={steps[current].title} className="fcm-image" />}
         
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
          <span className="fcm-indicator">{current + 1} / {steps.length}</span>
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