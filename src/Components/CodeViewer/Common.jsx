import CodeEditor from '@uiw/react-textarea-code-editor';

export const CustomCode = (props) => {
    // const [selected, setSelected] = useState(0)
    // const tabData = ['Code', 'Data']
    // const [data, setData] = useState(props.value)
    // const selectedIndex = (index) => {
    //     setSelected(index)
    // }
    // const selectedClass = (index) => {
    //     if (selected === index) {
    //         return 'active'
    //     }
    // }
    return (
        <div className="code-wrapper doc-code-set">
            <div className="css-scrollbar code-body">
                <div className="d-flex align-items-center justify-content-between">
                    {/* <h3>{props.title} {props.c1 ? <code>&#123;{props.c1}&#125;</code> : null} {props.c2 ? <code>&#123;{props.c2}&#125;</code> : null}</h3> */}
                    {/* <ul className='simple-tab'>
                        {
                            tabData.map((item, index) => {
                                return <li key={index} onClick={() => selectedIndex(index)} className={`${selectedClass(index)}`}>{item}</li>
                            })
                        }
                    </ul> */}
                </div>
                <CodeEditor
                    value={props.value}
                    language={props.lang ? props.lang : 'jsx'}
                    placeholder="Please enter JS code."
                    data-color-mode="light"
                    onChange={(e) => {
                        // console.log('test', e.target.value);
                    }}
                    padding={15}
                    className="doc-code-editor"
                    style={{
                        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    }}
                />
            </div>
        </div>
    );
};
export const CustomCodePreview = (props) => {
    return <div className="doc-code-preview">{props.children}</div>;
};
// export const PropsList = props => {
//     return (
//         <div className="doc-props-box">
//             <div className="d-flex align-items-center doc-props-string">
//                 <h2>{props?.title}</h2>
//                 <span><p>{props.type}</p></span>
//             </div>
//             <div className="doc-props-para">
//                 {props.children}
//             </div>
//         </div>
//     )
// }
