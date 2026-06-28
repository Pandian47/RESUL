import { truncateTitle } from 'Utils/modules/displayCore';
import { collapse_large, expand_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import { useDispatch, useSelector } from 'react-redux';

import { ResulticksLogoBl } from 'Assets/Images';
import useQueryParams from 'Hooks/useQueryParams';


const InfoCardFooterBuilder = ({ data }) => {
    const state = useQueryParams('/communication');
    
    // console.log('stateinfocard', state);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // Get template categories from Redux store
    const templateCategories = useSelector((state) => state.emailBuilderReducer?.templateCategories || []);
    
    // Function to get category name
    const getCategoryName = () => {
       const categoryType = state?.templateCategoryType;
       
        // Handle case where templateCategoryType is the full category object (new template creation)
        if (categoryType && typeof categoryType === 'object' && categoryType.categoryName) {
            return categoryType.categoryName;
        }
       
        // Handle case where templateCategoryType is just an ID (existing template editing)
        if (categoryType && typeof categoryType === 'number' && templateCategories.length > 0) {
            const category = templateCategories.find(cat => cat.templateCategoryId === categoryType);
            return category?.categoryName || 'Uncategorized';
        }
       
        // Handle case where templateCategoryType is an object with templateCategoryId
        if (categoryType && typeof categoryType === 'object' && categoryType.templateCategoryId) {
            const category = templateCategories.find(cat => cat.templateCategoryId === categoryType.templateCategoryId);
            return category?.categoryName || 'Uncategorized';
        }
       
        return 'Uncategorized';
    };

    const handleFullScreen = () => {
        if (!isFullScreen) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullScreen(!isFullScreen);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                handleFullScreen();
            }
        };

        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    return (
        <>
            <ul className={`d-flex align-items-center rsp-header-band bg-white email-footer-header`}>
                <li>
                    <img src={ResulticksLogoBl} alt="RESUL" className="mdc-logo-contain" />
                </li>
                <li>
                    <small>{state?.from === 'Communication' ? 'Communication' : 'Template'} name:</small>

                    {state?.campaignName?.length < 40 || state?.templateName?.length < 40 ? (
                        <h4>
                            {state?.from === 'Communication'
                                ? state?.campaignName
                                : state?.templateName || 'AICommunicationName'}
                        </h4>
                    ) : (
                        <RSTooltip
                            text={
                                state?.from === 'Communication'
                                    ? state?.campaignName
                                    : state?.templateName || 'AICommunicationName'
                            }
                            position="bottom"
                        >
                            <h4>
                                {truncateTitle(
                                    state?.from === 'Communication'
                                        ? state?.campaignName
                                        : state?.templateName || 'AICommunicationName',
                                    40,
                                )}
                            </h4>
                        </RSTooltip>
                    )}
                </li>
                {/* <li>
                    <small>{state?.from === 'Communication' ? 'Communication period' : 'Created date '} :</small>
                    <h4>
                        {state?.from === 'Communication'
                            ? state?.CampaignDate
                            // : getDateWithDay(state?.templateDate) || 'NA'}
                            : getUserCurrentFormat(state?.templateDate)?.dateFormat || 'NA'}
                    </h4>
                </li> */}
                {/* <li>
                    <small>Template category:</small>
                    <h4>{getCategoryName()}</h4>
                </li> */}
                <li className="position-absolute right10">
                    <RSTooltip
                        text={isFullScreen ? 'Exit full screen' : 'Full screen'}
                        position="left"
                        className="lh0"
                        innerContent={false}
                    >
                        <i
                            onClick={handleFullScreen}
                            className={`${
                                isFullScreen ? collapse_large : expand_large
                            } icon-lg color-primary-blue`}
                        />
                    </RSTooltip>
                </li>
            </ul>
        </>
    );
};

export default InfoCardFooterBuilder;
