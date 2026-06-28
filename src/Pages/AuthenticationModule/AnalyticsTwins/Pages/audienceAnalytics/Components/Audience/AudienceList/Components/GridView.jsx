
const GridView = ({ users, onUserSelect }) => {
    return (
        <ul className="rsTopvisitorsListItem">
            {users.map((user) => (
                <li key={user.firstName} onClick={() => onUserSelect(user)}>
                    <div className={user.bgColorName}></div>
                    <div className="px10 py3 width30p">{user.firstName || 'RESUL user'}</div>
                    {/* <div className="px10 py3 text-center width10p">{user.age}</div> */}
                    <div className="px10 py3">Participated in {user.count} communications</div>
                </li>
            ))}
        </ul>
    );
};

export default GridView;
