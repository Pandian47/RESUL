import { CustomCode } from '../Common';
import { RSDropdownList } from 'Components/RSDropdowns';
export const BootstrapDropdown = () => {
    return(
        <>
            <CustomCode title="Page header" c1='Login page wrapper' c2="login" value={codeSelectDropdown}></CustomCode>
            
            <RSDropdownList
                className={''}
                data={['Test 1', 'Test 2']}
                defaultItem={'Test 1'}
            />
        </>
    )
};



let codeSelectDropdown = `import { RSDropdownList } from 'Components/RSDropdowns';

<RSDropdownList
    className={''}
    data={['Test 1', 'Test 2']}
    defaultItem={'Test 1'}
/>`