import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import SectionStyles from '../Tabs/SectionStyles';
import ButtonStyles from '../Tabs/ButtonStyles';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import TimerStyles from '../Tabs/TimerStyles';
import VideoStyles from '../Tabs/VideoStyles';
import ImageStyles from '../Tabs/ImageStyles';
import { LandingTemplateContext } from '../../../Pages/LandingPageBuilder/LandingPageBuilder';

const TabContent = () => {
    const { control } = useFormContext();
    const { tagName, element } = useContext(LandingTemplateContext);
    switch (tagName) {
        case 'Heading':
            return (
                <div className="rsbstc-settings-block">
                    <div className="form-group">
                        <RSKendoDropdown
                            control={control}
                            name={`${element}.headingType`}
                            data={['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6']}
                            defaultValue={'Heading 1'}
                        />
                    </div>
                </div>
            );
        case 'Section':
            return <SectionStyles element={element} />;
        case 'Buttons':
            return <ButtonStyles element={element} />;
        case 'LinkBlock':
            return <ButtonStyles element={element} />;
        case 'Timer':
            return <TimerStyles element={element} />;
        case 'Video':
            return <VideoStyles element={element} />;
        case 'Image':
            return <ImageStyles element={element} />;
        default:
            return (
                <div className="rsbstc-settings-block">
                    <div className="form-group mt10">
                        <RSInput name={`${element}.id`} control={control} placeholder={'ID'} />
                    </div>
                    <div className="form-group">
                        <RSInput name={`${element}.title`} control={control} placeholder={'Title'} />
                    </div>
                </div>
            );
    }
};

export default TabContent;
