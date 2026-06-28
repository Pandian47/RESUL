import { useEffect, useState } from 'react';
import Card from '../Card';
import { Row } from 'react-bootstrap';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import CardCommunication from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/Template/Component/Card';

const TemplateGridViewCategories = ({
    data,
    setTemplateFlag,
    setTemplateName,
    from,
    type,
    categoryData,
    setPayload,
    setPagerPageConfig,
    setIsCloseSearch,
}) => {
    const [visibleData, setVisibleData] = useState(data?.data || []);
    useEffect(() => {
        setVisibleData(data?.data);
    }, [data]);

    return (
        <>
            <Row>
                {from === 'communication' ? (
                    visibleData?.length > 0 ? (
                        visibleData.map((list, index) => (
                            <CardCommunication
                                key={index}
                                list={list}
                                setTemplateFlag={setTemplateFlag}
                                setTemplateName={setTemplateName}
                                from={from}
                                type={type}
                                categoryData={categoryData}
                                setPayload={setPayload}
                                setPagerPageConfig={setPagerPageConfig}
                                setIsCloseSearch={setIsCloseSearch}
                            />
                        ))
                    ) : (
                        <div className="box-design">
                            <HorizontalSkeleton isError={true} />
                        </div>
                    )
                ) : visibleData?.length > 0 ? (
                    visibleData.map((list, index) => (
                        <Card
                            key={index}
                            list={list}
                            setTemplateFlag={setTemplateFlag}
                            setTemplateName={setTemplateName}
                            categoryData={categoryData}
                            setPayload={setPayload}
                            setPagerPageConfig={setPagerPageConfig}
                            setIsCloseSearch={setIsCloseSearch}
                            channelId={type?.channelId}
                        />
                    ))
                ) : (
                    <div className="box-design">
                        <HorizontalSkeleton isError={true} />
                    </div>
                )}
            </Row>

            {/* {data?.data?.length > INITIAL_GALLERY_CONFIG?.take && (
                <Row>
                    <RSPager data={data?.data} change={setVisibleData} config={INITIAL_GALLERY_CONFIG} />
                </Row>
            )} */}
        </>
    );
};

export default TemplateGridViewCategories;
