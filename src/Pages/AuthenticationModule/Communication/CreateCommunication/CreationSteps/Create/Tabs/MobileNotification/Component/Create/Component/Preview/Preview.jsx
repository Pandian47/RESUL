import { useFormContext } from 'react-hook-form';
import RSMobileListPreview from 'Pages/AuthenticationModule/Communication/Component/RSMobileListPreview';

/** Existing Preview component kept; uses RSMobileListPreview for authoring (mobile notification) preview. */
const Preview = (props) => {
    const { formState: { errors } = {} } = useFormContext();
    return <RSMobileListPreview variant="authoring" errors={errors} {...props} />;
};

export default Preview;