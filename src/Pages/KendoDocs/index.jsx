import { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import RSPageHeader from 'Components/RSPageHeader';
import { ALL_KENDO_DOC_SECTIONS } from './catalog';
import KendoDocsSidebar from './components/KendoDocsSidebar';
import KendoDocsRightPanel from './components/KendoDocsRightPanel';

import './KendoDocs.scss';

const FLAT_ENTRIES = ALL_KENDO_DOC_SECTIONS.flatMap((s) => s.items);

const KendoDocs = () => {
    const methods = useForm({
        mode: 'onChange',
        defaultValues: {
            docs_dropdown: null,
            docs_date: new Date(),
            docs_time: new Date(),
            docs_switch: true,
            docs_schedule: new Date(),
            docs_lookup_dd: null,
            docs_lookup_cb: false,
            docs_icon_dd: '',
        },
    });

    const [activeId, setActiveId] = useState(FLAT_ENTRIES[0]?.id ?? 'dropdown');
    
    const activeEntry = useMemo(() => {
        return FLAT_ENTRIES.find((e) => e.id === activeId);
    }, [activeId]);

    const scrollToSection = useCallback((id) => {
        setActiveId(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <div className="kendo-docs-page page-content-holder">
            <RSPageHeader
                title="UI Components"
            />

            {/* The main background elements */}
           <Container fluid>
            <div className='page-content'>
                <Container className='px0 mt41'>
                     <div className="kendo-docs-bg-shapes">
                <div className="kendo-docs-bg-shape kendo-docs-bg-shape--1" />
                <div className="kendo-docs-bg-shape kendo-docs-bg-shape--2" />
                <div className="kendo-docs-bg-shape kendo-docs-bg-shape--3" />
            </div>

            <div className="kendo-docs-page__body position-relative">
                <Row className="kendo-docs-page__layout gx-4">
                    <Col lg={3} xl={2} className="kendo-docs-page__aside-col">
                        <div className="kendo-docs-page__aside-sticky css-scrollbar">
                            <KendoDocsSidebar activeId={activeId} onSelect={scrollToSection} />
                        </div>
                    </Col>
                    
                    <Col lg={9} xl={10} className="kendo-docs-page__main-col">
                        {/* <div className="kendo-docs-hero">
                            <h1 className="kendo-docs-hero__title">Components</h1>
                            <p className="kendo-docs-hero__subtitle">Build, validate and manage your rules and components.</p>
                        </div> */}
                        
                        <FormProvider {...methods}>
                            <div className="kendo-docs-grid">
                                <div className="kendo-docs-grid__right">
                                    <div className="kendo-docs-right-sticky css-scrollbar">
                                        <KendoDocsRightPanel entry={activeEntry} />
                                    </div>
                                </div>
                            </div>
                        </FormProvider>
                    </Col>
                </Row>
            </div>
                </Container>
            </div>
           </Container>
        </div>
    );
};

export default KendoDocs;
