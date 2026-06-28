import { Fragment } from 'react';
export const ConditionalWrapper = ({ condition, wrapper, children, noWrapper }) => {
    return condition ? wrapper(children) : noWrapper(children);
};
export const Wrapper = (children) => <Fragment>{children}</Fragment>;
