import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * TabContentTransition
 *
 * Wraps tab content with a directional slide + fade transition.
 * - Moving forward (1→2): new content slides in from the left (reversed)
 * - Moving backward (2→1): new content slides in from the right (reversed)
 *
 * Usage:
 *   <TabContentTransition selectedIdx={selectedIdx}>
 *       {tabconfig?.[selectedIdx]?.component?.()}
 *   </TabContentTransition>
 */

const SLIDE_AMOUNT = 28; // px — subtle, not a full-width slide

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? SLIDE_AMOUNT : -SLIDE_AMOUNT,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction > 0 ? -SLIDE_AMOUNT : SLIDE_AMOUNT,
        opacity: 0,
    }),
};

const transition = {
    x: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
    opacity: { duration: 0.18, ease: 'easeInOut' },
};

const TabContentTransition = ({ selectedIdx, children, className = '' }) => {
    const prevIdxRef = useRef(selectedIdx);

    // direction: +1 = forward (right-to-left slide), -1 = backward (left-to-right slide)
    const direction = selectedIdx >= prevIdxRef.current ? 1 : -1;
    prevIdxRef.current = selectedIdx;

    return (
        // overflow:hidden clips the entering/exiting slide without affecting layout
        <div style={{ overflow: 'hidden', position: 'relative' }} className={className}>
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                    key={selectedIdx}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    style={{ width: '100%' }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TabContentTransition;
