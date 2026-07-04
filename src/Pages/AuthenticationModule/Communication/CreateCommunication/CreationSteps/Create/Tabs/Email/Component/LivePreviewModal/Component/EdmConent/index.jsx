import { removeTags, sanitizeEmailHtmlForPreview } from 'Utils/modules/stringUtils';
import { useEffect, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import parse from 'html-react-parser';

import RSTabber from 'Components/RSTabber';
import TemplatePreview from '../TemplatePreview';



const scriptTagStartText = '<!-- Start of Script Conditions -->';
const scripttagEndText = '<!-- End of Script Conditions -->';

const EdmContent = ({ content }) => {
    const [edmContentTab, setEdmContentTab] = useState(null);

    const isEdmContentArray = Array.isArray(edmContentTab);

    useEffect(() => {
        if (content) {
            if (content.includes('⚡4email data-css-strict')) {
                // Amp Flow
                const ampOccurence = content.match(/<!-- Start of Script amp Conditions -->/g)?.length;
                const htmlOccurence = content.match(/<!-- Start of Script html Conditions -->/g)?.length;
                if (ampOccurence > 2 || ampOccurence < 2 || htmlOccurence > 2 || htmlOccurence < 2) {
                    throw new Error('Invalid Amp file');
                }
                const TabNamesList = ['Amp', 'Fallback'];
                const tabData = _map(TabNamesList, (label, index) => ({
                    id: label,
                    text: label.toUpperCase(),
                    component: () => <TemplatePreview index={index} key={label} content={content} />,
                }));
                setEdmContentTab(tabData);
            } else if (content.includes(scriptTagStartText) && content.includes(scripttagEndText)) {
                const startIndex = content.indexOf(scriptTagStartText) + scriptTagStartText?.length;
                const endIndex = content.lastIndexOf(scripttagEndText);
                const scriptTagContent = content.slice(startIndex, endIndex) || '';
                const convertScriptTagToObject = JSON.parse(removeTags(scriptTagContent));
                const labelSet = convertScriptTagToObject?.LabelSet;
                const tabData = _map(labelSet, (label, index) => ({
                    id: label,
                    text: label.toUpperCase(),
                    component: () => <TemplatePreview index={index} key={label} content={content} />,
                }));
                setEdmContentTab(tabData);
            } else setEdmContentTab(content);
        }
    }, [content]);

    if (isEdmContentArray) {
        return <RSTabber tabData={edmContentTab} dynamicTab={`rs-tabs rs-sub-tabs`} activeClass={`active`} />;
    }
    return parse(sanitizeEmailHtmlForPreview(edmContentTab) || ``);
};

export default EdmContent;
