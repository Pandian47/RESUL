import { Suspense, lazy, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import RSTabbarFluid from 'Components/RSTabberFluid';

const Generate = lazy(() => import('./Tabs/Generate'));
const Embed = lazy(() => import('./Tabs/Embed'));
const API = lazy(() => import('./Tabs/API'));
const PublishModal = lazy(() => import('../../../Components/PublishModal'));
const AdvancedFormEmbed = lazy(() => import('../../../AdvancedForm/Components/AdvancedFormEmbed'));
const AdvancedFormGenerate = lazy(() => import('../../../AdvancedForm/Components/AdvancedFormGenerate'));
const AdvancedFormAPI = lazy(() => import('../../../AdvancedForm/Components/AdvancedFormAPI'));

const TabFallback = () => null;

const GenerateAndEmbedAPI = ({
    show,
    handleClose,
    editName,
    saveData,
    formDataValues,
    fromTellAFriend = false,
    publishTabOnly = false,
    isAdvancedForm = false,
    formSubscription = false,
    previewData,
    handleActions,
    publishData,
    fromListing = false,
    publishLoading = false,
}) => {
    const [tabConfig, setTabConfig] = useState(0);
    const [tabs, setTabs] = useState([]);

    useEffect(() => {
        if (!show) {
            setTabs([]);
            return;
        }

        if (isAdvancedForm) {
            setTabs([
                {
                    id: 'Publish',
                    text: 'Publish',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <PublishModal
                                data={publishData}
                                handleActions={handleActions}
                                handleClose={handleClose}
                            />
                        </Suspense>
                    ),
                },
                {
                    id: 'Generate',
                    text: 'Generate',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <AdvancedFormGenerate formDataValues={formDataValues} />
                        </Suspense>
                    ),
                },
                {
                    id: 'Embed',
                    text: 'Embed',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <AdvancedFormEmbed publishData={publishData} editName={editName} />
                        </Suspense>
                    ),
                },
                {
                    id: 'API',
                    text: 'API',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <AdvancedFormAPI
                                saveData={saveData}
                                publishData={publishData}
                                formDataValues={formDataValues}
                            />
                        </Suspense>
                    ),
                },
            ]);
            return;
        }
        if (publishTabOnly) {
            setTabs([
                {
                    id: 'Publish',
                    text: 'Publish',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <PublishModal
                                data={publishData}
                                handleActions={handleActions}
                                handleClose={handleClose}
                            />
                        </Suspense>
                    ),
                },
            ]);
            return;
        }
        if (fromTellAFriend) {
            setTabs([
                {
                    id: 'Publish',
                    text: 'Publish',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <PublishModal data={publishData} handleActions={handleActions} handleClose={handleClose} />
                        </Suspense>
                    ),
                },
                {
                    id: 'Generate',
                    text: 'Generate',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <Generate
                                formDataValues={formDataValues}
                                saveData={saveData}
                                isPreview
                                fromTellAFriend={fromTellAFriend}
                                formSubscription={formSubscription}
                            />
                        </Suspense>
                    ),
                },
                {
                    id: 'Embed',
                    text: 'Embed',
                    component: () => (
                        <Suspense fallback={<TabFallback />}>
                            <Embed
                                formDataValues={formDataValues}
                                saveData={saveData}
                                isPreview
                                fromTellAFriend={fromTellAFriend}
                                formSubscription={formSubscription}
                            />
                        </Suspense>
                    ),
                },
            ]);
            return;
        }

        setTabs([
            {
                id: 'Publish',
                text: 'Publish',
                component: () => (
                    <Suspense fallback={<TabFallback />}>
                        <PublishModal data={publishData} handleActions={handleActions} handleClose={handleClose} />
                    </Suspense>
                ),
            },
            {
                id: 'Generate',
                text: 'Generate',
                component: () => (
                    <Suspense fallback={<TabFallback />}>
                        <Generate
                            formDataValues={formDataValues}
                            saveData={saveData}
                            isPreview
                            fromTellAFriend={fromTellAFriend}
                            formSubscription={formSubscription}
                        />
                    </Suspense>
                ),
            },
            {
                id: 'Embed',
                text: 'Embed',
                component: () => (
                    <Suspense fallback={<TabFallback />}>
                        <Embed
                            formDataValues={formDataValues}
                            saveData={saveData}
                            isPreview
                            fromTellAFriend={fromTellAFriend}
                            formSubscription={formSubscription}
                        />
                    </Suspense>
                ),
            },
            {
                id: 'API',
                text: 'API',
                component: () => (
                    <Suspense fallback={<TabFallback />}>
                        <API
                            formDataValues={formDataValues}
                            saveData={saveData}
                            publishData={publishData}
                            isPreview
                            fromTellAFriend={fromTellAFriend}
                            formSubscription={formSubscription}
                        />
                    </Suspense>
                ),
            },
        ]);
    }, [
        show,
        fromTellAFriend,
        publishTabOnly,
        isAdvancedForm,
        formDataValues,
        saveData,
        publishData,
        handleActions,
        handleClose,
        editName,
        formSubscription,
    ]);

    return (
        <RSModal
            show={show}
            handleClose={() => handleClose(false, '')}
            header={editName}
            className="form-embedAPI"
            closeTooltipPosition={'left'}
            isCloseButton
            body={
                <Container>
                    <div className="rs-vertical-tabs-wrapper">
                        <RSTabbarFluid
                            defaultClass={
                                publishTabOnly
                                    ? 'col-sm-12'
                                    : isAdvancedForm
                                      ? 'col-sm-3'
                                      : fromTellAFriend
                                        ? 'col-sm-4'
                                        : `col-sm-3`
                            }
                            dynamicTab={`mb0 mini`}
                            activeClass={`active`}
                            className="rs-tabs row rst-left-space pulish_form_tabbar"
                            defaultTab={tabConfig}
                            callBack={(_, index) => {
                                setTabConfig(index);
                            }}
                            tabData={tabs}
                        />
                    </div>
                </Container>
            }
        />
    );
};

export default GenerateAndEmbedAPI;
