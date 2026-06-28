import { useLocation } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { planningSteps, planningSteps_ROI } from './constant';
import useQueryParams from 'Hooks/useQueryParams';

const RSProgressSteps = ({ isRoiCompleted, customSteps }) => {
    const { pathname } = useLocation();
    const currentPath = pathname.split('/').slice(-1)[0];
    const isCustomMode = Array.isArray(customSteps);
    const location = useQueryParams('/communication');

    const [state, setState] = useState(() => {
        if (isCustomMode) return customSteps;
        return planningSteps;
    });

    const getCurrentPath = (path, completed, isRoi, isExceute) => {
        if (currentPath === path) {
            if (location?.roi) {
                if (isRoi && isRoiCompleted) return 'inprogress';

                if (currentPath !== 'execute' || (currentPath === 'execute' && !isRoiCompleted && isExceute)) {
                    return 'inprogress';
                }
            } else {
                return 'inprogress';
            }
        }

        if (completed?.includes(currentPath) || (isRoi && !isRoiCompleted && currentPath === 'execute')) {
            return 'completed';
        }

        return '';
    };

    useEffect(() => {
        if (isCustomMode) {
            setState(customSteps);
            return;
        }

        if (location) {
            const { channels = [], roi = false } = location;
            if ((channels?.includes(1) || channels?.includes(2)) && roi) {
                setState(planningSteps_ROI);
            } else {
                setState(planningSteps);
            }
        }
    }, [location, customSteps, isCustomMode]);

    if (!Array.isArray(state)) {
        return null;
    }

    return (
        <ListGroup variant="steps">
            {state.map((item) => {
                const { step, stepTitle, path, completed, isRoi, isExceute, status } = item;
                const itemStatus = isCustomMode ? status || '' : status || getCurrentPath(path, completed, isRoi, isExceute);
                return (
                    <ListGroup.Item key={step} className={itemStatus}>
                        <span className="step">{step}</span>
                        <span className="title">{stepTitle}</span>
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
};

export default RSProgressSteps;
