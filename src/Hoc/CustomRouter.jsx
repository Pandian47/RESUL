import { useLayoutEffect, useState } from 'react';
import { Router } from 'react-router-dom';

const CustomRouter = ({ basename, children, history }) => {
    const [state, setState] = useState({
        action: history.action,
        location: history.location,
    });

    useLayoutEffect(() => history.listen(setState), [history]);

    return (
        <Router
            basename={basename}
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    );
};

export default CustomRouter;
