import _map from 'lodash/map';
import _get from 'lodash/get';
export const InteractivityButtonsPreview = ({ buttonText = [], type = 'chrome', className = '' }) => {
    if (!Array.isArray(buttonText) || buttonText.length === 0) return null;
    return (
        <div className={`rswbpc-buttons d-flex gap-2 justify-content-center flex-wrap  ${type !== 'andriod' ? '' : ''} ${className}`.trim()}>
            {_map(buttonText, ({ text, customText, ...rest }, index) => {
                const backgroundColor = _get(rest, 'backgroundColor', 'inherit');
                const color = _get(rest, 'fontColor', 'inherit');
                const isSingleButton = buttonText.length === 1;
                let button = customText || text?.value;

                if (text?.value?.includes?.('smartLink')) {
                    button = customText;
                }

                // text is { id, value } - check value length, not text.length
                const hasContent = (text?.value?.length > 0) || (customText?.length > 0);

                if (!hasContent) return null;

                return (
                    <button
                        type="button"
                        key={`${text?.value}-${index}`}
                        className='p5 border-r7'
                        // className={isSingleButton ? 'single-interaction-button p4' : undefined}
                        style={{
                            backgroundColor,
                            color,
                        }}
                    >
                        {button}
                    </button>
                );
            })}
        </div>
    );
};

export default InteractivityButtonsPreview;
