import { copy_mini, delete_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
const ToggleMenuBar = ({ item = {}, onDuplicate, onDelete, className, disableDelete = false }) => {
    const [menuHover, setMenuHover] = useState(true);
    return (
        <div className={`${className ? className : 'menu-toggle-right'}`}>
            {/* <div className={`${className ? className : 'parent-menu-toggle-right menu-toggle-right'}`}> */}
            {/* <HiDotsHorizontal style={{ color: 'white' }} className="dots" /> */}
            <div 
                className='dots-icons'
                onMouseEnter={() => {
                    setMenuHover(true);
                }}
                onMouseLeave={() => {
                    setMenuHover(false);
                }}
              >

                {
                    menuHover
                    ? <>
                        {/* copy */}
                        <div className='dots-icon'>
                            <i
                                className={`${copy_mini} icon-xs white`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate(item);
                                }}
                            />
                        </div>
                        {/* delete */}
                        <div className='dots-icon'>
                            <i
                                style={{
                                    opacity: disableDelete ? 0.5 : 1,
                                    cursor: disableDelete ? 'not-allowed' : 'pointer',
                                }}
                                className={`${delete_mini} icon-xs white`}
                                onClick={(e) => {
                                    if (disableDelete) return;
                                    e.stopPropagation();
                                    onDelete(item);
                                }}
                            />
                        </div>
                    </>
                    : <>
                        {/* trash */}
                        <div className='dots-icon'>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="lucide lucide-ellipsis-icon lucide-ellipsis">
                                <circle cx="12" cy="12" r="1"/>
                                <circle cx="19" cy="12" r="1"/>
                                <circle cx="5" cy="12" r="1"/>
                            </svg>
                        </div>
                    </>
                }
                
            </div>
        </div>
    );
};

export default ToggleMenuBar;
