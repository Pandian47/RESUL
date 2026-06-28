import { memo, useEffect, useState } from 'react';
import { Card, ListGroup } from 'react-bootstrap';

import _get from 'lodash/get';
import { sourceAndChannelList } from '../../constant';
import SourceBox from './SourceBox';
import ChannelBox from './ChannelBox';
import GoalBox from './GoalBox';
import useQueryParams from 'Hooks/useQueryParams';
const MdcSidebar = () => {
    const { sourceList, channelList, goalList } = sourceAndChannelList;
    const [primaryGoal, setPrimaryGoal] = useState('R');
    //const location = useLocation();
    const location = useQueryParams('/communication') || {};

    // const {
    //     state: { primaryGoal },
    // } = location;
    //const primaryGoal = _get(location, 'primayGoal', 'R');
    useEffect(() => {
        if (location && Object.keys(location)) {
            const primaryGoal = _get(location, 'primaryGoal', 'R');
            setPrimaryGoal(primaryGoal);
        }
    }, [location]);

    return (
        <>
            <Card className="mdc-left-card">
                <Card.Header>
                    Audience
                    {/* sources */}
                </Card.Header>
                <Card.Body>
                    <ListGroup bsPrefix={`mdc-side-pannel-center-bar mdc-left-ul`} as="ul">
                        {sourceList &&
                            sourceList.map((item, index) => {
                                                                return <SourceBox key={index} sourceObj={item} name={item.label} itemIndex={index} />;
                            })}
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card className="mdc-left-card">
                <Card.Header className='mb5'>Channels</Card.Header>
                <Card.Body>
                    <ListGroup bsPrefix="mdc-left-ul" as="ul">
                        {channelList &&
                            channelList.map((item, index) => (
                                <ChannelBox key={index} channelObj={item} name={item.label} itemIndex={index} />
                            ))}
                    </ListGroup>
                </Card.Body>
            </Card>
                <Card className="mdc-left-card">
                    <Card.Header>Goals/Endpoints </Card.Header>
                    <Card.Body>
                        <ListGroup bsPrefix="mdc-side-pannel-center-bar mdc-left-ul" as="ul">
                            {goalList &&
                                goalList.map((item, index) => (
                                    <GoalBox key={index} channelObj={item} name={item.label} itemIndex={index} />
                                ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
        </>
    );
};
export default memo(MdcSidebar);
