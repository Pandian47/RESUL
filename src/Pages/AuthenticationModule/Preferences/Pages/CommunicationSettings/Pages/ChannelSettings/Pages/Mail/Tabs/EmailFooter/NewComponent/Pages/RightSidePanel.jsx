import { MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { circle_plus_edge_mini, colorpicker_bg_fill_medium, delete_medium, lock_medium, plus_mini, refresh_mini, text_color_medium, unlock_medium } from 'Constants/GlobalConstant/Glyphicons';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import { EditorTools } from '@progress/kendo-react-editor';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, InputGroup, Row, Col, Tabs, Tab, Dropdown } from 'react-bootstrap';
import { useSelectedComponent } from './SelectedComponentContext';
import { getSessionId } from 'Reducers/globalState/selector';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SOCIAL_CONFIG, updateTextInLayout, ItemTypeLabels } from '../Utils/functions';
import PaddingBoxController from './Component/PaddingBoxController';
import InputController from './Component/InputController';
import PositionControllerWithLabel from './Component/PositionControllerWithLabel';
import InputControllerWithLabel from './Component/InputControllerWithLabel';
import WidthHeightLabel from './Component/WidthHeightLabel';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSColorPicker from 'Components/ColorPicker';
import { UPLOAD_FILE } from 'Constants/GlobalConstant/ValidationMessage';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import BorderCustomizer from './PropertiesComponent/BorderController';
import FontPropertiesController from './PropertiesComponent/FontPropertiesController';
import BackgroundProperties from './PropertiesComponent/BackgroundProperties';
import LinkProperties from './PropertiesComponent/LinkProperties';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SocialLogosConstants, socialIcons } from './Component/SocialIcons';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSTooltip from 'Components/RSTooltip';
import { uploadImageCommunicationFile } from 'Reducers/communication/createCommunication/Create/request';

const ItemType = 'SOCIAL_LINK';

const DraggableSocialLink = ({
    socialId,
    index,
    moveLink,
    selectedComponent,
    handleSocialLinkChange,
    handleAltTextChange,
    handleChange,
    setSocialLinks,
    socialLinks,
}) => {
    const social = socialIcons.find((icon) => icon.id === socialId);
    if (!social) return null;

    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover: (item) => {
            if (item.index !== index) {
                moveLink(item.index, index);
                item.index = index;
            }
        },
    });

    const isDeleteDisabled = socialLinks?.length <= SOCIAL_CONFIG.MIN_SOCIAL_LINKS;

    return (
        <div ref={(node) => drag(drop(node))}>
            <InputGroup className="email-footer-social d-flex align-items-center gap-0">
                <InputGroup.Text>
                    <img src={social.Icon} alt={social.label} />
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder={`Enter ${social.label} URL`}
                    value={selectedComponent[socialId] || ''}
                    onChange={(e) => handleSocialLinkChange(socialId, e.target.value)}
                />
                <Button
                    variant="outline-danger"
                    onClick={() => {
                        const updatedLinks = socialLinks.filter((id) => id !== socialId);
                        setSocialLinks(updatedLinks);
                        handleChange('iconLinks', updatedLinks);
                        // handleSocialLinkChange(socialId, '');
                        // handleChange('deleteIcon', socialId);
                    }}
                    disabled={isDeleteDisabled}
                    title={isDeleteDisabled ? 'Minimum of 3 icons required' : 'Delete social link'}
                >
                    {/* <FaTrash /> */}
                    <RSTooltip text={'Delete'} position="top" className="lh0">
                        <i className={`${delete_medium} icon-md color-primary-red`} />
                    </RSTooltip>
                </Button>
            </InputGroup>

            {selectedComponent.Alttext && (
                <>
                    <Row className="pt10">
                        <Col md={12}>
                            <Form.Control
                                type="text"
                                placeholder="Title"
                                defaultValue={social.label || ''}
                                style={{ marginBottom: '10px', padding: '10px' }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Control
                                type="text"
                                placeholder="Enter alt text"
                                value={selectedComponent.socialAltTexts?.[socialId] || ''}
                                onChange={(e) => handleAltTextChange(socialId, e.target.value)}
                                style={{ padding: '10px' }}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

const {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    ForeColor,
    BackColor,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Indent,
    Outdent,
    OrderedList,
    UnorderedList,
    Undo,
    Redo,
    FontSize,
    FontName,
    FormatBlock,
    Link,
    Unlink,
} = EditorTools;

const RightSidePanel = ({ onUpdateComponent, ItemTypes = {} }) => {
    const dispatch = useDispatch();
    const { setComponents, components, selectedComponent, setSelectedComponent, droparea, setDroparea } =
        useSelectedComponent();
        const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // console.log(clientId, userId, departmentId);

    const { control, watch, setError, clearErrors, setValue } = useFormContext();

    const [gridTab, setGridTab] = useState('Settings');

    const editorRef = useRef(null);
    const [foreColor, setForeColor] = useState('');
    const [backColor, setBackColor] = useState('');
    const [fontSize, setFontSize] = useState('');
    const [fontFamily, setFontFamily] = useState('');

    const filteredData = useMemo(() => {
        if (!selectedComponent) return null;
        return components?.find((x) => x.id === selectedComponent.id);
    }, [components, selectedComponent]);

    const columnCount = useMemo(() => {
        if (!filteredData) return 1;
        return filteredData.column?.length;
    }, [filteredData]);

    if (!selectedComponent) return null;

    const filteredColumns = components?.find((x) => x.id === selectedComponent?.id)?.column;

    if (!selectedComponent) return null;

    useEffect(() => {
        setValue('imgwidth', selectedComponent.imgwidth || '', { shouldDirty: false });
        setValue('imgheight', selectedComponent.imgheight || '', { shouldDirty: false });
        setValue('imgUrl', selectedComponent.imgUrl || '', { shouldDirty: false });
        setValue('alt', selectedComponent.alt || '', { shouldDirty: false });
        setValue('borderWidth', selectedComponent.borderWidth || '', { shouldDirty: false });
        setValue('borderHeight', selectedComponent.borderHeight || '', { shouldDirty: false });
        setValue('spacer', selectedComponent.spacer || false, { shouldDirty: false });
        setValue('isborder', selectedComponent.isborder || false, { shouldDirty: false });
        setValue('commonborder', droparea.commonborder || false, { shouldDirty: false });
    }, [
        selectedComponent.imgwidth,
        selectedComponent.imgheight,
        selectedComponent.imgUrl,
        selectedComponent.alt,
        selectedComponent.borderWidth,
        selectedComponent.borderHeight,
        selectedComponent.spacer,
        selectedComponent.isborder,
        droparea.commonborder,
        setValue,
    ]);

    const handleChange = (key, value) => {
        if (key === 'Alttext') {
            if (value) {
                onUpdateComponent({
                    ...selectedComponent,
                    Alttext: true,
                    socialAltTexts: selectedComponent.socialAltTexts || {},
                });
            } else {
                onUpdateComponent({
                    ...selectedComponent,
                    Alttext: false,
                    socialAltTexts: {},
                });
            }
        } else {
            onUpdateComponent({ ...selectedComponent, [key]: value });
        }
    };

    const horizontalAlignmentOptions = [
        { value: 'left', icon: 'icon-rs-editor-align-left-medium icon-md', tooltipText: 'Left' },
        { value: 'center', icon: 'icon-rs-editor-align-center-medium icon-md', tooltipText: 'Center' },
        { value: 'right', icon: 'icon-rs-editor-align-right-medium icon-md', tooltipText: 'Right' },
    ];
    const verticleAlignmentOptions = [
        { value: 'top', icon: 'icon-rs-editor-align-left-medium icon-md', tooltipText: 'Top' },
        { value: 'center', icon: 'icon-rs-editor-align-center-medium icon-md', tooltipText: 'Center' },
        { value: 'bottom', icon: 'icon-rs-editor-align-right-medium icon-md', tooltipText: 'Bottom' },
    ];

    const bckgImgAlignmentOptions = [
        { value: 'start', icon: 'icon-rs-arrow-down-medium icon-md rotate-left', tooltipText: 'Start' },
        { value: 'center', icon: 'icon-rs-arrow-down-medium icon-md', tooltipText: 'Center' },
        { value: 'end', icon: 'icon-rs-arrow-down-medium icon-md rotate-right', tooltipText: 'End' },
    ];

    const handlePaddingChange = (side, value) => {
        setSelectedComponent((prev) => {
            if (!prev) return prev;
            const updatedPadding = prev.paddingsynced
                ? { top: value, right: value, bottom: value, left: value }
                : { ...prev.padding, [side]: value };
            setComponents((prevComponents) =>
                prevComponents.'icon-rs-map'((comp) => {
                    if (comp.id === prev.id) {
                        return { ...comp, padding: updatedPadding };
                    }
                    if (comp.column) {
                        const updatedColumns = comp.column.'icon-rs-map'((col) => {
                            if (col.children) {
                                const updatedChildren = col.children.'icon-rs-map'((child) => {
                                    if (child.grid_data_id === prev.grid_data_id) {
                                        return { ...child, padding: updatedPadding };
                                    }
                                    return child;
                                });
                                return { ...col, children: updatedChildren };
                            }
                            return col;
                        });
                        return { ...comp, column: updatedColumns };
                    }

                    return comp;
                }),
            );
            return { ...prev, padding: updatedPadding };
        });
    };

    const syncPadding = () => {
        const isCurrentlySynced = selectedComponent?.paddingsynced;
        const firstValue = selectedComponent?.padding?.top;

        const syncedPadding = {
            top: firstValue,
            right: firstValue,
            bottom: firstValue,
            left: firstValue,
        };

        setSelectedComponent((prev) => ({
            ...prev,
            paddingsynced: !isCurrentlySynced,
            padding: !isCurrentlySynced ? syncedPadding : prev.padding,
        }));

        setComponents((prevComponents) =>
            prevComponents.'icon-rs-map'((comp) => {
                if (comp.column) {
                    const updatedColumns = comp.column.'icon-rs-map'((col) => {
                        if (col.children) {
                            const updatedChildren = col.children.'icon-rs-map'((child) => {
                                if (
                                    selectedComponent.grid_data_id &&
                                    child.grid_data_id === selectedComponent.grid_data_id
                                ) {
                                    return {
                                        ...child,
                                        paddingsynced: !isCurrentlySynced,
                                        padding: !isCurrentlySynced ? syncedPadding : child.padding,
                                    };
                                }
                                return child;
                            });
                            return { ...col, children: updatedChildren };
                        }
                        return col;
                    });
                    return { ...comp, column: updatedColumns };
                }

                if (!selectedComponent.grid_data_id && comp.id === selectedComponent.id) {
                    return {
                        ...comp,
                        paddingsynced: !isCurrentlySynced,
                        padding: !isCurrentlySynced ? syncedPadding : comp.padding,
                    };
                }

                return comp;
            }),
        );
    };

    const handleEdit = (id, newText) => {
        setComponents((prevData) => updateTextInLayout(prevData, selectedComponent, newText));
    };

    const rgbToHex = (rgb) => {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '';
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
        if (!match) return rgb.startsWith('#') ? rgb : '';
        const hex = (n) => Number(n).toString(16).padStart(2, '0');
        const alpha = match[4] ? parseFloat(match[4]) : 1;
        if (alpha === 0) return '';
        return `#${hex(match[1])}${hex(match[2])}${hex(match[3])}`;
    };

    const updateToolColorsAndLinks = () => {
        if (editorRef.current) {
            const editorView = editorRef.current.view;
            const selection = editorView.state.selection;
            let newForeColor = '';
            let newBackColor = '';
            let newFontSize = '';
            let newFontFamily = '';
            let isLinkSelected = false;

            if (!selection.empty) {
                const { from, to } = selection;
                const startPos = editorView.domAtPos(from);
                const endPos = editorView.domAtPos(to);
                const selectedRange = document.createRange();
                selectedRange.setStart(startPos.node, startPos.offset);
                selectedRange.setEnd(endPos.node, endPos.offset);

                const selectedSpans = Array.from(selectedRange.cloneContents().querySelectorAll('span'));
                const selectedLinks = Array.from(selectedRange.cloneContents().querySelectorAll('a'));

                if (selectedLinks?.length > 0) {
                    isLinkSelected = true;
                } else {
                    const parentNode = startPos.node.nodeType === 1 ? startPos.node : startPos.node.parentElement;
                    isLinkSelected = !!parentNode.closest('a');
                }

                if (selectedSpans?.length > 0) {
                    const span = selectedSpans[selectedSpans?.length - 1];
                    newForeColor = span.style.color || '';
                    newBackColor = span.style.backgroundColor || '';
                    newFontSize = span.style.fontSize || '';
                    newFontFamily = span.style.fontFamily || '';
                } else {
                    const parentNode = startPos.node.nodeType === 1 ? startPos.node : startPos.node.parentElement;
                    const computedStyle = window.getComputedStyle(parentNode);
                    newForeColor = computedStyle.color;
                    newBackColor = computedStyle.backgroundColor;
                    newFontSize = computedStyle.fontSize;
                    newFontFamily = computedStyle.fontFamily;
                    if (newBackColor === 'rgb(255, 255, 255)' || newBackColor === 'rgba(0, 0, 0, 0)') {
                        newBackColor = '';
                    }
                }

                const foreColorHex = rgbToHex(newForeColor);
                const backColorHex = rgbToHex(newBackColor);
                setForeColor(foreColorHex);
                setBackColor(backColorHex);
                setFontSize(newFontSize);
                setFontFamily(newFontFamily.split(',')[0].replace(/['"]/g, ''));

                const foreColorPreviewMask = document.querySelector('.k-i-foreground-color + .k-color-preview-mask');
                const backColorPreviewMask = document.querySelector('.k-i-background + .k-color-preview-mask');
                if (foreColorHex && foreColorPreviewMask) {
                    foreColorPreviewMask.style.backgroundColor = foreColorHex;
                } else if (foreColorPreviewMask) {
                    foreColorPreviewMask.style.backgroundColor = '';
                }
                if (backColorHex && backColorPreviewMask) {
                    backColorPreviewMask.style.backgroundColor = backColorHex;
                } else if (backColorPreviewMask) {
                    backColorPreviewMask.style.backgroundColor = '';
                }
                const fontSizeDropdown = document.querySelector('.k-font-size .k-dropdownlist');
                const fontNameDropdown = document.querySelector('.k-font-name .k-dropdownlist');
                if (fontSizeDropdown && newFontSize) {
                    fontSizeDropdown.value = newFontSize;
                }
                if (fontNameDropdown && newFontFamily) {
                    fontNameDropdown.value = newFontFamily;
                }

                const linkButton = document.querySelector('button[title="Insert hyperlink"]');
                const unlinkButton = document.querySelector('button[title="Remove hyperlink"]');
                if (linkButton && unlinkButton) {
                    if (isLinkSelected) {
                        linkButton.disabled = true;
                        linkButton.style.opacity = '0.5';
                        unlinkButton.disabled = false;
                        unlinkButton.style.opacity = '1';
                    } else {
                        linkButton.disabled = false;
                        linkButton.style.opacity = '1';
                        unlinkButton.disabled = true;
                        unlinkButton.style.opacity = '0.5';
                    }
                }
            } else {
                setForeColor('');
                setBackColor('');
                setFontSize('');
                setFontFamily('');
                const foreColorPreviewMask = document.querySelector('.k-i-foreground-color + .k-color-preview-mask');
                const backColorPreviewMask = document.querySelector('.k-i-background + .k-color-preview-mask');
                if (foreColorPreviewMask) {
                    foreColorPreviewMask.style.backgroundColor = '';
                }
                if (backColorPreviewMask) {
                    backColorPreviewMask.style.backgroundColor = '';
                }
                const fontSizeDropdown = document.querySelector('.k-font-size .k-dropdownlist');
                const fontNameDropdown = document.querySelector('.k-font-name .k-dropdownlist');
                if (fontSizeDropdown) fontSizeDropdown.value = '';
                if (fontNameDropdown) fontNameDropdown.value = '';

                const linkButton = document.querySelector('button[title="Insert hyperlink"]');
                const unlinkButton = document.querySelector('button[title="Remove hyperlink"]');
                if (linkButton && unlinkButton) {
                    linkButton.disabled = false;
                    linkButton.style.opacity = '1';
                    unlinkButton.disabled = true;
                    unlinkButton.style.opacity = '0.5';
                }
            }
        }
    };

    const handleEditorChange = () => {
        if (editorRef.current) {
            const editorView = editorRef.current.view;
            const html = editorView.dom.innerHTML;
            if (html !== selectedComponent.text) {
                handleEdit(selectedComponent.id, html);
            }
            updateToolColorsAndLinks();
        }
    };

    const handleIncrement = (id, amount, currentval) => {
        const newValue = currentval + amount;
        handleWidthChange(id, parseInt(newValue));
    };

    const addColumn = () => {
        const filteredComponent = components?.find((x) => x.id === selectedComponent?.id);

        if (!filteredComponent) return;

        const newColumnId = `id-${Date.now()}`;
        const updatedColumns = [...filteredComponent.column];
        if (updatedColumns?.length > 10) return;

        const gap = filteredComponent.gap || 0;
        const totalWidthReduction = 30 + gap;

        if (updatedColumns?.length > 0) {
            updatedColumns[0].width -= totalWidthReduction;
            if (updatedColumns[0].width < 30) {
                updatedColumns[0].width = 30;
            }
        }
        updatedColumns.push({
            width: 30,
            column_id: newColumnId,
            locked: false,
        });
        setComponents((prev) =>
            prev.'icon-rs-map'((comp) => (comp.id === selectedComponent?.id ? { ...comp, column: updatedColumns } : comp)),
        );
        setSelectedComponent((prev) => ({
            ...prev,
            column: updatedColumns,
        }));
    };

    const deleteColumn = (index) => {
        if (selectedComponent?.column?.length > 1) {
            const updatedColumns = [...selectedComponent.column];
            const removedWidth = updatedColumns[index].width;
            const gap = selectedComponent.gap || 0;
            updatedColumns.splice(index, 1);

            if (updatedColumns?.length > 0) {
                updatedColumns[0].width += removedWidth + gap;
            }

            setSelectedComponent((prev) => ({
                ...prev,
                column: updatedColumns,
            }));

            setComponents((prev) =>
                prev.'icon-rs-map'((comp) => (comp.id === selectedComponent?.id ? { ...comp, column: updatedColumns } : comp)),
            );
        }
    };

    const toggleLock = (columnId) => {
        setComponents((prevComponents) =>
            prevComponents.'icon-rs-map'((layout) => {
                if (layout.id !== selectedComponent.id) return layout;

                const updatedColumns = layout.column.'icon-rs-map'((col) =>
                    col.column_id === columnId ? { ...col, locked: !col.locked } : col,
                );

                return { ...layout, column: updatedColumns };
            }),
        );
    };

    const handleGapChange = (id, newGap) => {
        setComponents((prevComponents) =>
            prevComponents.'icon-rs-map'((comp) => {
                if (comp.id !== id) return comp;
                const columns = comp.column;
                const currentGap = comp.gap || 0;
                const gapDifference = newGap - currentGap;
                const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
                const totalAdjustableWidth =
                    totalWidth - columns.filter((col) => col.locked).reduce((sum, col) => sum + col.width, 0);
                const updatedColumns = columns.'icon-rs-map'((col) => {
                    if (col.locked) return col;
                    const widthAdjustment = (col.width / totalAdjustableWidth) * gapDifference;
                    const newWidth = Math.max(30, Math.round(col.width - widthAdjustment));
                    return { ...col, width: newWidth };
                });
                const updatedComponent = {
                    ...comp,
                    column: updatedColumns,
                    gap: newGap,
                };
                setSelectedComponent(updatedComponent);
                return updatedComponent;
            }),
        );
    };

    const handleWidthChange = async (columnId, newWidth) => {
        setComponents((prevComponents) =>
            prevComponents.'icon-rs-map'((layout) => {
                if (layout.id !== selectedComponent.id) return layout;

                let newColumns = [...layout.column];
                let index = newColumns.findIndex((col) => col.column_id === columnId);

                if (index === -1) return layout;

                let currentWidth = newColumns[index]?.width;
                if (newWidth < 30) {
                    newColumns[index].width = currentWidth;
                    newWidth = currentWidth;
                    return { ...layout, column: [...newColumns] };
                }

                if (newWidth === currentWidth) return layout;

                if (newWidth > currentWidth) {
                    let increaseBy = newWidth - currentWidth;

                    for (let i = 0; i < increaseBy; i++) {
                        let closestIndex = newColumns
                            .'icon-rs-map'((col, i) => ({ diff: col.width - 30, index: i }))
                            .filter((item) => item.diff > 0 && item.index !== index && !newColumns[item.index].locked)
                            .sort((a, b) => a.diff - b.diff)[0]?.index;

                        if (closestIndex !== undefined && newColumns[closestIndex].width > 30) {
                            newColumns[closestIndex].width -= 1;
                            newColumns[index].width += 1;
                        }
                    }
                } else {
                    let decreaseBy = currentWidth - newWidth;

                    if (newWidth < 30) {
                        newColumns[index].width = currentWidth;
                        newWidth = currentWidth;
                        return { ...layout, column: [...newColumns] };
                    }

                    for (let i = 0; i < decreaseBy; i++) {
                        let nextIndex = index + 1;

                        if (nextIndex >= newColumns?.length) {
                            nextIndex = 0;
                        }

                        while (newColumns[nextIndex].locked) {
                            nextIndex = (nextIndex + 1) % newColumns?.length;
                        }

                        if (!newColumns[nextIndex].locked) {
                            newColumns[nextIndex].width += 1;
                            newColumns[index].width -= 1;
                        }
                    }
                }

                return { ...layout, column: [...newColumns] };
            }),
        );
    };

    const GenralSettingChange = (key, value) => {
        if (key === 'bgImage' && value) {
            setDroparea({ ...droparea, bgColor: '', [key]: value });
        } else if (key === 'bgColor' && value) {
            setDroparea({ ...droparea, bgImage: '', [key]: value });
        } else if (key === 'width' && value) {
            setDroparea({ ...droparea, width: '', [key]: value });
            setComponents((prevComponents) =>
                prevComponents.'icon-rs-map'((component) => {
                    const totalPadding = (component.padding?.left || 0) + (component.padding?.right || 0);
                    const totalGap = (component.gap || 0) * (component.column?.length - 1);
                    const availableWidth = value - totalPadding - totalGap;
                    if (component.column?.length === 1) {
                        return {
                            ...component,
                            column: component.column.'icon-rs-map'((col) => ({
                                ...col,
                                width: availableWidth,
                            })),
                        };
                    }
                    const columns = component.column;
                    let maxWidthIndex = 0;
                    let maxWidth = columns[0].width;
                    for (let i = 1; i < columns?.length; i++) {
                        if (columns[i].width > maxWidth) {
                            maxWidth = columns[i].width;
                            maxWidthIndex = i;
                        }
                    }
                    const otherColumnsWidthSum = (columns?.length - 1) * 30;
                    const updatedColumns = columns.'icon-rs-map'((col, index) => ({
                        ...col,
                        width: index === maxWidthIndex ? availableWidth - otherColumnsWidthSum : 30,
                    }));

                    return {
                        ...component,
                        column: updatedColumns,
                    };
                }),
            );
        } else {
            setDroparea({ ...droparea, [key]: value });
        }
    };

    const genralWidthChange = (event) => {
        const newValue = event.target.value;
        GenralSettingChange('width', parseInt(newValue));
    };

    const genralgapChange = (event) => {
        const newValue = event.target.value;
        GenralSettingChange('gap', parseInt(newValue));
    };

    const defaultIcons = ['facebook', 'twitter', 'instagram'];
    const [socialLinks, setSocialLinks] = useState(selectedComponent.iconLinks || defaultIcons);

    useEffect(() => {
        setSocialLinks(selectedComponent.iconLinks || defaultIcons);
    }, [selectedComponent.iconLinks]);

    const moveLink = (fromIndex, toIndex) => {
        const updatedLinks = [...socialLinks];
        const [movedLink] = updatedLinks.splice(fromIndex, 1);
        updatedLinks.splice(toIndex, 0, movedLink);
        setSocialLinks(updatedLinks);
        // handleChange('socialLinks', updatedLinks);
        handleChange('iconLinks', updatedLinks);
        onUpdateComponent({ ...selectedComponent, iconLinks: updatedLinks });
    };

    // Properly update the parent component when links change
    const updateIconLinks = (newLinks) => {
        setSocialLinks(newLinks);
        onUpdateComponent({
            ...selectedComponent,
            iconLinks: newLinks,
        });
    };

    const addSocialLink = (newLink) => {
        if (socialLinks.includes(newLink) || socialLinks.length >= SOCIAL_CONFIG.MAX_SOCIAL_LINKS) {
            return;
        }

        const updatedLinks = [...socialLinks, newLink];
        setSocialLinks(updatedLinks);
        handleChange('iconLinks', updatedLinks);
        onUpdateComponent({ ...selectedComponent, iconLinks: updatedLinks });
    };

    const handleSocialLinkChange = (id, value) => {
        onUpdateComponent({ ...selectedComponent, [id]: value });
    };

    const handleAltTextChange = (socialId, altText) => {
        const updatedAltTexts = {
            ...selectedComponent.socialAltTexts,
            [socialId]: altText,
        };
        if (selectedComponent.Alttext === true) {
            onUpdateComponent({ ...selectedComponent, socialAltTexts: updatedAltTexts });
        } else {
            onUpdateComponent({ ...selectedComponent, socialAltTexts: undefined });
        }
    };

    const renderSocialLinks = () => {
        const linksToRender = socialLinks?.length > 0 ? socialLinks : defaultIcons;

        return linksToRender.'icon-rs-map'((socialId, index) => (
            <DraggableSocialLink
                key={socialId}
                socialId={socialId}
                index={index}
                moveLink={moveLink}
                selectedComponent={selectedComponent}
                handleSocialLinkChange={handleSocialLinkChange}
                handleAltTextChange={handleAltTextChange}
                handleChange={handleChange}
                setSocialLinks={setSocialLinks}
                socialLinks={socialLinks}
            />
        ));
    };

    const removeImage = () => {
        handleChange('src', null);
        setSelectedComponent((prev) => ({
            ...prev,
            src: null,
            alt: '',
            imgText: '',
            imgUrl: '',
            imgwidth: 0,
            imgheight: 0,
        }));
        setValue('src', null);
        setValue('alt', '');
        setValue('imgText', '');
        setValue('imgUrl', '');
        setValue('imgwidth', 0);
        setValue('imgheight', 0);
    };

    useEffect(() => {
        if (editorRef.current && selectedComponent?.text) {
            const editor = editorRef.current;
            const view = editor.view;
            const tempElement = document.createElement('div');
            tempElement.innerHTML = selectedComponent.text;
            document.body.appendChild(tempElement);

            const computedStyle = window.getComputedStyle(tempElement);
            const fontSize = computedStyle.fontSize;
            const fontFamily = computedStyle.fontFamily;

            document.body.removeChild(tempElement);
            if (view) {
                const { state } = view;
                const { tr, selection } = state;
                tr.setSelection(selection);
                tr.setMeta('fontSize', '4 (14pt)');
                tr.setMeta('fontFamily', 'Arial');
                view.dispatch(tr);
            }
        }
    }, [selectedComponent]);

    const imagFile = async (base64Image, imageFormat) => {
        try {
            if (!base64Image || !imageFormat) {
                throw new Error('Base64 image or format is missing');
            }

            const validFormats = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validFormats.includes(imageFormat)) {
                throw new Error('Unsupported image format. Use JPEG, PNG, or GIF.');
            }
            const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

            const payload = {
                clientId,
                userId,
                departmentId,
                base64Image: base64Data,
                imageFormat: imageFormat.split('/')[1],
            };

            const { data, status } = await dispatch(uploadImageCommunicationFile({ payload }));
            if (status) {
                return data;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            throw error;
        }
    };

    const headerTitle = ItemTypeLabels[selectedComponent?.type] || 'Email footer properties';

    return (
        <>
            <div className="right-side-panel">
                {
                    <>
                        <>
                            <h4 className="property-panel-title">{headerTitle}</h4>
                            <div className="property-items css-scrollbar p15">

                                {selectedComponent === 'Layout' && (
                                    <>
                                        {/* <div className="items-padding">
                                            <Row>
                                                <Col sm={7}>
                                                    <label className="form-label">Width</label>
                                                </Col>
                                                <Col sm={5}>
                                                    <RSInput
                                                        control={control}
                                                        // placeholder={'width'}
                                                        type={'number'}
                                                        name={'width'}
                                                        defaultValue={droparea.width || ''}
                                                        maxLength={MAX_LENGTH75}
                                                        handleOnchange={genralWidthChange}
                                                    />
                                                </Col>
                                            </Row>
                                        </div> */}
                                        <div className="items-padding">
                                            <Row>
                                                <Col sm={7}>
                                                    <label className="form-label">Spacing</label>
                                                </Col>
                                                <Col sm={5}>
                                                    <RSInput
                                                        control={control}
                                                        // placeholder={'Spacing'}
                                                        type={'number'}
                                                        name={'gap'}
                                                        defaultValue={droparea.gap || ''}
                                                        maxLength={MAX_LENGTH75}
                                                        handleOnchange={genralgapChange}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <BackgroundProperties
                                            selectedComponent={droparea}
                                            handleChange={GenralSettingChange}
                                            horizontalAlignmentOptions={horizontalAlignmentOptions}
                                            verticleAlignmentOptions={verticleAlignmentOptions}
                                            control={control}
                                            clearErrors={clearErrors}
                                            setError={setError}
                                            watch={watch}
                                        />
                                        <Form.Group className="items-padding border-bottom-0 mb0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Form.Label>{'Border common'}</Form.Label>
                                                <RSSwitch
                                                    name="commonborder"
                                                    control={control}
                                                    onLabel="ON"
                                                    offLabel="OFF"
                                                    defaultValue={droparea.commonborder}
                                                    handleChange={(value) => GenralSettingChange('commonborder', value)}
                                                />
                                            </div>

                                            {droparea.commonborder && (
                                                <div className="pt20">
                                                    <BorderCustomizer
                                                        selectedComponent={droparea}
                                                        handleChange={GenralSettingChange}
                                                    />
                                                </div>
                                            )}
                                        </Form.Group>
                                    </>
                                )}

                                {selectedComponent.type === ItemTypes?.TEXT && (
                                    <>
                                        <div>
                                            <Form.Label className="mb5">{'Text content'}</Form.Label>
                                            <ResTextEditor
                                                ref={editorRef}
                                                key={selectedComponent.id}
                                                tools={[
                                                    [FontName],
                                                    [FontSize],
                                                    [FormatBlock],
                                                    [Bold, Italic, Underline, Strikethrough],
                                                    [AlignLeft, AlignCenter, AlignRight, AlignJustify],
                                                    [Indent, Outdent],
                                                    [OrderedList, UnorderedList],
                                                    [Undo, Redo],
                                                    [ForeColor],
                                                    [BackColor],
                                                    [Link, Unlink],
                                                ]}
                                                variant="full"
                                                height={200}
                                                contentStyle={{ fontFamily: 'Arial, sans-serif' }}
                                                defaultContent={selectedComponent?.text || 'Click to edit'}
                                                onChange={(html) => handleEdit(selectedComponent.id, html)}
                                                onExecute={() => {
                                                    setTimeout(() => {
                                                        handleEditorChange();
                                                        updateToolColorsAndLinks();
                                                    }, 0);
                                                }}
                                                onSelect={updateToolColorsAndLinks}
                                                editorClassName="right-side-editor-new mb20"
                                            />
                                            <>
                                                <Form.Group className="items-padding">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <Form.Label>{'Text border'}</Form.Label>
                                                        {/* <Form.Check
                                                    type="switch"
                                                    id="isborder-switch"
                                                    label={selectedComponent.isborder ? 'ON' : 'OFF'}
                                                    checked={selectedComponent.isborder}
                                                    onChange={(e) => handleChange('isborder', e.target.checked)}
                                                /> */}
                                                        <RSSwitch
                                                            name="isborder"
                                                            control={control}
                                                            onLabel="ON"
                                                            offLabel="OFF"
                                                            defaultValue={selectedComponent.isborder}
                                                            handleChange={(value) => handleChange('isborder', value)}
                                                        />
                                                    </div>

                                                    {selectedComponent.isborder && (
                                                        <div className="pt20">
                                                            <BorderCustomizer
                                                                selectedComponent={selectedComponent}
                                                                handleChange={handleChange}
                                                            />
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </>
                                            <BackgroundProperties
                                                selectedComponent={selectedComponent}
                                                handleChange={handleChange}
                                                horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                verticleAlignmentOptions={verticleAlignmentOptions}
                                                control={control}
                                                clearErrors={clearErrors}
                                                setError={setError}
                                                watch={watch}
                                            />

                                            <PaddingBoxController
                                                padding={selectedComponent.padding}
                                                onPaddingChange={handlePaddingChange}
                                                onSyncPadding={syncPadding}
                                                selectedComponent={selectedComponent}
                                            />
                                        </div>
                                    </>
                                )}

                                {selectedComponent.type === ItemTypes.IMAGE && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Form.Group className="items-padding">
                                            <Form.Label className="mb5">Image URL</Form.Label>
                                            <RSInput
                                                control={control}
                                                placeholder={'https://example.com/image.png'}
                                                type={'text'}
                                                name={'srcUrl'}
                                                // defaultValue={selectedComponent.src || ''}
                                                handleOnchange={(e) => {
                                                    const imageUrl = e.target.value;
                                                    onUpdateComponent({
                                                        ...selectedComponent,
                                                        src: imageUrl,
                                                    });
                                                    setValue('src', imageUrl, { shouldValidate: true });
                                                }}
                                            />
                                        </Form.Group>
                                        <div className="items-padding">
                                            <Form.Label className="mb5">{'Background image'}</Form.Label>
                                            <RSFileUpload
                                                isbase64
                                                control={control}
                                                name={'src'}
                                                accept=".jpg,jpeg,.png,svg"
                                                isPrefix
                                                clearErrors={clearErrors}
                                                setError={setError}
                                                size={2000000}
                                                rules={{
                                                    required: UPLOAD_FILE,
                                                }}
                                                watch={watch}
                                                isUpload={true}
                                                customEmailFooterText={
                                                    <>
                                                        <div className="flex flex-col items-center">
                                                            <h6>Click here to upload image</h6>
                                                            <small>Not more than 2MB</small>
                                                            <small>.png, .jpg, .jpeg, .gif only</small>
                                                        </div>
                                                    </>
                                                }
                                                handleChange={async (e) => {
                                                    const file = e.target.files[0];

                                                    if (file) {
                                                        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                                                        if (!validTypes.includes(file.type)) {
                                                            setError('src', {
                                                                type: 'manual',
                                                                message: 'Invalid file type. Use JPEG, PNG, or GIF.',
                                                            });
                                                            return;
                                                        }

                                                        try {
                                                            const reader = new FileReader();
                                                            reader.readAsDataURL(file);
                                                            await new Promise((resolve, reject) => {
                                                                reader.onload = () => resolve();
                                                                reader.onerror = () =>
                                                                    reject(new Error('Failed to read file'));
                                                            });

                                                            const base64Image = reader.result;
                                                            const imageFormat = file.type;
                                                            const imageUrl = await imagFile(base64Image, imageFormat);
                                                            if (imageUrl) {
                                                                handleChange('src', imageUrl);
                                                                setValue('src', imageUrl, { shouldValidate: true });
                                                                clearErrors('src');
                                                            }
                                                            const img = new Image();
                                                            img.src = imageUrl;
                                                            await new Promise((resolve, reject) => {
                                                                img.onload = () => resolve();
                                                                img.onerror = () =>
                                                                    reject(new Error('Failed to load image'));
                                                            });

                                                            // Find the column width for this image
                                                            let columnWidth = 600;
                                                            if (selectedComponent?.grid_data_id) {
                                                                // Search through components to find the column that contains this image
                                                                for (const component of components) {
                                                                    if (component.column) {
                                                                        for (const column of component.column) {
                                                                            if (column.children) {
                                                                                const imageChild = column.children.find(
                                                                                    (child) =>
                                                                                        child.grid_data_id ===
                                                                                        selectedComponent.grid_data_id,
                                                                                );
                                                                                if (imageChild) {
                                                                                    columnWidth = column.width;
                                                                                    break;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            onUpdateComponent({
                                                                ...selectedComponent,
                                                                src: imageUrl,
                                                                imgwidth: `${columnWidth}px`,
                                                                columnWidth: columnWidth,
                                                            });

                                                            setValue('src', imageUrl, { shouldValidate: true });
                                                            //   setValue('imgwidth', columnWidth, { shouldValidate: true });
                                                            clearErrors('src');
                                                            //setValue('imgheight', 100);
                                                            // setValue('imgwidth', 100);
                                                            // if (img.width) {
                                                            //     setValue('imgwidth', img.width);
                                                            // }
                                                            // if (img.height) {
                                                            //     setValue('imgheight', img.height);
                                                            // }
                                                        } catch (error) {
                                                            setError('src', {
                                                                type: 'manual',
                                                                message: error.message || 'Failed to upload image',
                                                            });
                                                        }
                                                    }
                                                }}
                                                containerClass="rs-image-upload-properties"
                                            />
                                       
                                        {selectedComponent.src && (
                                            <>
                                            <div className='pt20'>
                                                <div className="d-flex image-preview-rgt-contoller justify-content-between items-padding border-bottom-0 mb0 ">
                                                    <img
                                                        src={selectedComponent.src}
                                                        alt="Preview"
                                                        style={{
                                                            // maxWidth: '250px',
                                                            maxHeight: '250px',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                    {/* <MdDelete
                                                        className="right-control-delete"
                                                        style={{
                                                            color: '#0000ff',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeImage();
                                                            // handleChange('src', null);
                                                        }}
                                                    /> */}
                                                    <RSTooltip
                                                        text={'Delete'}
                                                        position="top"
                                                        className="lh0 position-absolute right5 top5 bg-white p5 image-delete"
                                                    >
                                                        <i
                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeImage();
                                                                // handleChange('src', null);
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </div>
                                                </div>

                                                {/* <RSInput
                                control={control}
                                placeholder={'Image Text'}
                                type={'text'}
                                name={'imgText'}
                                defaultValue={selectedComponent.imgText}
                                value={selectedComponent.imgText}
                                handleOnchange={(e) => handleChange('imgText', e.target.value)}
                            /> */}
                                                <div className="items-padding border-bottom-0 mb0">
                                                    <Row>
                                                        <Col sm={12}>
                                                            <Form.Label className="mb5">Link</Form.Label>
                                                        </Col>
                                                        <Col sm={12}>
                                                            <RSInput
                                                                control={control}
                                                                // placeholder={'Image URL'}
                                                                type={'text'}
                                                                name={'imgUrl'}
                                                                defaultValue={selectedComponent.imgUrl || ''}
                                                                // value={selectedComponent.imgUrl}
                                                                handleOnchange={(e) =>
                                                                    handleChange('imgUrl', e.target.value)
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="items-padding border-bottom-0 mb0">
                                                    <Row>
                                                        <Col sm={12} className="pr0">
                                                            <Form.Label className="mb5">Alt image name</Form.Label>
                                                        </Col>
                                                        <Col sm={12}>
                                                            {' '}
                                                            <RSInput
                                                                control={control}
                                                                // placeholder={'Alt image name'}
                                                                type={'text'}
                                                                name={'alt'}
                                                                defaultValue={selectedComponent.alt || ''}
                                                                value={selectedComponent.alt}
                                                                handleOnchange={(e) =>
                                                                    handleChange('alt', e.target.value)
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className="items-padding border-bottom-0 mb0">
                                                    <Row>
                                                        {/* <Col sm={7}>
                                                            <Form.Label>Width</Form.Label>
                                                        </Col>
                                                        <Col sm={5}>
                                                            <RSInput
                                                                control={control}
                                                                // placeholder={'Width'}
                                                                type={'number'}
                                                                name={'imgwidth'}
                                                                defaultValue={selectedComponent.imgwidth || ''}
                                                                handleOnchange={(e) =>
                                                                    handleChange('imgwidth', e.target.value)
                                                                }
                                                            />
                                                        </Col> */}

                                                        <WidthHeightLabel
                                                            label="Width"
                                                            targetName="imgwidth"
                                                            value={selectedComponent.imgwidth}
                                                            step={1}
                                                            defaultValue={selectedComponent.imgwidth ?selectedComponent.imgwidth : 'auto'}
                                                            maxWidth={selectedComponent.columnWidth || 600}
                                                            onValueChange={(finalValue) => {
                                                                handleChange('imgwidth', finalValue);
                                                            }}
                                                        />
                                                    </Row>
                                                </div>
                                                <div className="items-padding border-bottom-0 mb0">
                                                    <Row>
                                                        {/* <Col sm={7}>
                                                            <Form.Label>Height</Form.Label>
                                                        </Col>

                                                        <Col sm={5}>
                                                            <RSInput
                                                                control={control}
                                                                // placeholder={'Height'}
                                                                type={'number'}
                                                                name={'imgheight'}
                                                                defaultValue={selectedComponent.imgheight || ''}
                                                                handleOnchange={(e) =>
                                                                    handleChange('imgheight', e.target.value)
                                                                }
                                                            />
                                                        </Col> */}

                                                        <Form.Group>
                                                            <WidthHeightLabel
                                                                label="Height"
                                                                targetName="imgheight"
                                                                value={selectedComponent.imgheight}
                                                                step={1}
                                                                defaultValue={
                                                                    selectedComponent.imgheight
                                                                        ? selectedComponent.imgheight
                                                                        : 'auto'
                                                                }
                                                                maxWidth={selectedComponent.columnwidth || 600}
                                                                onValueChange={(finalValue) => {
                                                                    handleChange('imgheight', finalValue);
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Row>
                                                </div>
                                                <Form.Group className="items-padding border-bottom-0 mb0">
                                                    <Row>
                                                        <Col sm={7}>
                                                            <Form.Label>Image position</Form.Label>
                                                        </Col>
                                                        <Col sm={5}>
                                                            <PositionControllerWithLabel
                                                                // label="Image position"
                                                                options={bckgImgAlignmentOptions}
                                                                name="Image position"
                                                                selectedValue={selectedComponent.alignment}
                                                                onChange={(value) => handleChange('alignment', value)}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Form.Group>

                                                

                                                {/* <Form.Group className="d-flex justify-content-between align-items-center">
                                                    <Form.Label className="m-0">{'Image Border'}</Form.Label>
                                                    <Form.Check
                                                        // type="switch"
                                                        // id="isborder-switch"
                                                        label={selectedComponent.imgBorder ? 'ON' : 'OFF'}
                                                        checked={selectedComponent.imgBorder}
                                                        onChange={(e) => handleChange('imgBorder', e.target.checked)}
                                                    />
                                                    <RSSwitch
                                                        name="isborder"
                                                        control={control}
                                                        onLabel="ON"
                                                        offLabel="OFF"
                                                        defaultValue={selectedComponent.isborder}
                                                        handleChange={(value) => handleChange('isborder', value)}
                                                    />
                                                </Form.Group> */}

                                                {/* {selectedComponent.isborder && (
                                                    <div className='pt20'>
                                                        <BorderCustomizer
                                                            selectedComponent={selectedComponent}
                                                            handleChange={handleChange}
                                                        />
                                                    </div>
                                                )} */}
                                            </>
                                        )}
                                        </div>
                                        
                                        <BackgroundProperties
                                            selectedComponent={selectedComponent}
                                            handleChange={handleChange}
                                            horizontalAlignmentOptions={horizontalAlignmentOptions}
                                            verticleAlignmentOptions={verticleAlignmentOptions}
                                            control={control}
                                            clearErrors={clearErrors}
                                            setError={setError}
                                            watch={watch}
                                        />

                                        <PaddingBoxController
                                            padding={selectedComponent.padding}
                                            onPaddingChange={handlePaddingChange}
                                            onSyncPadding={syncPadding}
                                            selectedComponent={selectedComponent}
                                        />
                                    </div>
                                )}

                                {selectedComponent.type === ItemTypes.BUTTON && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            // gap: '20px',
                                        }}
                                    >
                                        <Form.Group as={Row} className=" align-items-center items-padding">
                                            <Form.Label column sm={3}>
                                                Button text
                                            </Form.Label>
                                            <Col sm={9}>
                                                <Form.Control
                                                    type="text"
                                                    value={selectedComponent.label || ''}
                                                    onChange={(e) => handleChange('label', e.target.value)}
                                                    placeholder="Enter button name"
                                                />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group className="items-padding">
                                            <WidthHeightLabel
                                                label="Width"
                                                targetName="width"
                                                value={selectedComponent.width}
                                                step={1}
                                                defaultValue={100}
                                                maxWidth={selectedComponent.columnwidth || 600}
                                                onValueChange={(finalValue) => {
                                                    handleChange('width', finalValue);
                                                }}
                                            />
                                        </Form.Group>

                                        <Form.Group className="items-select-dropdown items-padding">
                                            <InputControllerWithLabel
                                                label={'Content padding'}
                                                value={selectedComponent?.btnpadding}
                                                onChange={(name, val) => {
                                                    handleChange('btnpadding', val);
                                                }}
                                                onValueChange={(name, val) => {
                                                    handleChange('btnpadding', selectedComponent?.btnpadding + val);
                                                }}
                                                step={1}
                                            />
                                        </Form.Group>

                                        <Form.Group className="items-padding">
                                            <PositionControllerWithLabel
                                                label="Align"
                                                options={horizontalAlignmentOptions}
                                                name="horizontalPosition"
                                                selectedValue={selectedComponent.alignment}
                                                onChange={(value) => handleChange('alignment', value)}
                                            />
                                        </Form.Group>

                                        <Row className="align-items-center">
                                            <Col md={12}>
                                                <Form.Group className="w-100 d-flex justify-content-between align-items-center items-padding">
                                                    <Form.Label className="d-flex align-items-center">
                                                        Button color
                                                        {selectedComponent.color && (
                                                            <RSTooltip
                                                                text={'Refresh '}
                                                                position="top"
                                                                className="lh0 ml5"
                                                            >
                                                                <i
                                                                    className={`${refresh_mini} icon-xs color-primary-blue`}
                                                                    onClick={() => handleChange('color', null)}
                                                                />
                                                            </RSTooltip>
                                                        )}
                                                    </Form.Label>
                                                    <div className="d-flex gap-3">
                                                        {/* {selectedComponent.color && (
                                                            <MdOutlineResetTv
                                                                style={{
                                                                    color: '#0000ff',
                                                                    cursor: 'pointer',
                                                                    fontSize: '20px',
                                                                }}
                                                                onClick={() => handleChange('color', null)}
                                                            />
                                                        )} */}
                                                        <RSColorPicker
                                                            icon={colorpicker_bg_fill_medium}
                                                            tooltipText="Button Color"
                                                            initColor={selectedComponent.color || '#007bff'}
                                                            colorValue={selectedComponent.color}
                                                            onSelect={(e) => handleChange('color', e)}
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>

                                            <Col md={12}>
                                                <Form.Group className="w-100 d-flex justify-content-between align-items-center items-padding">
                                                    <Form.Label className="d-flex align-items-center">
                                                        Text color
                                                        {selectedComponent.fontcolor && (
                                                            <RSTooltip
                                                                text={'Refresh'}
                                                                position="top"
                                                                className="lh0 ml5"
                                                            >
                                                                <i
                                                                    className={`${refresh_mini} icon-xs color-primary-blue`}
                                                                    onClick={() => handleChange('fontcolor', null)}
                                                                />
                                                            </RSTooltip>
                                                        )}
                                                    </Form.Label>
                                                    <div className="d-flex gap-3">
                                                        {/* {selectedComponent.fontcolor && (
                                                            <MdOutlineResetTv
                                                                style={{
                                                                    color: '#0000ff',
                                                                    cursor: 'pointer',
                                                                    fontSize: '20px',
                                                                }}
                                                                onClick={() => handleChange('fontcolor', null)}
                                                            />
                                                        )} */}
                                                        <RSColorPicker
                                                            icon={text_color_medium}
                                                            tooltipText="Button Color"
                                                            initColor={selectedComponent.fontcolor || '#007bff'}
                                                            colorValue={selectedComponent.fontcolor}
                                                            onSelect={(e) => handleChange('fontcolor', e)}
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>

                                            <Col md={12}>
                                                <BackgroundProperties
                                                    selectedComponent={selectedComponent}
                                                    handleChange={handleChange}
                                                    horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                    verticleAlignmentOptions={verticleAlignmentOptions}
                                                    control={control}
                                                    clearErrors={clearErrors}
                                                    setError={setError}
                                                    watch={watch}
                                                />
                                            </Col>
                                        </Row>
                                        <>
                                            <Form.Group className="items-padding">
                                                <div className='d-flex justify-content-between align-items-center'>
                                                <Form.Label>{'Button border'}</Form.Label>
                                                {/* <Form.Check
                                                type="switch"
                                                id="isborder-switch"
                                                label={selectedComponent.isborder ? 'ON' : 'OFF'}
                                                checked={selectedComponent.isborder}
                                                onChange={(e) => handleChange('isborder', e.target.checked)}
                                            /> */}
                                                <RSSwitch
                                                    name="isborder"
                                                    control={control}
                                                    onLabel="ON"
                                                    offLabel="OFF"
                                                    defaultValue={selectedComponent.isborder}
                                                    handleChange={(value) => handleChange('isborder', value)}
                                                />
                                                </div>
                                            {selectedComponent.isborder && (
                                                <div className='pt20'>
                                                    <BorderCustomizer
                                                        selectedComponent={selectedComponent}
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                            )}
                                            </Form.Group>
                                        </>
                                        <FontPropertiesController
                                            selectedComponent={selectedComponent}
                                            handleChange={handleChange}
                                            control={control}
                                        />

                                        <LinkProperties
                                            selectedComponent={selectedComponent}
                                            handleChange={handleChange}
                                            control={control}
                                            watch={watch}
                                        />

                                        <PaddingBoxController
                                            padding={selectedComponent.padding}
                                            onPaddingChange={handlePaddingChange}
                                            onSyncPadding={syncPadding}
                                            selectedComponent={selectedComponent}
                                        />
                                    </div>
                                )}

                                {selectedComponent.type === ItemTypes.COLUMN && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            gap: '20px',
                                        }}
                                    >
                                        <Tabs activeKey={gridTab} onSelect={(key) => setGridTab(key)}>
                                            <Tab eventKey="Settings" title="Settings">
                                                <Form.Group className="items-padding d-flex align-items-center columns-input justify-content-between">
                                                    <Form.Label>Number of columns</Form.Label>
                                                    <div className="d-flex">
                                                        <InputGroup>
                                                            <Form.Control type="number" value={columnCount} readOnly />
                                                            <div
                                                                className="columns_button"
                                                                variant="outline-secondary"
                                                                onClick={() => addColumn()}
                                                            >
                                                                <i className={`${plus_mini} icon-xs`} />
                                                            </div>
                                                        </InputGroup>
                                                    </div>
                                                </Form.Group>

                                                {filteredColumns &&
                                                    filteredColumns?.length > 0 &&
                                                    filteredColumns.'icon-rs-map'((col, index) => {
                                                        return (
                                                            <Form.Group
                                                                key={index}
                                                                className="items-padding d-flex justify-content-between"
                                                            >
                                                                <Form.Label className="">Column {index + 1}</Form.Label>
                                                                <div className="align-items-center d-flex gap-2 items-select-dropdown justify-content-end">
                                                                    <Button
                                                                        variant="outline-info"
                                                                        onClick={() => toggleLock(col?.column_id)}
                                                                    >
                                                                        {col.locked ? (
                                                                            <i
                                                                                className={`${lock_medium} icon-md color-primary-blue`}
                                                                            />
                                                                        ) : (
                                                                            <i
                                                                                className={`${unlock_medium} icon-md color-primary-blue`}
                                                                            />
                                                                        )}
                                                                    </Button>
                                                                    {index > 0 ? (
                                                                        <RSTooltip
                                                                            position="top"
                                                                            text="Delete"
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                className={`${delete_medium} icon-md color-primary-red`}
                                                                                variant="danger"
                                                                                onClick={() => deleteColumn(index)}
                                                                            />
                                                                        </RSTooltip>
                                                                    ) : (
                                                                        <div className="w-20 d-none"></div>
                                                                    )}
                                                                    <InputController
                                                                        targetname={`col-${index}`}
                                                                        value={col?.width}
                                                                        step={1}
                                                                        onValueChange={(name, val) =>
                                                                            handleIncrement(
                                                                                col?.column_id,
                                                                                val,
                                                                                col?.width,
                                                                            )
                                                                        }
                                                                        onChange={(name, val) => {
                                                                            handleWidthChange(
                                                                                col?.column_id,
                                                                                parseInt(val),
                                                                            );
                                                                        }}
                                                                        maxWidth={600}
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        );
                                                    })}
                                                {selectedComponent &&
                                                    selectedComponent.column &&
                                                    selectedComponent.column?.length > 1 && (
                                                        <Form.Group className="items-padding items-select-dropdown">
                                                            <InputControllerWithLabel
                                                                label={'Containers gap'}
                                                                value={selectedComponent?.gap}
                                                                onChange={(name, val) => {
                                                                    handleGapChange(selectedComponent.id, val);
                                                                }}
                                                                onValueChange={(name, val) =>
                                                                    handleGapChange(
                                                                        selectedComponent.id,
                                                                        selectedComponent?.gap + val,
                                                                    )
                                                                }
                                                                step={5}
                                                            />
                                                        </Form.Group>
                                                    )}

                                                <PaddingBoxController
                                                    padding={selectedComponent.padding}
                                                    onPaddingChange={handlePaddingChange}
                                                    onSyncPadding={syncPadding}
                                                    selectedComponent={selectedComponent}
                                                />
                                            </Tab>

                                            <Tab eventKey="Styles" title="Style">
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <BackgroundProperties
                                                        selectedComponent={selectedComponent}
                                                        handleChange={handleChange}
                                                        horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                        verticleAlignmentOptions={verticleAlignmentOptions}
                                                        control={control}
                                                        clearErrors={clearErrors}
                                                        setError={setError}
                                                        watch={watch}
                                                    />
                                                </div>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                )}

                                {selectedComponent.type === ItemTypes.DIVIDER && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Form.Group className="d-flex justify-content-between align-items-center items-padding">
                                            <Form.Label>Spacer</Form.Label>
                                            <RSSwitch
                                                name="Spacer"
                                                checked={selectedComponent.spacer}
                                                handleChange={(chk) => {
                                                    handleChange('spacer', chk);
                                                }}
                                            />
                                        </Form.Group>

                                        {selectedComponent.spacer ? (
                                            <>
                                                <Form.Group className="items-padding">
                                                    <Row>
                                                        <Col sm={7}>
                                                            <Form.Label>Border height</Form.Label>
                                                        </Col>
                                                        <Col sm={5}>
                                                            <RSInput
                                                                control={control}
                                                                type={'number'}
                                                                name={'borderHeight'}
                                                                defaultValue={selectedComponent.borderHeight || '20'}
                                                                handleOnchange={(e) =>
                                                                    handleChange('borderHeight', e.target.value)
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Form.Group>

                                                <BackgroundProperties
                                                    selectedComponent={selectedComponent}
                                                    handleChange={handleChange}
                                                    horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                    verticleAlignmentOptions={verticleAlignmentOptions}
                                                    control={control}
                                                    clearErrors={clearErrors}
                                                    setError={setError}
                                                    watch={watch}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Form.Group className="items-padding">
                                                    <Row>
                                                        {/* <Col sm={7}>
                                                            <Form.Label>Border width</Form.Label>
                                                        </Col>
                                                        <Col sm={5}>
                                                            <RSInput
                                                                control={control}
                                                                type={'number'}
                                                                name={'borderWidth'}
                                                                defaultValue={selectedComponent.borderWidth || ''}
                                                                handleOnchange={(e) =>
                                                                    handleChange('borderWidth', e.target.value)
                                                                }
                                                            />

                                                            
                                                        </Col> */}

                                                <InputControllerWithLabel
                                                    label={'Border width'}
                                                    value={selectedComponent?.borderWidth}
                                                    onChange={(name, val) => {
                                                        handleChange('borderWidth', val);
                                                    }}
                                                    onValueChange={(name, val) => {
                                                        handleChange('borderWidth', selectedComponent?.borderWidth + val);
                                                    }}
                                                    step={1}
                                                    maxWidth={100}
                                                />
 
                                                 
                                                    </Row>
                                                </Form.Group>

                                                <Form.Group className="items-padding">
                                                    <PositionControllerWithLabel
                                                        label="Align"
                                                        options={horizontalAlignmentOptions}
                                                        name="horizontalPosition"
                                                        selectedValue={selectedComponent.alignment}
                                                        onChange={(value) => handleChange('alignment', value)}
                                                    />
                                                </Form.Group>

                                                <BackgroundProperties
                                                    selectedComponent={selectedComponent}
                                                    handleChange={handleChange}
                                                    horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                    verticleAlignmentOptions={verticleAlignmentOptions}
                                                    control={control}
                                                    clearErrors={clearErrors}
                                                    setError={setError}
                                                    watch={watch}
                                                />

                                                <BorderCustomizer
                                                    selectedComponent={selectedComponent}
                                                    handleChange={handleChange}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}

                                {selectedComponent.type === ItemTypes.SOCIAL && (
                                    <DndProvider backend={HTML5Backend}>
                                        <div>
                                            <div className="items-padding">
                                                <Form.Label className='mb5 '>Icon styles</Form.Label>
                                                <div className='d-flex align-items-center justify-content-between gap-3'>
                                                <Col md={10}>
                                                    <Form.Group>
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                variant="outline-secondary"
                                                                id="dropdown-basic"
                                                                aria-label="Select logo style"
                                                                style={{ width: '100%' }}
                                                            >
                                                                {selectedComponent.socialIcon || 'Select style'}
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu
                                                                style={{ minWidth: '300px', padding: '10px' }}
                                                            >
                                                                {SocialLogosConstants.'icon-rs-map'((socialGroup) => (
                                                                    <Button
                                                                        key={socialGroup.style}
                                                                        variant="outline-secondary"
                                                                        className="flex-column d-flex justify-content-between align-items-center w-100 mb10 social-dropdown"
                                                                        onClick={() => {
                                                                            handleChange(
                                                                                'socialIcon',
                                                                                socialGroup.style,
                                                                            );
                                                                        }}
                                                                        // style={{
                                                                        //     borderRadius: '5px',
                                                                        //     backgroundColor: 'transparent',
                                                                        //     transition:
                                                                        //         'background-color 0.2s ease-in-out',
                                                                        //     display: 'flex',
                                                                        //     justifyContent: 'space-between',
                                                                        //     alignItems: 'center',
                                                                        // }}
                                                                        onMouseEnter={(e) =>
                                                                            (e.currentTarget.style.backgroundColor =
                                                                                '#e9e9e9')
                                                                        }
                                                                        onMouseLeave={(e) =>
                                                                            (e.currentTarget.style.backgroundColor =
                                                                                'transparent')
                                                                        }
                                                                    >
                                                                        <h6>{socialGroup.style}</h6>
                                                                        <div className="d-flex gap-2 py10">
                                                                            {socialGroup.'icon-rs-map'((icon) => (
                                                                                <img
                                                                                    key={icon.id}
                                                                                    src={icon.iconSrc}
                                                                                    alt={icon.label}
                                                                                    style={{
                                                                                        width: '30px',
                                                                                        height: '30px',
                                                                                        borderRadius: '5px',
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </Button>
                                                                ))}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Dropdown>
                                                            <Dropdown.Toggle
                                                                variant="outline-secondary"
                                                                id="dropdown-basic"
                                                                bsPrefix="custom-dropdown-toggle"
                                                                aria-label="Add social media icon"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '8px',
                                                                    borderRadius: '5px',
                                                                    borderColor: '#c2cfe3',
                                                                }}
                                                            >
                                                                {/* <IoAddCircleOutline /> */}

                                                                <i
                                                                    className={`${circle_plus_edge_mini} icon-xs`}
                                                                />
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu
                                                                style={{ minWidth: '240px', padding: '10px' }}
                                                            >
                                                                <div className="d-flex flex-wrap gap-3">
                                                                    {socialIcons.'icon-rs-map'((social) => {
                                                                        const isSelected = socialLinks.includes(
                                                                            social.id,
                                                                        );
                                                                        return (
                                                                            <Col
                                                                                key={social.id}
                                                                                xs={2}
                                                                                className="text-center"
                                                                            >
                                                                                <Button
                                                                                    variant="outline-secondary"
                                                                                    onClick={() => {
                                                                                        addSocialLink(social.id);
                                                                                        // handleChange('addIcon', social.id,);
                                                                                    }}
                                                                                    className="d-flex justify-content-center align-items-center p-2"
                                                                                    style={{
                                                                                        width: '40px',
                                                                                        height: '40px',
                                                                                        borderRadius: '5px',
                                                                                        backgroundColor: isSelected
                                                                                            ? 'transparent'
                                                                                            : 'transparent',
                                                                                        border: isSelected
                                                                                            ? '2px solid #0000ff'
                                                                                            : '1px solid #c2cfe3',
                                                                                        opacity:
                                                                                            socialLinks.length >=
                                                                                                SOCIAL_CONFIG.MAX_SOCIAL_LINKS &&
                                                                                            !isSelected
                                                                                                ? 0.5
                                                                                                : 1,
                                                                                        cursor:
                                                                                            socialLinks.length >=
                                                                                                SOCIAL_CONFIG.MAX_SOCIAL_LINKS &&
                                                                                            !isSelected
                                                                                                ? 'not-allowed'
                                                                                                : 'pointer',
                                                                                    }}
                                                                                    disabled={
                                                                                        socialLinks.length >=
                                                                                            SOCIAL_CONFIG.MAX_SOCIAL_LINKS &&
                                                                                        !isSelected
                                                                                    }
                                                                                >
                                                                                    <img
                                                                                        src={social.Icon}
                                                                                        alt={social.label}
                                                                                        style={{
                                                                                            width: '20px',
                                                                                            height: '20px',
                                                                                        }}
                                                                                    />
                                                                                </Button>
                                                                            </Col>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </Form.Group>
                                                </Col>
                                                </div>
                                            </div>

                                            <Form.Group className="items-padding social-alt-name">
                                                <Form.Label className="mb5">Social links</Form.Label>
                                                {renderSocialLinks()}
                                            </Form.Group>

                                            <Form.Group>
                                                <div className="d-flex justify-content-between align-items-center items-padding">
                                                    <Form.Label>Title and alternate text customization</Form.Label>
                                                    {/* <Form.Check
                                                        type="switch"
                                                        id="alt-text-toggle"
                                                        checked={selectedComponent.Alttext || false}
                                                        onChange={(e) => handleChange('Alttext', e.target.checked)}
                                                    /> */}
                                                    <RSSwitch
                                                        name="Alttext"
                                                        control={control}
                                                        onLabel="ON"
                                                        offLabel="OFF"
                                                        defaultValue={droparea.Alttext}
                                                        handleChange={(value) => handleChange('Alttext', value)}
                                                    />
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="items-select-dropdown items-padding">
                                                <InputControllerWithLabel
                                                    label={'Icon size'}
                                                    value={selectedComponent?.size}
                                                    onChange={(name, val) => {
                                                        handleChange('size', val);
                                                    }}
                                                    onValueChange={(name, val) => {
                                                        handleChange('size', selectedComponent?.size + val);
                                                    }}
                                                    step={1}
                                                />
                                            </Form.Group>

                                            <Form.Group className="items-select-dropdown items-padding">
                                                <InputControllerWithLabel
                                                    label={'Icon spacing'}
                                                    value={selectedComponent?.SpaceBetweenIcons}
                                                    onChange={(name, val) => {
                                                        handleChange('SpaceBetweenIcons', val);
                                                    }}
                                                    onValueChange={(name, val) =>
                                                        handleChange(
                                                            'SpaceBetweenIcons',
                                                            selectedComponent?.SpaceBetweenIcons + val,
                                                        )
                                                    }
                                                    step={1}
                                                />
                                            </Form.Group>

                                            <Form.Group className="items-padding">
                                                <PositionControllerWithLabel
                                                    className={'align-items-center d-flex justify-content-between'}
                                                    label="Align"
                                                    options={horizontalAlignmentOptions}
                                                    name="alignment"
                                                    selectedValue={selectedComponent.alignment}
                                                    onChange={(value) => handleChange('alignment', value)}
                                                />
                                            </Form.Group>

                                            <BackgroundProperties
                                                selectedComponent={selectedComponent}
                                                handleChange={handleChange}
                                                horizontalAlignmentOptions={horizontalAlignmentOptions}
                                                verticleAlignmentOptions={verticleAlignmentOptions}
                                                control={control}
                                                clearErrors={clearErrors}
                                                setError={setError}
                                                watch={watch}
                                            />

                                            <Form.Group className="items-padding">
                                                <div className='d-flex justify-content-between align-items-center'>
                                                <Form.Label className="m-0">{'Icon border'}</Form.Label>
                                                {/* <Form.Check
                                                    type="switch"
                                                    id="isborder-switch"
                                                    label={selectedComponent.isborder ? 'ON' : 'OFF'}
                                                    checked={selectedComponent.isborder}
                                                    onChange={(e) => handleChange('isborder', e.target.checked)}
                                                /> */}
                                                <RSSwitch
                                                    name="isborder"
                                                    control={control}
                                                    onLabel="ON"
                                                    offLabel="OFF"
                                                    defaultValue={droparea.isborder}
                                                    handleChange={(value) => handleChange('isborder', value)}
                                                />
                                                </div>
                                            

                                            {selectedComponent.isborder && (
                                                <div div className='pt20'>
                                                    <BorderCustomizer
                                                        selectedComponent={selectedComponent}
                                                        handleChange={handleChange}
                                                    />
                                                </div>
                                            )}
                                            </Form.Group>

                                            <PaddingBoxController
                                                padding={selectedComponent.padding}
                                                onPaddingChange={handlePaddingChange}
                                                onSyncPadding={syncPadding}
                                                selectedComponent={selectedComponent}
                                            />
                                        </div>
                                    </DndProvider>
                                )}
                            </div>
                        </>
                    </>
                }
            </div>
        </>
    );
};

export default RightSidePanel;
