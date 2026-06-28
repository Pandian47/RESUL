import { numberWithCommas } from 'Utils/modules/formatters';
import RSIcon from 'Components/RSIcon';



const Info = ({ keyMetrics, title, tootipSide, handleClose }) => {
    return (
        <div className={`key-info-popup ${tootipSide}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="white font-xsm">{title}</h3>
                <RSIcon handleClose={() => handleClose()} />
            </div>
            <ul className="info-spam-list">
                {keyMetrics?.map((item, index) => (
                    <li key={index}>
                        <p className="spam-text">{item.text}</p>
                        <p>
                            {title !== 'Conversion value'
                                ? `- (${numberWithCommas(item.count)})`
                                : `${numberWithCommas(item.count)}`}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Info;
