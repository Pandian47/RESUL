import { specialCharacters } from './renewal';
export function onlyNumbers(e) {
    const { keyCode, key, ctrlKey, metaKey, code } = e;
    if ((ctrlKey || metaKey) && key === 'v') {
        setTimeout(() => {
            const input = e.target;
            const value = input.value;

            if (/[^0-9.]/.test(value)) {
                input.value = '';
            } else {
                input.dataset.lastValidValue = value;
            }
        }, 0);
        return;
    }

    if (
        specialCharacters.has(key) ||
        ((keyCode < 48 || keyCode > 57) &&
            keyCode !== 37 && // Left arrow
            keyCode !== 39 && // Right arrow
            keyCode !== 46 && // Delete
            key !== 'Backspace' &&
            key !== 'Tab' &&
            key !== '.' &&
            !code?.startsWith('Numpad'))
    ) {
        e.preventDefault();
    }
}
export function onlyNumbersWithComma(e) {
    const { keyCode, key, ctrlKey, metaKey } = e;

    // Handle paste
    if ((ctrlKey || metaKey) && key === 'v') {
        setTimeout(() => {
            const input = e.target;
            const value = input.value;

            // Allow only numbers and comma
            if (/[^0-9,]/.test(value)) {
                input.value = '';
            } else {
                input.dataset.lastValidValue = value;
            }
        }, 0);
        return;
    }

    // Allow comma - return early if comma is pressed
    if (key === ',' || keyCode === 188 || keyCode === 44) {
        return;
    }

    // Allow numbers (0-9)
    if (keyCode >= 48 && keyCode <= 57) {
        return;
    }

    // Allow navigation and editing keys
    if (
        keyCode === 37 || // Left arrow
        keyCode === 39 || // Right arrow
        keyCode === 46 || // Delete
        key === 'Backspace' ||
        key === 'Tab'
    ) {
        return;
    }

    // Block everything else (including special characters except comma which we already handled)
    e.preventDefault();
}

// export const onlyNumbers = (e) => {
//         const { keyCode, key, ctrlKey, type } = e;
//     debugger
//     // Handle paste event (Ctrl + V)
//     if (type === 'paste') {
//         const pastedText = e.clipboardData.getData('text');

//         // Check if pasted text contains special characters or invalid characters
//         if (/[^0-9.]/.test(pastedText)) {
//             e.preventDefault(); // Prevent paste if invalid characters are found
//         }
//         return; // Exit the function after handling paste
//     }

//     // Handle keydown event
//     if (
//         specialCharacters.has(key) ||
//         ((keyCode < 48 || keyCode > 57) &&
//             keyCode !== 37 && // Left arrow
//             keyCode !== 39 && // Right arrow
//             keyCode !== 46 && // Delete
//             key !== 'Backspace' &&
//             key !== 'Tab' &&
//             key !== '.')
//     ) {
//         e.preventDefault();
//     }
// };
// Allow both numbers & decimals; block special characters and sanitize paste
export function onlyNumbersDecimal(e) {
    const { keyCode, key, ctrlKey, metaKey, code } = e;

    if ((ctrlKey || metaKey) && key === 'v') {
        setTimeout(() => {
            const input = e.target;
            const value = input.value;
            if (/[^0-9.]/.test(value)) {
                input.value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
            }
        }, 0);
        return;
    }

    if (key === '.' || keyCode === 190 || keyCode === 110) {
        if (e.target.value.includes('.')) {
            e.preventDefault();
        }
        return;
    }

    if (
        specialCharacters.has(key) ||
        ((keyCode < 48 || keyCode > 57) &&
            keyCode !== 37 &&
            keyCode !== 39 &&
            keyCode !== 46 &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            !code?.startsWith('Numpad') &&
            !(keyCode >= 96 && keyCode <= 105))
    ) {
        e.preventDefault();
    }
}

//Allow only characters
export function onKeyChar(e) {
    const { keyCode, key } = e;
    if (
        specialCharacters.has(key) ||
        ((keyCode < 65 || keyCode > 90) &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            key !== '.' &&
            keyCode !== 37 &&
            keyCode !== 46 &&
            keyCode !== 39 &&
            keyCode !== 32)
    ) {
        e.preventDefault();
    }
}

//Allow characters, numbers and underscore
export function charNumUnderScore(e) {
    const { key, target } = e;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', ' '];
    const isValidCharacter = (char) => {
        return (
            (char >= 'A' && char <= 'Z') ||
            (char >= 'a' && char <= 'z') ||
            (char >= '0' && char <= '9') ||
            char === '_' ||
            char === '-' ||
            char === ' '
        );
    };

    if (!isValidCharacter(key) && !allowedKeys.includes(key)) {
        e.preventDefault();
        target.value = target.value.split('').filter(isValidCharacter).join('');
    }
}

/** Letters, digits, underscore, hyphen, and space only. Used for offer category tag input. */
export function sanitizeAlphaNumUnderScoreHyphen(value) {
    if (value == null || value === '') return '';
    let val = String(value).replace(/[^a-zA-Z0-9_\-\s]/g, '');
    val = val.replace(/^\s+/, '');
    val = val.replace(/\s{2,}/g, ' ');
    return val;
}
//Allow characters, numbers and underscore , @,.
// export const charNumatdotUnderScore = (e) => {
//     const { keyCode, key } = e;
//     let speCharacters = specialCharacters;
//     speCharacters.delete('@');
//     speCharacters.delete('.');
//     if (
//         speCharacters.has(key) ||
//         ((keyCode < 65 || keyCode > 90) &&
//             keyCode !== 37 &&
//             keyCode !== 46 &&
//             keyCode !== 39 &&
//             (keyCode < 48 || keyCode > 57) &&
//             key !== 'Backspace' &&
//             key !== '@' &&
//             key !== '.' &&
//             key !== 'Tab' &&
//             keyCode !== 32)
//     ) {
//         e.preventDefault();
//     }
// };
export function charNumatdotUnderScore(e) {
    const { keyCode, key, code } = e;
    let speCharacters = new Set(specialCharacters);
    speCharacters.delete('@');
    speCharacters.delete('.');
    speCharacters.delete('_');
    speCharacters.delete('-');
    if (
        speCharacters.has(key) ||
        ((keyCode < 65 || keyCode > 90) &&
            keyCode !== 37 &&
            keyCode !== 39 &&
            keyCode !== 46 &&
            keyCode !== 8 &&
            keyCode !== 9 &&
            keyCode !== 32 &&
            (keyCode < 48 || keyCode > 57) &&
            key !== '@' &&
            key !== '.' &&
            key !== '_' &&
            !code?.startsWith('Numpad') &&
            key !== '-')
    ) {
        e.preventDefault();
    }
}
//Allow characters, numbers
export function charNum(e) {
    const { keyCode, key, code } = e;
    let speCharacters = new Set(specialCharacters);
    speCharacters.delete('_');
    if (
        speCharacters.has(key) ||
        ((keyCode < 65 || keyCode > 90) &&
            keyCode !== 37 &&
            keyCode !== 39 &&
            keyCode !== 46 &&
            (keyCode < 48 || keyCode > 57) &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            !code?.startsWith('Numpad') &&
            keyCode !== 32)
    ) {
        e.preventDefault();
    }
}
//Allow characters, numbers/ dot
export function charNumDot(e) {
    const { keyCode, key, code } = e;
    let speCharacters = new Set(specialCharacters);
    speCharacters.delete('.');
    if (
        speCharacters.has(key) ||
        ((keyCode < 65 || keyCode > 90) &&
            keyCode !== 37 &&
            keyCode !== 46 &&
            keyCode !== 39 &&
            (keyCode < 48 || keyCode > 57) &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            key !== '.' &&
            !code?.startsWith('Numpad') &&
            keyCode !== 32)
    ) {
        e.preventDefault();
    }
}
export function charNumDotWithoutSpace(e) {
    const { keyCode, key, code } = e;
    let speCharacters = new Set(specialCharacters);
    speCharacters.delete('.');
    speCharacters.delete('_');
    speCharacters.delete('+');
    if (
        speCharacters.has(key) ||
        ((keyCode < 65 || keyCode > 90) &&
            keyCode !== 37 &&
            keyCode !== 39 &&
            keyCode !== 46 &&
            (keyCode < 48 || keyCode > 57) &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            key !== '.' &&
            key !== '_' &&
            !code?.startsWith('Numpad') &&
            key !== '+')
    ) {
        e.preventDefault();
    }
}

// Allow onlycharacters ("." & "-") numbers and decimals without specialCharacters
export function charNumDotWithoutSpecialCharacters(e) {
    const { keyCode, key } = e;
    if (
        ((keyCode < 65 || keyCode > 90) &&
            (keyCode < 48 || keyCode > 57) &&
            key !== '.' &&
            key !== '-' &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            keyCode !== 32) ||
        !/^[a-zA-Z0-9\.-]+$/.test(key)
    ) {
        e.preventDefault();
    }
}

// Allow only numbers and decimals without specialCharacters
export function onlyNumbersDecimalWithoutSpecialCharacters(e) {
    const { keyCode, key, code } = e;
    const speCharacters = new Set(specialCharacters);
    speCharacters.delete('.');
    if (
        speCharacters.has(key) ||
        (keyCode > 31 &&
            keyCode !== 37 &&
            keyCode !== 46 &&
            keyCode !== 39 &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            !code?.startsWith('Numpad') &&
            (keyCode < 48 || (keyCode > 57 && keyCode != 190 && keyCode != 110)))
    ) {
        e.preventDefault();
    } else if (parseFloat(e.target.value + key) > 9999999999.9) {
        e.preventDefault();
    }
}

// Allow only numbers and decimals without specialCharacters and decimal upto 3 digits
export function onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits(e) {
    const { keyCode, key, code } = e;
    const speCharacters = new Set(specialCharacters);
    speCharacters.delete('.');
    const currentValue = e.target.value;
    const decimalIndex = currentValue.indexOf('.');

    if (
        speCharacters.has(key) ||
        (keyCode > 31 &&
            keyCode !== 37 &&
            keyCode !== 46 &&
            keyCode !== 39 &&
            key !== 'Backspace' &&
            key !== 'Tab' &&
            !code?.startsWith('Numpad') &&
            (keyCode < 48 || (keyCode > 57 && keyCode != 190 && keyCode != 110)))
    ) {
        e.preventDefault();
    } else if (decimalIndex !== -1 && currentValue.substring(decimalIndex + 1)?.length >= 3) {
        if (keyCode >= 48 && keyCode <= 57) {
            e.preventDefault();
        }
    } else if (parseFloat(e.target.value + key) > 9999999999.9) {
        e.preventDefault();
    }
}

export const allowedKeyCodes = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace']);
