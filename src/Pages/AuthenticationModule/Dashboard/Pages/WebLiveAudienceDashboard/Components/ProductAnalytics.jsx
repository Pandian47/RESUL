import { useState } from 'react';
import { NoData, PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import SequenceChart from './SunburstChart/SequenceChart'

export const ProductAnalytics = props => {

    const [isShowSkeleton, setIsShowSkeleton] = useState(true)
    const [data, setData] = useState(props?.data)

    return <div className='mt-20 ml50'>
        {
            data
                ? <SequenceChart data={data} />
                : <> <NoData /> <PieChartSkeleton /></>
        }
    </div>
}