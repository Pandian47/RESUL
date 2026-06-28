import { createContext, useContext, useRef, useState } from 'react';
const ItemTypes = {
    TEXT: 'text',
    IMAGE: 'image',
    BUTTON: 'button',
    COLUMN: 'column',
    DIVIDER: 'divider',
    SOCIAL: 'social',
};

const SelectedComponentContext = createContext();

export const SelectedComponentProvider = ({ children }) => {

    const [droparea, setDroparea] = useState({
        width: '600',
        bgColor: null,
        bgImage: '',
        commonborder:false,
        borderTop:true,
        borderRight :true,
        borderBottom :true,
        borderLeft:true,
        borderthickness:1,
        borderColor: 'black',
        borderStyle: { value: 'solid', text: 'Solid' },
        borderRadius: 0,
        alignment: '',
        gap: '10',
        padding: '10',
        margin: '10',
        src:"",
    });

    const [components, setComponents] = useState([
        {
            type: ItemTypes.COLUMN,
            id: `col-${Date.now()}-${Math.random()}`,
            alt: '',
            width: '100px',
            height: '100px',
            alignment: 'left',
            column: [{ width: droparea.width || 600, column_id: `id-${Date.now()}`, locked: false }],
            padding: { top: 20, right: 20, bottom: 0, left: 20 },
            paddingsynced: false,
            gap: 20,
            bgColor: null,
            bgImage: null,
            bgRepeat: 'no-repeat',
            bgPositionX: 'center',
            bgPositionY: 'center',
            bgWidth: '100%',
            bgHeight: '100%',
            isborder:false,
            borderTop:true,
            borderRight :true,
            borderBottom :true,
            borderLeft:true,
            borderthickness:1,
            borderColor: 'black',
            borderStyle:{ value: 'solid', text: 'Solid' },
            borderRadius: 0,
        },
    ]);


    

    const [isOtherDragged, setIsOtherDragged] = useState(false);
    const [isColumnDragged, setIsDraggingColumn] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState('Layout');
    const [isActive, setIsActive] = useState(false);
    const componentRefs = useRef({});
    const dropZoneRef = useRef({ hoveredId: null, showMessage: false });
    const [hoverState, setHoverState] = useState({ hoveredId: null, isBeforeHovered: false });

    return (
        <SelectedComponentContext.Provider
            value={{
                selectedComponent,
                setSelectedComponent,
                components,
                setComponents,
                setIsOtherDragged,
                isOtherDragged,
                componentRefs,
                dropZoneRef,
                hoverState,
                setHoverState,
                isColumnDragged,
                setIsDraggingColumn,
                droparea,
                setDroparea,
                
                isActive,setIsActive
            }}
        >
            {children}
        </SelectedComponentContext.Provider>
    );
};

export const useSelectedComponent = () => useContext(SelectedComponentContext);
