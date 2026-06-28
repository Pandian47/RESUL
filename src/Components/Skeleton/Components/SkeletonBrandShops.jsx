import GridSkeleton from 'Pages/KendoDocs/CommonComponents/ResGrid/GridSkeleton';
import { resgridBrandListSkeletonCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResGrid/resgridBrandListSkeletonCriticalCss';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const BrandShopsSkeletonList = ({ count = 5, isLoading = false }) => (
    <div className="resgrid">
        <GridSkeleton layout="list" listVariant="brand" rows={count} animated={isLoading} />
    </div>
);

export const SkeletonBrandShops = ({ isError, children, count = 5, isLoading = false, message }) => {
    const skeletonContent = (
        <>
            <style>{resgridBrandListSkeletonCriticalCss}</style>
            <BrandShopsSkeletonList count={count} isLoading={isLoading} />
        </>
    );

    if (isError) {
        return (
            <div className="skeleton-communication-list" style={{ position: 'relative', minHeight: '400px' }}>
                {skeletonContent}
                <div>{children || <NoDataAvailableRender message={message} />}</div>
            </div>
        );
    }

    return <div className="skeleton-communication-list">{skeletonContent}</div>;
};
