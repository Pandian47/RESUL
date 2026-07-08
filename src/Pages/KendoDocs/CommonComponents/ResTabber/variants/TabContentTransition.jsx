import { AnimatePresence, motion } from 'framer-motion';

/**
 * TabContentTransition
 *
 * Wraps tab content with a smooth fade-in / fade-out transition.
 * Handles three cases:
 *   1. null → number  : first tab selection (closed → opened panel)
 *   2. number → number: switching between tabs
 *   3. number → null  : panel closed (refresh / deselect)
 *
 * Usage:
 *   <TabContentTransition selectedIdx={selectedIdx}>
 *       {tabconfig?.[selectedIdx]?.component?.()}
 *   </TabContentTransition>
 */

const variants = {
    enter: {
        opacity: 0,
        y: 6,
        height: 0,
    },
    center: {
        opacity: 1,
        y: 0,
        height: 'auto',
    },
    exit: {
        opacity: 0,
        y: -4,
        height: 0,
    },
};

const transition = {
    opacity: { duration: 0.2, ease: 'easeInOut' },
    y: { duration: 0.2, ease: 'easeOut' },
    height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
};

/**
 * When selectedIdx is null there is no panel to show. We render nothing so
 * AnimatePresence can cleanly unmount the previous panel with its exit animation.
 */
const TabContentTransition = ({ selectedIdx, children, className = '' }) => {
    // Don't wrap a null panel — let AnimatePresence handle the unmount cleanly.
    const hasContent = selectedIdx !== null && selectedIdx !== undefined;

    return (
        <AnimatePresence mode="wait" initial={false}>
            {hasContent && (
                <motion.div
                    key={selectedIdx}
                    className={className || undefined}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    style={{ width: '100%', overflow: 'hidden', minHeight: 0 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TabContentTransition;
