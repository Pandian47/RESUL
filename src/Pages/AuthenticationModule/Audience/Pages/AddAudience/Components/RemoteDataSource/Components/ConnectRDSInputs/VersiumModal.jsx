import { AGREE_TERMS_OF_USE } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Fragment, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSModal from 'Components/RSModal';
import { useNavigate } from 'react-router-dom';
const VersiumModal = ({ show, handleClose, type }) => {
    const navigate = useNavigate();
    const [enable, setEnable] = useState(false);
    const { control, reset } = useFormContext();
    return (
        <RSModal
            show={show}
            size="xl"
            header={'Terms of use'}
            isCloseButton={false}
            // handleClose={handleClose}
            body={
                <Fragment>
                    <div className="elementor-widget-container css-scrollbar padding-R20 elemenator-versium">
                        <p>
                            <span className="versium-font">
                                THIS LICENSE AGREEMENT (“AGREEMENT”) IS A LEGAL AGREEMENT BETWEEN YOU (“YOU”, “YOUR”)
                                AND VERSIUM ANALYTICS, A WASHINGTON CORPORATION WITH ITS PRINCIPAL OFFICE LOCATED AT
                                7530 164TH AVE NE, SUITE A204, REDMOND, WASHINGTON (“VERSIUM”). BY CHECKING THE BOX
                                INDICATING ACCEPTANCE OF THIS AGREEMENT AND CLICKING THE BUTTON TO CONTINUE, ACCEPTING
                                AN ORDERING DOCUMENT THAT INCORPORATES THIS AGREEMENT BY REFERENCE, OR BY OTHER MEANS
                                PROVIDED BY VERSIUM FOR ACCEPTANCE, YOU (A) ACKNOWLEDGE THAT YOU HAVE REVIEWED AND
                                ACCEPT THIS AGREEMENT AND AGREE THAT YOU ARE LEGALLY BOUND BY ITS TERMS EFFECTIVE AS OF
                                THE DATE OF ACCEPTANCE (“EFFECTIVE DATE”); AND (B) REPRESENT AND WARRANT THAT: (I) YOU
                                ARE OF LEGAL AGE TO ENTER INTO A BINDING AGREEMENT; AND (II) IF YOU ARE ENTERING INTO
                                THIS AGREEMENT ON BEHALF OF A CORPORATION, GOVERNMENTAL ORGANIZATION, OR OTHER LEGAL
                                ENTITY, YOU HAVE THE RIGHT, POWER, AND AUTHORITY TO ENTER INTO THIS AGREEMENT ON BEHALF
                                OF SUCH LEGAL ENTITY AND TO BIND SUCH LEGAL ENTITY TO THIS AGREEMENT AND, IN SUCH CASE,
                                ANY REFERENCES TO “YOU” OR “YOUR” IN THIS AGREEMENT REFER TO SUCH ENTITY AND ALL OF ITS
                                EMPLOYEES, CONTRACTORS, AGENTS AND REPRESENTATIVES. IF YOU DO NOT AGREE TO THE TERMS AND
                                CONDITIONS OF THIS AGREEMENT, YOU MUST NOT ACCEPT OR SIGN THIS AGREEMENT AND MAY NOT USE
                                THE LICENSED MATERIALS OR VERSIUM PLATFORM.
                            </span>
                        </p>
                        <p className="mt10">
                            <span className="versium-font">
                                IF YOU HAVE EXECUTED AN ORDERING DOCUMENT IN CONNECTION WITH THIS AGREEMENT, THE
                                ORDERING DOCUMENT AND THE TERMS OF THIS AGREEMENT TOGETHER CONSTITUTE THE AGREEMENT OF
                                THE PARTIES AND ARE REFERRED TO COLLECTIVELY HEREIN AS THE “AGREEMENT.” IN THE EVENT OF
                                ANY CONFLICT BETWEEN THESE TERMS AND AN ORDERING DOCUMENT, THESE TERMS SHALL GOVERN
                                EXCEPT TO THE EXTENT A TERM IN AN APPLICABLE ORDERING DOCUMENT IS EXPRESSLY INTENDED TO
                                MODIFY THESE TERMS.
                            </span>
                        </p>
                        <p className="margin-B20 mt10">
                            <span className="versium-font">
                                NOTE:&nbsp; If you use a “beta” or other pre-release version of the Versium Platform
                                (“Beta Release”), you acknowledge and agree that the Beta Release may contain more,
                                fewer or different features than a subsequent commercial release version of the Versium
                                Platform.&nbsp; While Versium generally intends to distribute commercial release
                                versions of the Versium Platform, Versium reserves the right not to release later
                                commercial release versions of any Beta Release.&nbsp; Without limiting any disclaimer
                                of warranty or other limitation stated herein, you agree that any Beta Release is not
                                considered by Versium to be suitable for commercial use, and that it may contain errors
                                affecting its proper operation. BY ACCEPTING THIS AGREEMENT, YOU ACKNOWLEDGE AND AGREE
                                THAT USE OF A BETA RELEASE MAY EXHIBIT SPORADIC DISRUPTIONS THAT HAVE THE POTENTIAL TO
                                DISRUPT YOUR USE OF THE BETA RELEASE.&nbsp; YOU AGREE THAT VERSIUM HAS NO LIABILITY OR
                                RESPONSIBILITY FOR ANY DAMAGES THAT MAY RESULT FROM YOUR USE OF ANY BETA RELEASE.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>1. Scope, Grant of License</span>
                        </h2>
                        <h3 className="mt10">
                            <span>1.1 Scope</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                This Agreement governs your access to and use of the Versium Platform (Versium Reach,
                                Datafinder or any other Versium product or service) and Licensed Materials identified in
                                your Ordering Document. For purposes of this Agreement “Licensed Materials” means the
                                electronic information content and data made available by Versium to you via the Versium
                                Platform, and “Versium Platform” means the Versium software-as-a-service identified in
                                your applicable Ordering Document. The definition of Versium Platform does not include
                                and specifically excludes Third Party Applications (defined below).
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>1.2 Access and Use License</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Subject to your compliance with the terms and conditions of this Agreement, Versium
                                hereby grants you and your Authorized Users (as defined below), during the Term of this
                                Agreement, a non-exclusive license as more particularly described below in Section 3 to
                                access and use the Versium Platform and to download and use the Licensed
                                Materials.&nbsp;
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>1.3 API</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                If your applicable Ordering Document permits you to use Versium’s application
                                programming interface to build applications that are compatible with the Versium
                                Platform (the “API”), then subject to your compliance with our API documentation and
                                this Agreement, including, without limitation, your payment of all applicable fees, we
                                hereby grant you an additional limited, revocable, non-transferable, non-exclusive,
                                non-sublicensable license to access and use the API and its documentation for the sole
                                purpose of interfacing the Versium Platform with your web-based applications (each a
                                “Subscriber Application”), solely for your own internal business use, and not for
                                timesharing, application service provider or service bureau use.&nbsp; You acknowledge
                                and agree that your use of the API may be subject to volume and other restrictions
                                imposed by Versium from time to time. We may monitor your use of the API to ensure
                                quality, improve our products and services, and verify your compliance with this
                                Agreement.&nbsp; Each Subscriber Application must maintain 100% compatibility with the
                                Versium Platform. If any Subscriber Application implements an outdated version of the
                                API, you acknowledge and agree that such Subscriber Application may not be able to
                                communicate with the Versium Platform. You understand that we may cease support of old
                                versions of the API.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>1.4 Third Party Applications</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                “Third Party Applications” means computer software programs and other technology that
                                are provided or made available to you or Authorized Users by third parties, including
                                those with which the Versium Platform may interoperate, including, for example, your CRM
                                software, marketing automation software, or sales enablement software, if any. Versium
                                is not responsible for and does not endorse any Third Party Applications, services or
                                websites linked to by the Versium Platform.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>2. Fees &amp; Taxes</span>
                        </h2>
                        <h3 className="mt10">
                            <span>2.1 Fees and Payment</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall pay all fees stated in the Ordering Document (the “Subscription Fee”). All
                                Subscription Fees are due upon execution of the Ordering Document and payable on the
                                terms set forth therein. If no payment schedule is specified, the entire amount of the
                                Subscription Fee shall be payable within 30 days of invoice. All amounts payable by You
                                under this Agreement will be paid to Versium without setoff or counterclaim, and without
                                any deduction or withholding.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>2.2 Certain Remedies for Non-Payment</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                In the event that you fail to timely make any payment of Subscription Fees, Versium may,
                                in its sole discretion, (i) restrict or suspend your and your Authorized Users’ access
                                to the Versium Platform and/or Licensed Materials until all past-due payments are made,
                                (ii) terminate this Agreement, or (iii) accelerate the payment of Subscription Fees such
                                that all unpaid Subscription Fees shall be immediately payable. Versium shall have the
                                right to charge interest at the rate of 1.5% per month (or, if less, the highest rate
                                permitted by law) on any late payments. Restriction or suspension of online access to
                                the Licensed Materials during a period of non-payment shall have no effect on the Term
                                of this Agreement nor on your obligation to pay the Subscription Fee.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>2.3 Taxes</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You are responsible for any applicable taxes, including, without limitation, any sales,
                                use, levies, duties, or any value added or similar taxes payable with respect to your
                                and your Authorized Users access to and use of the Versium Platform and/or Licensed
                                Materials and assessed by any local, state, provincial, federal, or foreign
                                jurisdiction. Unless expressly specified otherwise in the Ordering Document, all fees,
                                rates, and estimates exclude sales taxes. If Versium believes any such tax applies to
                                such access and use and Versium has a duty to collect and remit such tax, the same may
                                be set forth on an invoice to you unless you provide Versium with a valid tax exemption
                                certificate, direct pay permit, or multi-state use certificate.&nbsp; You shall pay any
                                such invoice immediately or as provided in such invoice. You shall indemnify, defend,
                                and hold harmless Versium and its officers, directors, employees, shareholders, agents,
                                partners, successors, and permitted assigns against any and all actual or threatened
                                claims, actions, or proceedings of any taxing authority arising from or related to the
                                failure to pay taxes owed by you, except to the extent that any such claim, action, or
                                proceeding is directly caused by a failure of Versium to remit amounts collected for
                                such purpose from you. Versium is solely responsible for taxes based upon Versium’s net
                                income, assets, payroll, property, and employees.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>3. Authorized Use of Licensed Materials and Versium Platform</span>
                        </h2>
                        <h3 className="mt10">
                            <span>3.1 Authorized Users</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                An “Authorized User” is a natural person who is your employee and who has been
                                identified and designated in writing by you and accepted by Versium. You may designate a
                                natural person who is not your employee (i.e. an independent contractor) as an
                                Authorized User only with Versium’s prior permission and only where such person is
                                contractually obligated to comply with your instructions regarding the access to and use
                                of the Licensed Materials. In the event that any Authorized User’s employment or
                                contractual relationship with you terminates, such person’s authorization to access the
                                Licensed Materials and/or any Versium Platform shall be automatically revoked without
                                any further action by Versium. In the event of a termination as described in the
                                previous sentence, you shall promptly notify Versium so that such person’s login
                                credentials can be disabled. You may reassign the Authorized User designation at any
                                time subject to the foregoing qualification requirements. Authorized User licenses that
                                remain inactive for more than 90 days may be deemed expired. Each Authorized User will
                                be provided a unique username and password. If authentication to the API is necessary,
                                Versium will also issue you a unique API key, which must be referenced in your
                                Subscriber Application’s API calls. Such usernames, passwords and API keys may not be
                                shared, and may not under any circumstances be used by anyone who is not an Authorized
                                User to gain access to the Licensed Materials. In the event that Authorized User login
                                credentials are shared with non-Authorized Users, you shall pay additional Authorized
                                User fees as provided in the Ordering Document, due upon your receipt of invoice for
                                such fees. You shall be responsible for compliance with the terms of this Agreement by
                                all Authorized Users, including, without limitation, the restrictions on use and
                                transfer of the Licensed Materials set forth herein.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>3.2 Authorized Uses</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Neither you nor Authorized Users shall access or use the Versium Platform or Licensed
                                Materials for any purpose other than the sales, marketing, or business development
                                activities expressly permitted by this Section. Neither you nor Authorized Users shall
                                access or use the Versium Platform or Licensed Materials for the benefit of or on behalf
                                of any person or entity except you. Authorized uses shall be limited to the following:
                                (i) to view the Licensed Materials; (ii) to communicate with a person identified in the
                                Licensed Materials (each such person, a “Licensed Materials Contact”) and (iii) to
                                download and print selected information from the Licensed Materials.&nbsp; You{' '}
                            </span>
                            <span>
                                are solely responsible for any communications by you or your Authorized Users with any
                                Licensed Materials Contact.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>3.3 Restrictions on Use</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall not (a) permit anyone who is not an Authorized User to use any username or
                                password or otherwise access or use the Licensed Materials; (b) redistribute,
                                sublicense, transfer, sell, offer for sale, or disclose any of the Licensed Materials to
                                any third party; (c) incorporate any of the Licensed Materials into your own products or
                                services; (d) reverse assemble, reverse engineer, decompile, or otherwise attempt to
                                derive source code from any of the Versium Platform; (e) reproduce, modify, create, or
                                prepare derivative works of any of the Versium Platform or related documentation; (f)
                                distribute or display any of the Versium Platform or related documentation other than to
                                Authorized Users; (g) share, sell, rent, or lease or otherwise distribute access to the
                                Versium Platform, or use the Versium Platform to operate any timesharing, service
                                bureau, or similar business; (h) create any security interest in the Versium Platform or
                                Licensed Materials; (i) alter, destroy, or otherwise remove any proprietary notices or
                                labels on or embedded within or on the Licensed Materials, Versium Platform or related
                                documentation; (j) cache Versium Data&nbsp;and/or build a database from the Versium
                                Data; (k) upload in any way any information or content that contain Malicious Code or
                                data that may damage the operation of the Versium Platform or another’s computer or
                                mobile device; (l) interfere with or disrupt networks connected to the Versium Platform
                                or interfere with any other’s ability to access or use the Versium Platform; (m)
                                distribute, promote or transmit through the Versium Platform any unlawful, harmful,
                                obscene, pornographic or otherwise objectionable material of any kind or nature; (n)
                                interfere with another customer’s use and enjoyment of the Versium Platform or the
                                Licensed Materials; (o) use the Versium Platform in any manner that impairs the Versium
                                Platform, including without limitation the servers and networks on which the Versium
                                Platform is provided; (p) name or refer to Versium or your use of Versium data in any of
                                your advertisements or promotional or marketing materials without prior written
                                permission from Versium; (q) use Licensed Materials for consumer credit purposes,
                                underwriting any form of consumer insurance, employment purposes, tenant screening
                                purposes, consumer debt collections or for any other purpose covered by the federal Fair
                                Credit Reporting Act (15 U.S.C.§1681, et seq.), or (r)
                            </span>
                            <span>
                                {' '}
                                disclose the results of your use of the Versium Platform or program benchmark tests to
                                any third parties without Versium’s prior written consent.
                            </span>
                            <span>
                                {' '}
                                Versium may remove any violating content posted or stored using the Versium Platform or
                                transmitted through the Versium Platform, without notice to you.&nbsp; Notwithstanding
                                the foregoing, Versium does not guarantee, and does not and is not obligated to verify,
                                authenticate, monitor or edit the Licensee Data, for completeness, integrity, quality,
                                accuracy or otherwise. You are solely responsible and liable for the completeness,
                                integrity, quality and accuracy of Licensee Data input into the Versium Platform.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>3.4 Identification of Licensed Materials</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Neither you nor any Authorized User shall integrate Licensed Materials into any CRM,
                                marketing automation, or sales enablement system and allow persons who are not
                                Authorized Users to access or use the Licensed Materials. Any Licensed Materials that
                                are downloaded and/or integrated into any CRM system must be maintained with identifying
                                information indicating that such materials originated with Versium by, for example,
                                maintaining a lead source of “Versium.”&nbsp;
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>4. Versium Obligations</span>
                        </h2>
                        <h3 className="mt10">
                            <span>4.1 Support</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Versium will provide reasonable assistance with activation and/or installation support,
                                including assisting with integration with your CRM, marketing automation, or sales
                                enablement systems, as applicable. Versium will offer reasonable levels of continuing
                                support to assist you and Authorized Users in accessing the Licensed Materials. Versium
                                will make its personnel available by email, online chat, phone, or fax for feedback,
                                problem solving, or general questions between the hours of 7:00 a.m. and 4:00 p.m.
                                Pacific Time.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>4.2 Security</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Versium will maintain administrative, physical, and technical safeguards designed to
                                protect the security, confidentiality and integrity of Licensee Data (as defined below),
                                which will include, but will not be limited to, measures for preventing access, use,
                                modification or disclosure of Licensee Data by Versium except (a) to perform Versium’s
                                obligations under this Agreement, (b) as compelled by law, or (c) as you otherwise
                                permit in writing. To the extent that you utilize the Versium Platform, Versium will
                                make commercially reasonable efforts consistent with its research protocols and
                                priorities, to respond to match and clean and append requests by researching and/or
                                verifying business contact information so submitted and supplementing the Licensed
                                Materials. Versium may use email deliverability data (such as email “bounce” data)
                                accessible through your use of the Versium Platform to improve Versium’s database by,
                                for example, eliminating invalid email addresses from the Licensed Materials.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>5. Your Obligations</span>
                        </h2>
                        <h3 className="mt10">
                            <span>5.1 Compliance with All Laws</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">You </span>
                            <span className="versium-font">
                                acknowledge and agree:&nbsp; (a) to abide by all local, state, national, and
                                international laws and regulations applicable to your actions under this Agreement and
                                the use of the Versium Platform and Licensed Materials by you and Your Authorized Users;
                                (b) not to send or store data on or to the Versium Platform which violates the rights of
                                any individual or entity established in any jurisdiction; (c) not to upload in any way
                                any data regarding an individual’s financial or economic identity, sexual orientation,
                                religious beliefs, medical or physical identity, including any information comprised of
                                either “Protected Health Information” subject to and defined by the Health Insurance
                                Portability and Accountability Act, or an individual’s first name and last name, or
                                first initial and last name, in combination with any one or more of the following data
                                elements that relate to such individual: Social Security number, passport identification
                                number, driver’s license number or government issued identification card number,
                                financial account number, or credit or debit card number, with or without any required
                                security code, access code, personal identification number or password, that would
                                permit access to an individual’s financial account; (d) not to use the Versium Platform
                                or Licensed Materials for illegal, fraudulent, unethical or inappropriate purposes; and
                                (e) not to transmit or post any material that encourages conduct that could constitute a
                                criminal offense or give rise to civil liability. You further agree that during the term
                                of this Agreement you and your Authorized Users will fully comply with all state,
                                federal and international data privacy laws that may be applicable to your and their
                                businesses and business practices including, but not limited to, the California Consumer
                                Privacy Act, the California Privacy Rights Act of 2020, the Colorado Privacy Act, the
                                Connecticut Personal Data Privacy and Online Monitoring Act, the Utah Consumer Privacy
                                Act, the Virginia Consumer Data Protection Act, and the Nevada Security and Privacy of
                                Personal Information Act.
                            </span>
                            <span className="versium-font">
                                You acknowledge and agree that Versium neither endorses the contents of your
                                communications or Licensee Data nor assumes any responsibility for any offensive
                                material contained therein, any infringement of third-party intellectual property rights
                                arising therefrom, or any crime facilitated thereby.&nbsp;&nbsp;
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>5.2 Identification of Authorized Users</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall identify all Authorized Users to Versium by providing names, work email
                                addresses, and telephone numbers.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>5.3 Provision of Notice of License Terms to Authorized Users</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall provide Authorized Users with notice of all the terms and conditions of the
                                End User License Agreement including, but not limited to, its limitations on access to
                                or use of the Licensed Materials.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>5.4 Do Not Call Compliance</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                In the event that Versium provides a telephone number as part of the Licensed Materials,
                                you acknowledge that Versium has not processed its databases against the National Do Not
                                Call Registry, State Phone Suppression files and DMA Phone Suppression files, the
                                “Telephone Number Suppression files”. By using the Versium Platform, you acknowledge
                                that some of the individuals provided by Versium may have placed their telephone numbers
                                on Telephone Number Suppression files. You also acknowledge that you will either obtain
                                access to the Telephone Number Suppression files, or if you do not obtain access to
                                Telephone Number Suppression files, you will only make calls for purposes permitted by
                                law.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>5.5 Temporary Suspension</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Versium may temporarily suspend your or your Authorized Users’ access to the Versium
                                Platform in the event that you or any Authorized User is engaged in, or Versium in good
                                faith suspects you or an Authorized User is engaged in, any unauthorized conduct
                                (including, but not limited to, any violation of this Agreement). Versium will attempt
                                to contact you prior to or contemporaneously with such suspension; provided, however,
                                that Versium’s exercise of the suspension rights herein shall not be conditioned upon
                                your receipt of any notification. A suspension may take effect for your entire account
                                and you understand that such suspension would therefore include your Authorized User
                                sub-accounts.&nbsp; You agree that Versium shall not be liable to you, any Authorized
                                User, or any other third party if Versium exercises its suspension rights as permitted
                                by this Section.&nbsp; Upon determining that you have ceased the unauthorized conduct
                                leading to the temporary suspension to Versium’s reasonable satisfaction, Versium shall
                                reinstate your and your Authorized Users’ access and use of the Versium Platform.
                                Notwithstanding anything in this Section to the contrary, Versium’s suspension of access
                                to the Versium Platform is in addition to any other remedies that Versium may have under
                                this Agreement or otherwise, including but not limited to termination of this Agreement
                                for cause.&nbsp; Additionally, if there are repeated incidences of suspension,
                                regardless of the same or different cause and even if the cause or conduct is ultimately
                                cured or corrected, Versium may, in its reasonable discretion, determine that such
                                circumstances, taken together, constitute a material breach of this Agreement.
                            </span>
                        </p>
                        <p className="mt10">
                            <span>5.6 Responsibility for Authorized Users</span>
                        </p>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall be solely responsible for your actions and the actions of your Authorized
                                Users while using the Versium Platform.&nbsp;You shall be responsible for compliance
                                with all terms of this Agreement by all Authorized Users, including, without limitation,
                                the restrictions on use and transfer of the Licensed Materials as set forth herein. You
                                shall ensure that no Authorized User takes any action inconsistent with your obligations
                                under this Agreement.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>6 Referral Program</span>
                        </h2>
                        <p className="mt10">
                            <span className="versium-font">
                                The referral program is available to active subscribers of Versium REACH. As a Versium
                                REACH subscriber you can refer customers to Versium REACH by sending them a referral
                                link from the Referral Link page. If the company you refer subscribes to Versium REACH
                                for a minimum 1 year subscription contract within 90 days from the time you send them
                                the referral link, you are entitled to a referral credit of $50 per referral once the
                                referral subscriber has made their first payment. This credit is applied as a one-time
                                discount to your next or future invoice as long as you are an active Versium REACH
                                subscriber. Versium shall have the sole right and responsibility for tracking Referrer
                                signups.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>7. Terms and Termination</span>
                        </h2>
                        <h3 className="mt10">
                            <span>7.1 Term</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                The Initial Term of this Agreement is specified in the Ordering Document (and, together
                                with all periods of extension, the “Term”). On the last day of the Term, the Term will
                                extend for a successive period equal to the length of the Initial Term, unless either
                                party notifies the other in writing at least sixty (60) days prior to the end of the
                                then-current Term of its intent that the Term not so extend. In the event that the Term
                                is so extended, the Subscription Fee for the period of such extension shall equal the
                                Subscription Fee applicable to the period of equal length immediately preceding such
                                period of extension (the “Preceding Period”), plus (1) 10% of such fee and (2) any
                                applied discount. Such Subscription Fee shall be due upon extension of the Term, and
                                shall be payable as invoiced. Versium will invoice Subscription Fees for any period of
                                extension in a manner substantially consistent with the payment schedule that applied
                                during the Preceding Period.
                            </span>
                        </p>
                        <p className="mt10">
                            <span>7.2 Termination for Breach</span>
                            <span>.&nbsp;&nbsp;</span>
                        </p>
                        <p>&nbsp;</p>
                        <p>
                            <span className="versium-font">
                                Either party may terminate this Agreement immediately, without further obligation to the
                                other party, in the event of a material breach of this Agreement by the other party that
                                is not remedied within twenty-one (21) days after the breaching party’s receipt of
                                written notice of such breach.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>7.3 Effect of Termination</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Upon expiration or termination of this Agreement, you acknowledge and agree that your
                                access to the Licensed Materials will be automatically terminated, all passwords and
                                individual accounts will be removed, and all information that has been uploaded into
                                Versium’s systems by you may be destroyed. Download capability will be disabled 30 days
                                prior to the end of the Term. Upon expiration or termination of this Agreement, you
                                agree to destroy any and all copies of Licensed Materials and any information you have
                                obtained from the Licensed Materials, whether in hard copy or electronic form.{' '}
                            </span>
                            <span className="versium-font">
                                All fees for data services delivered up to the point of termination shall be due and
                                payable within 30 days.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>8. Marketing</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                You hereby authorize Versium to use your name and logo for its marketing efforts unless
                                and until such authorization is revoked by you in writing.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>9. Confidentiality</span>
                        </h2>
                        <h3 className="mt5">
                            <span>9.1 Confidential Information</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                “Confidential Information” means any and all non-public technical and non-technical
                                information disclosed by one party (the “Disclosing Party”) to the other party (the
                                “Receiving Party”) in any form or medium, whether oral, written, graphical or
                                electronic, pursuant to this Agreement, that is marked confidential and proprietary, or
                                that the Disclosing Party identifies as confidential and proprietary, or that by the
                                nature of the circumstances surrounding the disclosure or receipt ought to be treated as
                                confidential and proprietary information, including but not limited to: (a) techniques,
                                sketches, drawings, models, inventions (whether or not patented or patentable),
                                know-how, processes, apparatus, formulae, equipment, algorithms, software programs,
                                software source documents, APIs, and other creative works (whether or not copyrighted or
                                copyrightable); (b) information concerning research, experimental work, development,
                                design details and specifications, engineering, financial information, procurement
                                requirements, purchasing, manufacturing, customer lists, business forecasts, sales and
                                merchandising and marketing plans and information; (c) proprietary or confidential
                                information of any third party who may disclose such information to Disclosing Party or
                                Receiving Party in the course of Disclosing Party’s business; and (d) the terms of this
                                Agreement. Confidential Information of Versium shall include the Versium Platform, the
                                documentation, the pricing, and the terms and conditions of this Agreement. Confidential
                                Information also includes all summaries and abstracts of Confidential Information.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>9.2 Non-Disclosure</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Each party acknowledges that in the course of the performance of this Agreement, it may
                                obtain the Confidential Information of the other party.&nbsp; The Receiving Party shall,
                                at all times, both during the Term and thereafter, keep in confidence and trust all of
                                the Disclosing Party’s Confidential Information received by it. The Receiving Party
                                shall not use the Confidential Information of the Disclosing Party other than as
                                necessary to fulfill the Receiving Party’s obligations or to exercise the Receiving
                                Party’s rights under this Agreement.&nbsp; Each party agrees to secure and protect the
                                other party’s Confidential Information with the same degree of care and in a manner
                                consistent with the maintenance of such party’s own Confidential Information (but in no
                                event less than reasonable care), and to take appropriate action by instruction or
                                agreement with its employees, affiliates or other agents who are permitted access to the
                                other party’s Confidential Information to satisfy its obligations under this
                                Section.&nbsp; The Receiving Party shall not disclose Confidential Information of the
                                Disclosing Party to any person or entity other than its officers, employees, affiliates
                                and agents who need access to such Confidential Information in order to affect the
                                intent of this Agreement and who are subject to confidentiality obligations at least as
                                stringent as the obligations set forth in this Agreement.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>9.3 Exceptions to Confidential Information</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                The obligations set forth in Section 8.2 (Non-Disclosure) shall not apply to the extent
                                that Confidential Information includes information which:&nbsp; (a) was known by the
                                Receiving Party prior to receipt from the Disclosing Party either itself or through
                                receipt directly or indirectly from a source other than one having an obligation of
                                confidentiality to the Disclosing Party; (b) was developed by the Receiving Party
                                without use of the Disclosing Party’s Confidential Information; or (c) becomes publicly
                                known or otherwise ceases to be secret or confidential, except as a result of a breach
                                of this Agreement or any obligation of confidentiality by the Receiving Party.&nbsp;
                                Nothing in this Agreement shall prevent the Receiving Party from disclosing Confidential
                                Information to the extent the Receiving Party is legally compelled to do so by any
                                governmental investigative or judicial agency pursuant to proceedings over which such
                                agency has jurisdiction; provided, however, that prior to any such disclosure, the
                                Receiving Party shall (x) assert the confidential nature of the Confidential Information
                                to the agency; (y) immediately notify the Disclosing Party in writing of the agency’s
                                order or request to disclose; and (z) cooperate fully with the Disclosing Party in
                                protecting against any such disclosure and in obtaining a protective order narrowing the
                                scope of the compelled disclosure and protecting its confidentiality.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>9.4 Injunctive Relief</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                The parties agree that any unauthorized disclosure of Confidential Information may cause
                                immediate and irreparable injury to the Disclosing Party and that, in the event of such
                                breach, the Disclosing Party will be entitled, in addition to any other available
                                remedies, to seek immediate injunctive and other equitable relief, without bond and
                                without the necessity of showing actual monetary damages.&nbsp;&nbsp;
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>9.5 Return of Confidential Information</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                All Confidential Information shall be returned to the Disclosing Party or destroyed upon
                                the earlier of: (a) the termination of this Agreement; or (b) receipt by the Receiving
                                Party of a written request from the Disclosing Party.&nbsp;
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>10. Property Rights</span>
                        </h2>
                        <h3 className="mt10">
                            <span>10.1 Versium Platform; Licensed Materials</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                As between Versium and you, all right, title and interest in the Versium Platform and
                                any Licensed Materials furnished or made available hereunder, and all modifications and
                                enhancements thereof, and all suggestions, ideas and feedback proposed by you regarding
                                the Versium Platform and/or Licensed Materials, including all copyright rights, patent
                                rights and other intellectual property rights in each of the foregoing, belong to and
                                are retained solely by Versium or Versium’s licensors and providers, as
                                applicable.&nbsp; Versium Licensed Materials means all data and scores owned and or
                                operated by Versium including any pre-existing databases it maintains and any data
                                enhancements made as a result of derivative works used to improve Versium’s data
                                management systems. Should you provide Versium with written feedback regarding your use
                                of the Versium Platform and/or Licensed Materials, any bugs, errors or deficiencies that
                                you encounter regarding the operation and functionality of the Versium Platform or any
                                suggestions that you may have regarding improvement of such operation and functionality
                                (“Feedback”), you hereby irrevocably assign to Versium all such Feedback and all
                                intellectual property rights in such Feedback.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>10.2 Licensee Data</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                ”Licensee Data” means (a) all data submitted, stored, posted, displayed, or otherwise
                                transmitted by or on behalf of you or any Authorized User and received and analyzed by
                                the Versium Platform and (b) all intellectual property rights in the foregoing.&nbsp; As
                                between Versium and you, all right, title and interest in Licensee Data belong to and
                                are retained solely by you.&nbsp; You hereby grant Versium a limited, non-exclusive,
                                royalty-free, worldwide license to use the Licensee Data and perform all acts with
                                respect to the Licensee Data as may be necessary for Versium to provide the Versium
                                Platform and Licensed Materials to you, and a non-exclusive, perpetual, irrevocable,
                                worldwide, royalty-free, fully paid license to use, reproduce, modify and distribute the
                                Licensee Data as a part of the Aggregated Statistics (as defined below).&nbsp; As
                                between Versium and you, you are solely responsible for the accuracy, quality,
                                integrity, legality, reliability, and appropriateness of all Licensee Data. To the
                                extent that Versium already has Licensee Data attributes in its systems, Versium shall
                                retain full rights to such data and any derivative works thereof.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>10.3&nbsp; Aggregated Statistics</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Notwithstanding anything else in this Agreement or otherwise, Versium may monitor your
                                and your Authorized Users’ use of the Versium Platform and use data and information
                                related to such use and create derivatives of the Licensee Data in an aggregate and
                                anonymous manner, including to compile statistical and performance information related
                                to the provision and operation of the Versium Platform (“Aggregated Statistics”).&nbsp;
                                As between Versium and you, all right, title and interest in the Aggregated Statistics
                                and all intellectual property rights therein, belong to and are retained solely by
                                Versium.&nbsp; You acknowledge that Versium will be compiling Aggregated Statistics
                                based on Licensee Data and information input by other customers into the Versium
                                Platform and you agree that Versium may (a) make such Aggregated Statistics publicly
                                available, and (b) use such information to the extent and in the manner required by
                                applicable law or regulation and for purposes of data gathering, analysis, service
                                enhancement and marketing, provided that such data and information does not identify
                                you.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>11. Non-assignment</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                Either party hereto may assign this Agreement to a successor-in-interest pursuant to an
                                acquisition of such party (whether by merger, stock sale, or asset sale) without the
                                other party’s consent, provided however that (1) your assignment hereof shall be
                                effective only after fourteen (14) days’ written notice to Versium, and (2) you may not
                                assign this Agreement to any competitor of Versium without Versium’s express written
                                consent. No rights or obligations under this Agreement may be assigned or delegated
                                except as provided in this Section without the prior written consent of the other party,
                                and any assignment or delegation in violation of this section shall be void.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>12. Notices</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                You shall provide an email address for notices under this Agreement. All notices or
                                other communications permitted or required to be given hereunder shall be sent by
                                electronic mail to the email address provided by the other party for such purpose and
                                shall be deemed given when sent. Notices to Versium shall be sent to legal@versium.com.
                                In the event that you fail to provide an email address for notices, Versium may provide
                                notices hereunder by any means reasonably calculated to provide you with actual notice
                                thereof.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>13. Governing Law</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                This Agreement shall be construed in accordance with and governed for all purposes by
                                the laws of the United States and the State of Washington without regard to choice of
                                law principles. The parties agree that the United Nations Convention on Contracts for
                                the International Sale of Goods is specifically excluded from application to this
                                Agreement.&nbsp; The parties further agree to waive and opt-out of any application of
                                the Uniform Computer Information Transactions Act (UCITA), or any version thereof,
                                adopted by any state of the United States in any form. The parties acknowledge that this
                                Agreement evidences a transaction involving interstate commerce.&nbsp;
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>14. Attorney Fees, Dispute Resolution, Class Action Waiver</span>
                        </h2>
                        <h3 className="mt10">
                            <span>14.1 Attorney Fees</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                In the event of any dispute arising under this Agreement, the prevailing party shall be
                                entitled to recover its reasonable costs and expenses actually incurred in endeavoring
                                to enforce the terms of this Agreement, including reasonable attorney fees.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>14.2 Mandatory Arbitration</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Except for Litigation Claims (defined below), any dispute, claim, or controversy arising
                                out of or relating to this Agreement, including without limitation (1) claims relating
                                to the breach, termination, enforcement, interpretation or validity thereof, (2) claims
                                alleging tortious conduct (including negligence) in connection with the negotiation,
                                execution, or performance thereof, or (3) the determination of the scope or
                                applicability of this agreement to arbitrate, shall be settled by arbitration
                                administered by JAMS pursuant to its Comprehensive Arbitration Rules and Procedures and
                                in accordance with the Expedited Procedures in those Rules or pursuant to JAMS’
                                Streamlined Arbitration Rules and Procedures. The arbitration shall be heard by a single
                                arbitrator and shall be conducted in Seattle, Washington. Judgment on the award may be
                                entered in any court having jurisdiction. This clause shall not preclude parties from
                                seeking provisional remedies in aid of arbitration from a court of appropriate
                                jurisdiction. The arbitrator shall have the power to award any remedy provided under
                                applicable law, except that the arbitrator shall have no power to award: (1) punitive,
                                exemplary, or multiple damages under any legal theory; (2) mandatory or prohibitory
                                injunctive relief, except for temporary relief in aid of the arbitration or to secure
                                the payment of an award; or (3) any damages in excess of the limits set forth in this
                                section or Section 16 (Limitation on Liability) of this Agreement. Any arbitration
                                conducted pursuant to the terms of this Agreement shall be governed by the Federal
                                Arbitration Act (9 U.S.C. §§ 1-16).&nbsp;
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>14.3 Class Action Waiver</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                No party shall commence or seek to prosecute or defend any dispute, controversy, or
                                claim based on any legal theory arising out of or relating to this Agreement, or the
                                breach thereof, other than on an individual, non-className, non-collective action basis.
                                No party shall seek to prosecute or defend any dispute, controversy, or claim arising
                                out of or relating to this Agreement, or the breach thereof, in a representative or
                                private attorney general capacity. The arbitrator shall not have the power to
                                consolidate any arbitration under this Agreement with any other arbitration, absent
                                agreement of all parties involved, or otherwise to deal with any matter on a
                                non-individual, className, collective, representative, or private attorney general
                                basis.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>14.4 Litigation Claims</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                The following claims (“Litigation Claims”) shall be litigated and not arbitrated: (a)
                                claims against a party to this Agreement under the provisions involving claims by third
                                parties; (b) claims by a party for the unauthorized use, or the misuse, by the other
                                party of the first party’s intellectual property or confidential, proprietary, or
                                sensitive information; (c) claims by Versium to collect Subscription Fees; and (d)
                                claims for a provisional remedy (such as a temporary restraining order or preliminary
                                injunction) in aid of an arbitration under this Agreement. The Litigation Claims are not
                                subject to arbitration and are expressly excluded by the parties from arbitration.
                            </span>
                            <span className="versium-font">
                                {' '}
                                With regard to the litigation of any Litigation Claims, you hereby irrevocably consent
                                to personal jurisdiction and venue in the state and federal courts located in King
                                County,&nbsp;Washington.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>15. Currency</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                All monetary amounts specified in this Agreement are in United States dollars unless
                                otherwise expressly stated.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>16. Indemnification</span>
                        </h2>
                        <h3 className="mt10">
                            <span>16.1 Indemnification of Versium</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                You agree to indemnify, defend, and hold harmless Versium and its officers, directors,
                                employees, shareholders, agents, partners, successors, and permitted assigns from and
                                against any and all actual or threatened claims of third parties arising out of or in
                                connection with (1) your or your Authorized Users’ access or use of the Versium Platform
                                and/or Licensed Materials in violation of any law, (2) your or your Authorized Users’
                                violation of any provision of this Agreement, (3) your or your Authorized Users’ sending
                                of any information, messages, or materials to any Licensed Materials Contact (including,
                                but not limited to, through e-mail, mail, or fax) in violation of any law or the rights
                                of any third party, or (4) the use of any Licensed Materials or the Versium Platform by
                                any third party to whom you have granted access (including access obtained through use
                                of the usernames and passwords assigned to you and your Authorized Users).
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>16.2 Indemnification of You</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                Versium shall indemnify you for any damages finally awarded by any court of competent
                                jurisdiction against you, or for amounts paid by you under a settlement approved by
                                Versium in writing, in any legal proceeding brought by a third party against you
                                alleging that the Licensed Materials or Versium Platform infringes upon or violates the
                                intellectual property rights of any such third party.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>16.3 Indemnification Procedure</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                As a condition to any right to indemnification under this Agreement, the indemnified
                                party must (a) promptly give the indemnifying party written notice of the claim or
                                proceeding, (b) give the indemnifying party sole control of the defense and settlement
                                of the claim or proceeding (except that the indemnifying party may not settle any claim
                                or proceeding unless it unconditionally releases the indemnified party of all
                                liability), and (c) give the indemnifying party all reasonable assistance, at the
                                indemnifying party’s expense. This section states the indemnifying party’s sole
                                liability to, and the indemnified party’s exclusive remedy against, the other party for
                                any claim or proceeding subject to indemnification hereunder.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>16.4 Versium Privacy Policy&nbsp;</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                By registering for and using the Versium Platform, you agree&nbsp; to the{' '}
                            </span>
                            <a href="https://versium.com/privacy-policy">
                                <span className="versium-font">Versium Privacy Policy</span>
                            </a>
                            <span className="versium-font">
                                .&nbsp; Users of the Versium Platform can choose to opt out of certain information
                                sharing or, depending on their residency, exercise other rights related to their
                                personal information. For more information, go to the{' '}
                            </span>
                            <a href="https://versium.com/privacy-policy">
                                <span>Versium Privacy Policy</span>
                            </a>
                            <span className="versium-font"> and the </span>
                            <a href="https://versium.com/ccpa-opt-out">
                                <span>Versium Opt-Out Page</span>
                            </a>
                            <span>.</span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>17. Limitation on Liability</span>
                        </h2>
                        <h3 className="mt10">
                            <span>17.1 No Consequential Damages</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                NEITHER VERSIUM NOR ITS LICENSORS OR SUPPLIERS SHALL BE LIABLE FOR ANY INDIRECT,
                                INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY DAMAGES FOR LOST DATA,
                                BUSINESS INTERRUPTION, LOST PROFITS, LOST REVENUE OR LOST BUSINESS, ARISING OUT OF OR IN
                                CONNECTION WITH THIS AGREEMENT, EVEN IF VERSIUM OR ITS LICENSORS OR SUPPLIERS HAVE BEEN
                                ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, INCLUDING WITHOUT LIMITATION, ANY SUCH
                                DAMAGES ARISING OUT OF THE LICENSING, PROVISION OR USE OF THE VERSIUM PLATFORM, THE
                                LICENSED MATERIALS OR THE RESULTS OF SUCH USE. VERSIUM WILL NOT BE LIABLE FOR THE COST
                                OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>17.2 Limits on Liability</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                NEITHER VERSIUM NOR ITS LICENSORS OR SUPPLIERS SHALL BE LIABLE FOR CUMULATIVE, AGGREGATE
                                DAMAGES GREATER THAN AN AMOUNT EQUAL TO THE AMOUNTS PAID BY YOU TO VERSIUM UNDER THIS
                                AGREEMENT DURING THE PERIOD OF TWELVE (12) MONTHS PRECEDING THE DATE ON WHICH THE CLAIM
                                FIRST ACCRUED.
                            </span>
                        </p>
                        <h3 className="mt10">
                            <span>17.3 Essential Purpose</span>
                        </h3>
                        <p className="mt5">
                            <span className="versium-font">
                                YOU ACKNOWLEDGE THAT THE TERMS IN THIS SECTION 17 (LIMITATION OF LIABILITY) SHALL APPLY
                                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW AND SHALL APPLY EVEN IF AN EXCLUSIVE
                                OR LIMITED REMEDY STATED HEREIN FAILS OF ITS ESSENTIAL PURPOSE WITHOUT REGARD TO WHETHER
                                SUCH CLAIM IS BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR
                                OTHERWISE.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>18. Disclaimer</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                EXCEPT FOR ANY EXPRESS REPRESENTATIONS AND WARRANTIES STATED IN THIS AGREEMENT, THE
                                LICENSED MATERIALS AND VERSIUM PLATFORM ARE PROVIDED “AS IS” AND VERSIUM MAKES NO
                                ADDITIONAL REPRESENTATION OR WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED (EITHER IN
                                FACT OR BY OPERATION OF LAW), OR STATUTORY, AS TO ANY MATTER WHATSOEVER AND VERSIUM
                                EXPRESSLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                                PURPOSE, QUALITY, ACCURACY, TITLE, AND NON-INFRINGEMENT.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>19. Entire Agreement</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                This Agreement constitutes the entire Agreement of the parties and supersedes all prior
                                communications, understandings, and agreements relating to the subject matter hereof,
                                whether oral or written. Any un-expired subscription set forth in any Ordering Document
                                or agreement between the parties for access to the Versium Platform is incorporated into
                                this Agreement and governed by this Agreement.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>20. Amendments</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                Versium may propose amendments to this Agreement at any time by providing notice of such
                                proposed amendments in a manner permitted hereunder. Such proposed amendments shall be
                                deemed accepted and become part of this Agreement thirty (30) days after the date such
                                notice is given unless you inform Versium that you do not accept such amendments. In the
                                event you inform Versium that you do not accept the proposed amendments, the proposed
                                amendments will not take effect and the existing terms will continue in full force and
                                effect. No other modification or claimed waiver of any provision of this Agreement shall
                                be valid except by written amendment signed by authorized representatives of Versium and
                                you.
                            </span>
                        </p>
                        <h2 className="termsHeading mt20">
                            <span>21. Force Majeure</span>
                        </h2>
                        <p className="mt5">
                            <span className="versium-font">
                                Neither Versium nor any of its affiliates will be liable for any delay or failure to
                                perform any obligation under this Agreement where the delay or failure results from any
                                cause beyond its reasonable control, including, but not limited to, acts of God, labor
                                disputes or other industrial disturbances, electrical or power outages, utilities or
                                other telecommunications failures, earthquake, storms or other elements of nature,
                                blockages, embargoes, riots, acts or orders of government, acts of terrorism, or war.
                            </span>
                        </p>

                        <div className="mt20">
                            <RSCheckbox
                                type="checkbox"
                                control={control}
                                required
                                labelName={AGREE_TERMS_OF_USE}
                                name={'versiumAgree'}
                                handleChange={(e) => {
                                    setEnable(!enable);
                                }}
                            />
                        </div>
                    </div>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={() => navigate(`/preferences/data-exchange`)}>Cancel</RSSecondaryButton>

                    <RSPrimaryButton
                        className={enable ? '' : 'click-off'}
                        onClick={() => {
                            handleClose(true);
                            // let tempresource = maskStringRandomly(versiumConfigData[0]?.url, 16);
                            // let tempresource = maskStringRandomly('http://10.150.0.206/Connector', 16);
                            // let tempuserName = maskStringRandomly(versiumConfigData[0]?.userName, 4);
                            // let tempuserpassword = maskStringRandomly(versiumConfigData[0]?.password, 14);
                            // reset((formState) => ({
                            //     ...formState,
                            //     resource: tempresource,
                            //     userName: tempuserName,
                            //     // resource: versiumConfigData[0]?.url,
                            //     // userName: versiumConfigData[0]?.userName,
                            //     password: tempuserpassword, // versiumConfigData[0]?.password,
                            // }));
                        }}
                    >
                        OK
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default VersiumModal;
