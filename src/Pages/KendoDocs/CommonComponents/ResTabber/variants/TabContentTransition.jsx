import { AnimatePresence, motion } from 'framer-motion';

/**
 * TabContentTransition
 *
 * Wraps tab content with a fade-in/fade-out transition.
 *
 * Usage:
 *   <TabContentTransition selectedIdx={selectedIdx}>
 *       {tabconfig?.[selectedIdx]?.component?.()}
 *   </TabContentTransition>
 */

const variants = {
    enter: {
        opacity: 0,
    },
    center: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const transition = {
    opacity: { duration: 0.18, ease: 'easeInOut' },
};

const TabContentTransition = ({ selectedIdx, children, className = '' }) => {
    return (
        <>
            {/* {children} */}
            <div className={className}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={selectedIdx}
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
        </>
    );
};

export default TabContentTransition;
