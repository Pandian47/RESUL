import { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import RSTabSlide from 'Components/RSTabSlide';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import TextContent from '../TextContent/TextContent';
import { RCSProvider } from '../../RCS';

const Carousel = ({isSplitAB, fieldName}) => {
            const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { templateContentDetail } = useSelector((state) => getRcsList(state));
    const { carouselTabs } = useContext(RCSProvider);
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [currTab, setCurrTab] = useState(0);
    const location = useQueryParams('/communication');

    const {
        control,
        formState: { errors },
        setValue,
        reset,
        getValues,
        watch,
    } = useFormContext();
    const currentTabName = isSplitAB ? `${fieldName}.carouselIndex` : 'carouselIndex';

    const buildTabData = () => {
        if (templateContentDetail?.length) {
            return templateContentDetail.map((tempValue, i) => ({
                id: i + 1,
                text: `Carousel ${tempValue?.Carosuel}`,
                disable: false,
                data: tempValue,
                component: () => (
                    <TextContent value={tempValue} fieldName={`carousel${tempValue?.Carosuel}`} isSplitAB isCarousel />
                ),
            }));
        }
        return [];
    };
    useEffect(() => {
        setCurrTab(0);
    }, [isSplitAB ? carouselTabs?.[fieldName] : carouselTabs?.['carousel']]);

    
    const handleTabChange = useCallback(
        (data, index) => {
            setValue(currentTabName, index);
            setCurrTab(index);
        },
        [setValue, currentTabName],
    );
    return (
        <Fragment>
                        <div>
                {((isSplitAB ? carouselTabs?.[fieldName] : carouselTabs?.['carousel'])?.length > 0) && 
                <RSTabSlide
                    defaultTab={getValues(currentTabName)}
                    callBack={handleTabChange}
                    tabData={isSplitAB ? carouselTabs?.[fieldName] || [] : carouselTabs?.['carousel'] || []}
                    activeClass={`active`}
                    dynamicTab={`res-content-tabs-split model_smartlink pl92`}
                    componentClassName ={'w-100'}
                    tabMaxLength={5}
                />
                }
            </div>
        </Fragment>
    );
};

export default Carousel;