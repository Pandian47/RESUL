import { BLOCKS_VALUES } from '../../constants';
import BlocksData from '../../Pages/LandingPageBuilder/Components/BlocksData';

const BlocksElement = ({ setBlockContent }) => {
    return (
        <div
            className="box-design"
            style={{ position: 'absolute', width: 'fit-content', maxHeight: '500px', overflow: 'scroll' }}
        >
            <ul className="m3">
                {BLOCKS_VALUES.map((item) => {
                    return (
                        <li className="mb20 p5" key={item.id}>
                            <BlocksData value={item} setBlockContent={setBlockContent} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default BlocksElement;
