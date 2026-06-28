import CodeEditor from '@uiw/react-textarea-code-editor';

export const CustomCode = props => {
    return(
        <div className="doc-code-set">
            <h3 className="mt15">{props.title} {props.c1 ? <code>&#123;{props.c1}&#125;</code> : null} {props.c2 ? <code>&#123;{props.c2}&#125;</code> : null}</h3>
            <div className="mt15">
                <CodeEditor
                    value={props.value}
                    data-color-mode="light"
                    language={props.lang ? props.lang : 'jsx'}
                    placeholder="Please enter JS code."
                    onChange={(e) => {
                                            }}
                    padding={15}
                    className="doc-code-editor"
                    style={{
                        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
                        // fontFamily: '"Fira code", "Fira Mono", monospace',
                    }}
                />
            </div>
        </div>
    )
}
export const CustomCodePreview = props => {
    return(
        <div className="doc-code-preview">
            {props.children}
        </div>
    )
}
export const PropsList = props => {
    return(
        <div className="doc-props-box">
            <div className="d-flex align-items-center doc-props-string">
                {props.title ? <h2>{props.title}</h2> : null}
                {props.type ? <span><p>{props.type}</p></span> : null}
                {props.type2 ? <span><p>{props.type2}</p></span> : null}
            </div>
            <div className="doc-props-para">
                {props.children}
            </div>
        </div>
    )
}