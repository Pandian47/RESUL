import { link_medium } from 'Constants/GlobalConstant/Glyphicons';
import InputController from './InputController';
const PaddingBoxController = ({
    padding = { top: 20, right: 20, bottom: 20, left: 20 },
    onPaddingChange,
    onSyncPadding,
    selectedComponent = {},
}) => {
    const handleIncrement = (side, amount) => {
        const currentValue = padding[side] || 0;
        const newValue = currentValue + amount;
        if (newValue >= 0) {
            onPaddingChange(side, newValue);
        }
    };

    return (
        <div className="items-select-dropdown items-padding border-bottom-0 mb0">
            <label className="form-label">Container padding</label>
            <div className="padding-box-controller mt15" id="box">
                <svg viewBox="0 0 100 100">
                    <path
                        d="M50 50 C55 35, 45 25, 50 19"
                        stroke={selectedComponent?.paddingsynced ? '#0000ff' : '#6c757d61'}
                        fill="transparent"
                        strokeWidth="0.9"
                    />
                    <path
                        d="M50 50 C40 55, 60 45, 70 48"
                        stroke={selectedComponent?.paddingsynced ? '#0000ff' : '#6c757d61'}
                        fill="transparent"
                        strokeWidth="0.9"
                    />
                    <path
                        d="M50 50 C45 65, 55 75, 50 81"
                        stroke={selectedComponent?.paddingsynced ? '#0000ff' : '#6c757d61'}
                        fill="transparent"
                        strokeWidth="0.9"
                    />
                    <path
                        d="M50 50 C50 45, 35 55, 31 50"
                        stroke={selectedComponent?.paddingsynced ? '#0000ff' : '#6c757d61'}
                        fill="transparent"
                        strokeWidth="0.9"
                    />
                </svg>

                <InputController
                    targetname="top"
                    value={padding.top}
                    step={1}
                    onValueChange={handleIncrement}
                    onChange={onPaddingChange}
                    className="position-absolute top-0 start-50 translate-middle-x"
                />

                <InputController
                    targetname="right"
                    value={padding.right}
                    step={1}
                    onValueChange={handleIncrement}
                    onChange={onPaddingChange}
                    className="position-absolute  end-0 translate-middle-y"
                />

                <InputController
                    targetname="bottom"
                    value={padding.bottom}
                    step={1}
                    onValueChange={handleIncrement}
                    onChange={onPaddingChange}
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                />

                <InputController
                    targetname="left"
                    value={padding.left}
                    step={1}
                    onValueChange={handleIncrement}
                    onChange={onPaddingChange}
                    className="position-absolute  start-0 translate-middle-y"
                />

                <div
                    className="padding-center-sync"
                    style={
                        selectedComponent?.paddingsynced
                            ? {
                                  background: '#0000ff',
                                  borderColor: '#0000ff',
                                  color: '#ffffff',
                                  borderRadius: '5px',
                              }
                            : {}
                    }
                >
                    <button
                        className="link-desktop"
                        style={
                            selectedComponent?.paddingsynced
                                ? {
                                      background: '#0000ff',
                                      borderColor: '#0000ff',
                                      color: '#ffffff',
                                  }
                                : {}
                        }
                    >
                        <i
                            className={`${link_medium} icon-md`}
                            onClick={onSyncPadding}
                            style={
                                selectedComponent?.paddingsynced
                                    ? {
                                          background: '#0000ff',
                                          borderColor: '#5ba529',
                                          // color: '#ffffff',
                                      }
                                    : {}
                            }
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaddingBoxController;
