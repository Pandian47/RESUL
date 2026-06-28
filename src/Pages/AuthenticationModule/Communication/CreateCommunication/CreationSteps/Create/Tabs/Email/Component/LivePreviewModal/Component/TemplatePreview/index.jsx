import { useEffect } from 'react';
const tagStartText = '<!-- TCTAG:- [START] -->';
const tagEndText = ' <!-- TCTAG:- [END] -->';
const TemplatePreview = ({ index, key, content }) => {
        useEffect(() => {
        const currentIframeElement = document.querySelector('iframe');
        if (currentIframeElement !== null) {
            document.getElementById('preview-template').innerHTML = '';
        }
        const createFrame = document.createElement('iframe');
        createFrame.id = 'iframe';
        createFrame.width = '100%';
        createFrame.height = '100%';
        document.getElementById('preview-template').appendChild(createFrame);
        const frameDocument = createFrame.contentDocument;
        createFrame.contentWindow.document.open();
        createFrame.contentWindow.document.write(content);
        createFrame.contentWindow.document.close();
        frameDocument.body.innerHTML =
            frameDocument.body.innerHTML +
            `<style>
      iframe {
       height: 100%;
       background
      }
     </style>`;
        if (content.includes('⚡4email data-css-strict')) {
            const fontElement = [...frameDocument.getElementsByTagName('font')];
            frameDocument.body.innerHTML =
                fontElement[index].innerHTML +
                `<style>
       iframe {
        height: 100%;
        background
       }
      </style>`;
        } else {
            const editorEle = [...createFrame.contentWindow.document.getElementsByClassName('edit-outline')];
            editorEle.forEach((ele) => {
                const elementInnerHTML = ele.innerHTML;
                const element = elementInnerHTML.slice(
                    elementInnerHTML.indexOf(tagStartText) + tagStartText?.length,
                    elementInnerHTML.lastIndexOf(tagEndText),
                );
                const tempElement = document.createElement('div');
                                tempElement.innerHTML = element;
                ele.replaceChildren(tempElement.children[index]);
            });
        }
    }, []);
    return (
        <div
            id="preview-template"
            style={{
                height: '50vh',
            }}
        ></div>
    );
};

export default TemplatePreview;
