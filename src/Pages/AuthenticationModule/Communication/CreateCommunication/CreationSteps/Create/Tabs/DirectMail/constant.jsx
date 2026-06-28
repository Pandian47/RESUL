import { cloneElement } from 'react';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
export const renderItem = (li) => {
    const isExpectedItem = li.props.children[0]?.props?.children.includes('Connect new ftp');
    return cloneElement(
        li,
        li.props,
        <span className="d-flex justify-content-between w-100 px-10">
            {li.props.children}
            {isExpectedItem && (
                <i
                    className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                    id="rs_data_circle_plus_fill"
                ></i>
            )}
        </span>,
    );
};

export const initialState = {
    attributes: [],
    showAttributesModal: false,
    showOfferModal: false,
    offerDetails: '',
};

export const formInitialState = {
    defaultValues: {
        audience: [],
        attachment: '',
        previewImage: '',
        transferMethod: '',
        friendlyNames: '',
        vendor: '',
        totalAudience: 0
    },
};
export const attachmentConfig = [
    {
        type: 'pdf',
        name: 'PDF',
    },
    {
        type: 'html',
        name: 'HTML',
    },
];

export const dummyHTMLContent = `<!DOCTYPE html>
<html  lang="en"><!--Html Start-->
  <head><!--Head Start-->
    <meta http-equiv="Content-Security-Policy" content="script-src 'none'; connect-src 'none'; object-src 'none';">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- <meta name="color-scheme" content="light dark"> -->
    
    
    

    <!--[if (mso 16)]>
       <style type="text/css"> 
        a {text-decoration: none;} 
        </style>
    <![endif]-->
    
    <!--[if gte mso 9]>
        <style>sup { font-size: 100% !important; }</style>
    <![endif]-->

    <!--[if gte mso 9]>
        <noscript>
            <xml>
              <o:OfficeDocumentSettings>
              <o:AllowPNG></o:AllowPNG>
              <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
        </noscript>
    <![endif]-->

    <!--[if mso]><xml>
      <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
        <w:DontUseAdvancedTypographyReadingMail/>
      </w:WordDocument>
      </xml>
    <![endif]-->


    <style>
      a {
        color: inherit;
      }
      a:-webkit-any-link {
        text-decoration: inherit;
      }
      .ii a[href] {
          color: inherit;
      }
      /* Reset styles */
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        background-color: #ffffff;
      }
      
      img {
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
        border: 0;
        /*display: block;*/
        height: auto;
      }

      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      td {
        font-family: Arial, sans-serif;
        line-height: normal;
      }

      @-moz-document url-prefix() {
        scrollbar-color: #999999 #e9e9e9;
      }
      @-moz-document url-prefix() {
        scrollbar-width: thin;
      }
      ::-webkit-scrollbar-track {
        display: none;
        background: transparent;
      }
      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
        background-color: transparent;
        border-radius: 3px;
        transition: 0.3s ease all;
      }
      ::-webkit-scrollbar-thumb {
         background-color: transparent;
        border-radius: 100px;
        -webkit-border-radius: 100px;
        -moz-border-radius: 100px;
        cursor: pointer;
      }
      :hover::-webkit-scrollbar-thumb {
       background-color: #999999; 
       border-radius: 3px;
    }

      /* Button styles */
      .button-component {
        display: inline-block;
        text-decoration: none;
        text-align: center;
        border-radius: 4px;
        -webkit-text-size-adjust: none;
        mso-hide: all;
      }

      .button-content {
        display: inline-block;
        width: auto;
        margin: 0 auto;
      }

      /* Container styles */
      .email-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
        background-color: #ffffff;
      }

      /* Content wrapper styles */
      .content-wrapper {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #ffffff !important;
        }
        .email-container {
          background-color: #ffffff !important;
        }
        .content-wrapper {
          background-color: #ffffff !important;
        }
      }

      /* Responsive styles */
      @media screen and (max-width: 600px) {
        /*.email-container,
        .content-wrapper {
          width: 100% !important;
          padding: 10px !important;
        }*/
        
        /* Make block columns stack on mobile */
        .email-block td {
          /*display: block !important;
          width: 100% !important;
          box-sizing: border-box;*/
        }
        .email-block td.test-tr-con td.image,
        .email-block td.test-tr-con .email-image-container > table,
        .email-block td.test-tr-con td.image img,
        .email-block td.test-tr-con td.image .email-image-wrap {
          width: 100% !important;
          display: block !important;
        }


        /* Responsive button styles */
        .button-component {
          width: 100% !important;
          min-width: 100% !important;
        }

        .button-content {
          width: 100% !important;
        }
      }
    </style>
  </head><!-- Head End-->
  <body><!--Body Start-->
  <!-- Gmail hack -->
<div style="display:none; white-space:nowrap; font:15px courier; color:#ffffff; line-height:0; width:600px !important; min-width:600px !important; max-width:600px !important;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
<!-- /Gmail hack -->
    

    <div class="email-container">
      <div class="content-wrapper">
        <!--[if mso]>
        <table class="main-table" cellspacing="0" cellpadding="0" border="0" width="600" bgColor="#ffffff" style="background-color: #ffffff">
        <![endif]-->

        <!--[if !mso]><!-->
        <table class="main-table" cellspacing="0" cellpadding="0" border="0" width="100%" bgColor="#ffffff" style="background-color: #ffffff; max-width: 600px; min-width: 600px;">
         <!--<![endif]-->
          <tr>
            <td>
              <div id="f19d598b-5d05-47a5-a310-b9651c47dfe2" class="email-imagetext pandian">
      <div class="imagetext-outlook-non-outlook" style="width: 100%; padding: 0px 0;">
        <!--[if mso]>
      <table data-type="outlook" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px; background: transparent;">
        <tr>
          <td 
            id="srs" 
            align="center" 
            style="
              padding-top: 5px;
              padding-bottom: 10px;
              padding-right: 0px;
              padding-left: 0px;
            ">
              <table class="imagetext_img_table imagetext-order-1" align="left" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="image rp-empty-image" valign="center" align="center" width="600">
                      
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425132753logo.png" 
              alt="" 
              style="width: 100px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid; width: 480px;"
              width="480"
              block="1"
              content="false"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                    </td>
                </tr>
              </table>
          </td>
        </tr>
      </table>
    <![endif]-->
        <!--[if !mso]><!-->
      <div class="email-image-container" style="display: flex; width: 100%; background-color: transparent; padding: 0px; max-width: 100%; margin: 0 auto; box-sizing: border-box; text-align: right; justify-content: right"><table class="image-left-content" data-type="image-left-content" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
          <tr>
            <td class="rs-td-test-left-content" style="padding: 5px 0px 10px 0px">
              <table class="imagetext_img_table imagetext-order-1" align="right" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                <tr>
                    <td class="image rp-empty-image rs-left-content" valign="top" align="center" width="100">
                      <span href="javascript:void(0);" class="image-a image-with-link" style="height:auto; max-width:100%; cursor: inherit;">
                        
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425132753logo.png" 
              alt="" 
              style="width: 100px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid;"
              width="100"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                      </span>
                    </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--<![endif]-->
      </div>
      <style>
        #f19d598b-5d05-47a5-a310-b9651c47dfe2 {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }
        #f19d598b-5d05-47a5-a310-b9651c47dfe2 img {
          max-width: 100%;
          height: auto;
          -ms-interpolation-mode: bicubic;
          display: block;
        }
        #f19d598b-5d05-47a5-a310-b9651c47dfe2 h3 {
          margin: 0 0 8px 0;
        }
        #f19d598b-5d05-47a5-a310-b9651c47dfe2 p {
          margin: 0;
        }
        @media only screen and (max-width: 600px) {
          #f19d598b-5d05-47a5-a310-b9651c47dfe2 table,
          #f19d598b-5d05-47a5-a310-b9651c47dfe2 tr,
          #f19d598b-5d05-47a5-a310-b9651c47dfe2 td {
            /* display: block !important;
            width: 100% !important;
            padding: 0 !important; */
          }
          #f19d598b-5d05-47a5-a310-b9651c47dfe2 td {
            margin-bottom: 16px;
          }
          #f19d598b-5d05-47a5-a310-b9651c47dfe2 td:last-child {
            margin-bottom: 0;
          }
        }
      </style>
    </div>
<div id="419b0dc0-f5ef-4d8c-a503-5dee72597327" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 24px; line-height: 1.5; letter-spacing: normal; text-align: center; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 10px 10px 5px 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <b><font color="#771024">Hello [[First_name]] | [[there]],</font></b>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #419b0dc0-f5ef-4d8c-a503-5dee72597327 {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #419b0dc0-f5ef-4d8c-a503-5dee72597327 p {
          margin: 0;
        }
        #419b0dc0-f5ef-4d8c-a503-5dee72597327 br {
          line-height: inherit;
        }
        #419b0dc0-f5ef-4d8c-a503-5dee72597327 sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #419b0dc0-f5ef-4d8c-a503-5dee72597327 sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #419b0dc0-f5ef-4d8c-a503-5dee72597327 {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="6929ec30-8e6e-4c13-a1d1-1aa85687e00c" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.5; letter-spacing: normal; text-align: center; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 0px 10px 10px 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <font color="#771024"><b>&nbsp;Seize this chance to take advantage of an amazing discount!</b></font>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #6929ec30-8e6e-4c13-a1d1-1aa85687e00c {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #6929ec30-8e6e-4c13-a1d1-1aa85687e00c p {
          margin: 0;
        }
        #6929ec30-8e6e-4c13-a1d1-1aa85687e00c br {
          line-height: inherit;
        }
        #6929ec30-8e6e-4c13-a1d1-1aa85687e00c sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #6929ec30-8e6e-4c13-a1d1-1aa85687e00c sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #6929ec30-8e6e-4c13-a1d1-1aa85687e00c {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="96e7d9e6-c38b-4a3e-8417-21ef8aeae343" class="email-imagetext pandian">
      <div class="imagetext-outlook-non-outlook" style="width: 100%; padding: 0px 0;">
        <!--[if mso]>
      <table data-type="outlook" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px; background: transparent;">
        <tr>
          <td 
            id="srs" 
            align="center" 
            style="
              padding-top: 0px;
              padding-bottom: 0px;
              padding-right: 0px;
              padding-left: 0px;
            ">
              <table class="imagetext_img_table imagetext-order-1" align="left" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="image rp-empty-image" valign="center" align="center" width="600">
                      
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425140649Picture3.png" 
              alt="" 
              style="width: 600px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid; width: 480px;"
              width="480"
              block="1"
              content="false"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                    </td>
                </tr>
              </table>
          </td>
        </tr>
      </table>
    <![endif]-->
        <!--[if !mso]><!-->
      <div class="email-image-container" style="display: flex; width: 100%; background-color: transparent; padding: 0px; max-width: 100%; margin: 0 auto; box-sizing: border-box; text-align: center; justify-content: center"><table class="image-left-content" data-type="image-left-content" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
          <tr>
            <td class="rs-td-test-left-content" style="padding: 0px">
              <table class="imagetext_img_table imagetext-order-1" align="center" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                <tr>
                    <td class="image rp-empty-image rs-left-content" valign="top" align="center" width="600">
                      <span href="javascript:void(0);" class="image-a image-with-link" style="height:auto; max-width:100%; cursor: inherit;">
                        
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425140649Picture3.png" 
              alt="" 
              style="width: 600px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid;"
              width="600"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                      </span>
                    </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--<![endif]-->
      </div>
      <style>
        #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }
        #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 img {
          max-width: 100%;
          height: auto;
          -ms-interpolation-mode: bicubic;
          display: block;
        }
        #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 h3 {
          margin: 0 0 8px 0;
        }
        #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 p {
          margin: 0;
        }
        @media only screen and (max-width: 600px) {
          #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 table,
          #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 tr,
          #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 td {
            /* display: block !important;
            width: 100% !important;
            padding: 0 !important; */
          }
          #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 td {
            margin-bottom: 16px;
          }
          #96e7d9e6-c38b-4a3e-8417-21ef8aeae343 td:last-child {
            margin-bottom: 0;
          }
        }
      </style>
    </div>
<div id="abf963d3-8652-4d33-a4b6-56ced0985bec" class="email-block">
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 100%; margin: 0 auto; background-color: transparent; padding: 0px 0px 0px 0px; border-radius: 0; border: none">
        <tr class="test-tr">
          
        <td class="test-tr-con" width="300" style="vertical-align: top; width: 300px; min-width: 300px">
          
<div id="a755b875-7b22-4562-b74e-a3a414c46b86" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="300" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; letter-spacing: normal; text-align: left; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <b><font color="#ffdd00">Colorado Farm Bureau® Insurance Company</font></b>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #a755b875-7b22-4562-b74e-a3a414c46b86 {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #a755b875-7b22-4562-b74e-a3a414c46b86 p {
          margin: 0;
        }
        #a755b875-7b22-4562-b74e-a3a414c46b86 br {
          line-height: inherit;
        }
        #a755b875-7b22-4562-b74e-a3a414c46b86 sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #a755b875-7b22-4562-b74e-a3a414c46b86 sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #a755b875-7b22-4562-b74e-a3a414c46b86 {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="e70bb0a9-fd66-45b6-89b1-01aecc8054f3" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="300" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; letter-spacing: normal; text-align: left; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        At Colorado Farm Bureau Insurance, we understand the importance of having reliable and affordable insurance coverage. Since 1950, we've provided top-notch auto, home, and other insurance products to Coloradans. Our highly trained local agents are here to offer personalized service and support, ensuring you get the coverage you need.
<div>We are a subsidiary of Southern Farm Bureau Casualty Insurance Company (SFBCIC).</div>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 p {
          margin: 0;
        }
        #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 br {
          line-height: inherit;
        }
        #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #e70bb0a9-fd66-45b6-89b1-01aecc8054f3 {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="81ab6db6-1da5-4550-89db-d28fad947a68" class="email-button">
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="left" style="display: inline-block; box-sizing: border-box; text-align: left; width: 100%; margin: 0; background-color: #ffffff; border-radius: 0px 0px 0px 0px; padding: 0px; border: none">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
              href="https://visioninsurancellc.resulticks.net/newpolicy.html"
              style="v-text-anchor:middle;width:200;background-color: #ffffff" 
              arcsize="0%" 
              strokecolor="#ffffff" 
              fillcolor="#ffffff"
              
            >
              <w:anchorlock/>
              <center style="color:#ffffff;font-family:Arial, sans-serif;font-size:16px;font-weight:normal;font-style:normal;">
                <span style="vertical-align: middle;">Learn More</span>
              </center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="https://visioninsurancellc.resulticks.net/sfb/newpolicy.html?ReferrerID=[[ReferrerID]]&ReferrerFirstName=[[ReferrerFirstName]]&ReferrerLastName=[[ReferrerLastName]]&ReferrerMobileNo=[[ReferrerMobileNo]]&ReferrerEmailID=[[ReferrerEmailID]]" 
               id="81ab6db6-1da5-4550-89db-d28fad947a68"
               target="_blank" 
               style="display: inline-block; background-color: #FFCB05; border-radius: 50px 50px 50px 50px; border: none; color: #000000; font-family: Arial, sans-serif; font-size: 16px; font-weight: normal; font-style: normal; text-decoration: none; text-transform: none; letter-spacing: 0px; padding: 10px 20px 10px 20px; text-align: center; mso-line-height-rule: exactly"
            >
              <span style="vertical-align: middle;">Learn More</span>
            </a>
            <!--<![endif]-->
          </td>
        </tr>
      </table>
    
    </div>
<div id="1d169450-390b-44b1-9c82-7840f38dc1f3" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="300" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; letter-spacing: normal; text-align: left; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  Sign up for a policy with us and take advantage of a substantial discount through your friend’s referral today!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #1d169450-390b-44b1-9c82-7840f38dc1f3 {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #1d169450-390b-44b1-9c82-7840f38dc1f3 p {
          margin: 0;
        }
        #1d169450-390b-44b1-9c82-7840f38dc1f3 br {
          line-height: inherit;
        }
        #1d169450-390b-44b1-9c82-7840f38dc1f3 sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #1d169450-390b-44b1-9c82-7840f38dc1f3 sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #1d169450-390b-44b1-9c82-7840f38dc1f3 {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>

        </td>
      
        <td class="test-tr-con" width="300" style="vertical-align: top; width: 300px; min-width: 300px">
          <div id="b2e1b480-7231-4d2c-9677-4794b0787e8e" class="email-imagetext pandian">
      <div class="imagetext-outlook-non-outlook" style="width: 100%; padding: 0px 0;">
        <!--[if mso]>
      <table data-type="outlook" role="presentation" border="0" cellpadding="0" cellspacing="0" width="300" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px; background: transparent;">
        <tr>
          <td 
            id="srs" 
            align="center" 
            style="
              padding-top: 0px;
              padding-bottom: 0px;
              padding-right: 0px;
              padding-left: 0px;
            ">
              <table class="imagetext_img_table imagetext-order-1" align="left" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="image rp-empty-image" valign="center" align="center" width="300">
                      
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425142648Picture2.jpg" 
              alt="" 
              style="width: 300px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid; width: 240px;"
              width="240"
              block="2"
              content="false"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                    </td>
                </tr>
              </table>
          </td>
        </tr>
      </table>
    <![endif]-->
        <!--[if !mso]><!-->
      <div class="email-image-container" style="display: flex; width: 100%; background-color: transparent; padding: 0px; max-width: 100%; margin: 0 auto; box-sizing: border-box; text-align: left; justify-content: left"><table class="image-left-content" data-type="image-left-content" role="presentation" border="0" cellpadding="0" cellspacing="0" width="300" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
          <tr>
            <td class="rs-td-test-left-content" style="padding: 0px">
              <table class="imagetext_img_table imagetext-order-1" align="left" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                <tr>
                    <td class="image rp-empty-image rs-left-content" valign="top" align="center" width="300">
                      <span href="javascript:void(0);" class="image-a image-with-link" style="height:auto; max-width:100%; cursor: inherit;">
                        
      <div style="text-align: center;">
            <img 
              class="img-src-elses"
              src="https://runwiz.resul.io//Uploads/LMi/2/ebuilder/110425142648Picture2.jpg" 
              alt="" 
              style="width: 300px; max-width: 100%; height: auto; object-fit: cover; margin: 0px 0px 0px 0px; display: block; border-radius: 0px 0px 0px 0px; border-width: 0px; border-color: black; border-style: solid;"
              width="300"
              // height="NaN"
              height="auto"
              border="0"
            />
          </div>
    
                      </span>
                    </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--<![endif]-->
      </div>
      <style>
        #b2e1b480-7231-4d2c-9677-4794b0787e8e {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }
        #b2e1b480-7231-4d2c-9677-4794b0787e8e img {
          max-width: 100%;
          height: auto;
          -ms-interpolation-mode: bicubic;
          display: block;
        }
        #b2e1b480-7231-4d2c-9677-4794b0787e8e h3 {
          margin: 0 0 8px 0;
        }
        #b2e1b480-7231-4d2c-9677-4794b0787e8e p {
          margin: 0;
        }
        @media only screen and (max-width: 600px) {
          #b2e1b480-7231-4d2c-9677-4794b0787e8e table,
          #b2e1b480-7231-4d2c-9677-4794b0787e8e tr,
          #b2e1b480-7231-4d2c-9677-4794b0787e8e td {
            /* display: block !important;
            width: 100% !important;
            padding: 0 !important; */
          }
          #b2e1b480-7231-4d2c-9677-4794b0787e8e td {
            margin-bottom: 16px;
          }
          #b2e1b480-7231-4d2c-9677-4794b0787e8e td:last-child {
            margin-bottom: 0;
          }
        }
      </style>
    </div>


        </td>
      
        </tr>
      </table>
    
      <style>
        #abf963d3-8652-4d33-a4b6-56ced0985bec {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }
        #abf963d3-8652-4d33-a4b6-56ced0985bec table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        #abf963d3-8652-4d33-a4b6-56ced0985bec td {
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }
        @media only screen and (max-width: 600px) {
          #abf963d3-8652-4d33-a4b6-56ced0985bec table,
          #abf963d3-8652-4d33-a4b6-56ced0985bec tr,
          #abf963d3-8652-4d33-a4b6-56ced0985bec td {
            /* display: block !important;
            width: 100% !important; */
          }
          #abf963d3-8652-4d33-a4b6-56ced0985bec td {
            // margin-bottom: 20px;
          }
          #abf963d3-8652-4d33-a4b6-56ced0985bec td:last-child {
            margin-bottom: 0;
          }
        }
      </style>
    </div>
<div id="6b45307d-7542-47b7-849a-5bcad2c3d472" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; letter-spacing: normal; text-align: left; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: #fff6e2; padding: 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <b>Colorado Farm Bureau® Insurance Company
</b><div>Home Office
</div><div>9177 E Mineral Circle
</div><div>Centennial, CO 80112</div>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #6b45307d-7542-47b7-849a-5bcad2c3d472 {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #6b45307d-7542-47b7-849a-5bcad2c3d472 p {
          margin: 0;
        }
        #6b45307d-7542-47b7-849a-5bcad2c3d472 br {
          line-height: inherit;
        }
        #6b45307d-7542-47b7-849a-5bcad2c3d472 sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #6b45307d-7542-47b7-849a-5bcad2c3d472 sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #6b45307d-7542-47b7-849a-5bcad2c3d472 {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="80548b89-dc32-49e4-bd7a-6c4843d9928b" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; letter-spacing: normal; text-align: left; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: #771024; padding: 1px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <br>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #80548b89-dc32-49e4-bd7a-6c4843d9928b {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #80548b89-dc32-49e4-bd7a-6c4843d9928b p {
          margin: 0;
        }
        #80548b89-dc32-49e4-bd7a-6c4843d9928b br {
          line-height: inherit;
        }
        #80548b89-dc32-49e4-bd7a-6c4843d9928b sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #80548b89-dc32-49e4-bd7a-6c4843d9928b sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #80548b89-dc32-49e4-bd7a-6c4843d9928b {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="2fd1d3fc-e405-43fe-b139-caac52252140" class="email-social">
      
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="background-color: #771024">
          <!--[if mso]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="background-color: #771024;">
            <tr>
          <![endif]-->
          
              <!--[if mso]>
              <td style="padding: 0 0px;">
              <![endif]-->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 0 8px; vertical-align: middle">
                <tr>
                  <td>
                    <a href="undefined" target="_blank" style="text-decoration: none; display: inline-block">
                      <img 
                        src="https://run.resul.io/assets/social/20/facebook.png"
                        alt="facebook"
                        style="width: 24px; height: 24px; display: block; border: 0px; max-width: 100%"
                      />
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              <![endif]-->
            
              <!--[if mso]>
              <td style="padding: 0 0px;">
              <![endif]-->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 0 8px; vertical-align: middle">
                <tr>
                  <td>
                    <a href="" target="_blank" style="text-decoration: none; display: inline-block">
                      <img 
                        src="https://run.resul.io/assets/social/20/youtube.png"
                        alt="youtube"
                        style="width: 24px; height: 24px; display: block; border: 0px; max-width: 100%"
                      />
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              <![endif]-->
            
              <!--[if mso]>
              <td style="padding: 0 0px;">
              <![endif]-->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; margin: 0 8px; vertical-align: middle">
                <tr>
                  <td>
                    <a href="undefined" target="_blank" style="text-decoration: none; display: inline-block">
                      <img 
                        src="https://run.resul.io/assets/social/20/linkedin.png"
                        alt="linkedin"
                        style="width: 24px; height: 24px; display: block; border: 0px; max-width: 100%"
                      />
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              <![endif]-->
            
          <!--[if mso]>
            </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  
    </div>
<div id="6f5375b7-d85c-4b82-9646-6aadc747927f" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; letter-spacing: normal; text-align: center; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: #771024; padding: 10px 0px 20px 0px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        <font color="#ffffff">© 2025 Colorado Farm Bureau® Insurance Company; Southern Farm Bureau® Casualty Insurance Company</font>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #6f5375b7-d85c-4b82-9646-6aadc747927f {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #6f5375b7-d85c-4b82-9646-6aadc747927f p {
          margin: 0;
        }
        #6f5375b7-d85c-4b82-9646-6aadc747927f br {
          line-height: inherit;
        }
        #6f5375b7-d85c-4b82-9646-6aadc747927f sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #6f5375b7-d85c-4b82-9646-6aadc747927f sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #6f5375b7-d85c-4b82-9646-6aadc747927f {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
<div id="fb4c966c-759b-411f-932e-1432c28b775b" class="email-text">
      
      <div class="email-text-container">
        <!--[if mso]>
          <table class="main-column rp-theme-cat-content o" cellspacing="0" cellpadding="0" border="0" width="100%" data-width="600" rp-element-category="content" rp-element-type="text">
        <![endif]-->

        <!--[if !mso]><!-->
          <table class="main-column rp-theme-cat-content g" cellspacing="0" cellpadding="0" border="0" width="100%" rp-element-category="content" rp-element-type="text">
        <!--<![endif]-->

          <tbody>
            <tr>
              <td class="text rp-element-holder-column" style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; letter-spacing: normal; text-align: center; font-weight: normal; font-style: normal; text-transform: none; text-decoration: none; vertical-align: baseline; background-color: transparent; padding: 10px; display: block; word-wrap: break-word; color: inherit;" rp-line-height-auto="yes" rp-saved-text-element="no">
                  
      <div class="email-text-ul" style="
        list-style-position: inside !important;
        padding: 0 !important;
        margin: 0 !important;
        color: #222;
      ">
        If you change your mind at any time and you no longer want to hear from us,  click here to <font color="#29ccf5">unsubscribe</font>
      </div>
    
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <style>
        #fb4c966c-759b-411f-932e-1432c28b775b {
          margin: 0;
          padding: 0;
          width: 100%;
        }
        #fb4c966c-759b-411f-932e-1432c28b775b p {
          margin: 0;
        }
        #fb4c966c-759b-411f-932e-1432c28b775b br {
          line-height: inherit;
        }
        #fb4c966c-759b-411f-932e-1432c28b775b sup {
          vertical-align: super;
          font-size: 0.8em;
          line-height: 0;
        }
        #fb4c966c-759b-411f-932e-1432c28b775b sub {
          vertical-align: sub;
          font-size: 0.8em;
          line-height: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          #fb4c966c-759b-411f-932e-1432c28b775b {
            transition: none !important;
            animation: none !important;
          }
        }
        '& ul': {
          listStyleType: 'disc',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& ol': {
          listStyleType: 'decimal',
          listStylePosition: 'inside',
          paddingLeft: '20px',
          margin: '0.5em 0',
        },
        '& li': {
          margin: '0.25em 0',
          display: 'list-item',
        },
        '& sup': {
          verticalAlign: 'super',
          fontSize: '0.8em',
        },
        '& sub': {
          verticalAlign: 'sub',
          fontSize: '0.8em',
        },
      </style>
    </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    
  <!-- Body End-->
</html><!-- Html End-->`;
