import { Badge, Card } from 'react-bootstrap';
const CloudViews = ({ users, onUserSelect }) => {
    return (
        <Card className="rsBadgeList">
            <Card.Body>
                {users.map((user) => {
                    return (
                        <div className="rsBadgeListItem" key={user.name}>
                            <Badge onClick={() => onUserSelect(user)} className={user.bgColorName}>
                                {user.firstName || 'RESUL user'} {user.count} communications
                            </Badge>
                        </div>
                    );
                })}
            </Card.Body>
        </Card>
    );
};

export default CloudViews;
