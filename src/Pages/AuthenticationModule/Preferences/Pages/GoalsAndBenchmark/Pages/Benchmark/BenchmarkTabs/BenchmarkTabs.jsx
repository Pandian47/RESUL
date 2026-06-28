import { useEffect, useState } from 'react';
import RSTabbar from 'Components/RSTabber';

import { getTabberConfig } from './constant';

const BenchmarkTabs = ({ channel }) => {
    const [tabdata, setTabdata] = useState([]);

    useEffect(() => setTabdata(getTabberConfig(channel)), [channel]);

    return (
        <div>
            <RSTabbar
                dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
                activeClass={`active`}
                defaultTab={0}
                tabData={tabdata}
            />
        </div>
    );
};

export default BenchmarkTabs;
