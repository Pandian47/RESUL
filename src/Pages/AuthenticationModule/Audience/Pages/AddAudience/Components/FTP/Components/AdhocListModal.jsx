import { circle_arrow_right_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSAlert from 'Components/RSAlert';

import {
    CANCEL,
    COLUMN_HEADER_SPACE,
    CSV_FILE_UPLOAD,
    I_AGREE,
    LIST_MAY_HINDER,
    LIST_WILL_EXPIRE,
    MILLION_RECORD,
    MORE_THAN_10MB,
    THE_ADHOC_LIST,
    UPTO_5_MILLION,
} from 'Constants/GlobalConstant/Placeholders';

const AdhocListModal = ({ show, handleClose, handleConfirm }) => {
    return (
        <RSAlert
            show={show}
            header={false}
            body={
                <>
                    <h1>{THE_ADHOC_LIST}</h1>
                    <ul>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>{UPTO_5_MILLION}</span>
                        </li>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>{MORE_THAN_10MB}</span>
                        </li>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>{CSV_FILE_UPLOAD}</span>
                        </li>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>{LIST_WILL_EXPIRE}</span>
                        </li>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span> {COLUMN_HEADER_SPACE}</span>
                        </li>
                        <li>
                            <i className={` ${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>{MILLION_RECORD}</span>
                        </li>
                        <p>{LIST_MAY_HINDER}</p>
                    </ul>
                </>
            }
            footer
            primaryButtonText={I_AGREE}
            secondaryButtonText={CANCEL}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
        />
    );
};

export default AdhocListModal;
