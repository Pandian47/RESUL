
export function maskingString(str, start, end) {
    if (!str || start < 0 || start >= str?.length || end < 0 || end > str?.length || start >= end) {
        return str;
    }
    const maskLength = end - start;
    const maskedStr = str.substring(0, start) + '*'.repeat(maskLength) + str.substring(end);
    return maskedStr;
}
export function maskStringRandomly(str, maskCount = 3) {
    let masked = str?.split(''); // Convert string to array to easily modify characters

    let positions = new Set();
    while (positions.size < maskCount) {
        let randomPos = Math.floor(Math.random() * str?.length);
        // Ensure no duplicate positions and that we don't replace slashes or other special characters that might disrupt URLs
        if (!positions.has(randomPos) && masked[randomPos]?.match(/[a-zA-Z0-9]/)) {
            positions.add(randomPos);
        }
    }

    // Convert positions Set to array and sort it to avoid overlap issues
    let sortedPositions = Array.from(positions).sort((a, b) => a - b);

    // Replace the characters at the selected positions with '**'
    sortedPositions.forEach((pos) => {
        masked[pos] = '**';
    });

    return masked.join('');
}

export function maskStringRandomlyNew(str = '', maskCount = 3) {
    if (!str) return '';

    const chars = str.split('');
    const validIndexes = chars.map((ch, i) => (/[a-zA-Z0-9]/.test(ch) ? i : null)).filter((i) => i !== null);

    if (validIndexes.length === 0) return str;
    const finalMaskCount = Math.min(maskCount, validIndexes.length);

    for (let i = validIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validIndexes[i], validIndexes[j]] = [validIndexes[j], validIndexes[i]];
    }

    for (let i = 0; i < finalMaskCount; i++) {
        chars[validIndexes[i]] = '**';
    }

    return chars.join('');
}

export function maskingString_New(input) {
    const emailIndicesToMask = [2, 3, 4, 6, 8, 10, 11, 12, 13, 14, 15];
    const mobileIndicesToMask = [2, 3, 4, 6, 8, 10, 11, 12, 13, 14, 15];

    if (!input) {
        return input;
    }

    if (input.includes('@')) {
        const [localPart, domainPart] = input.split('@');
        if (!localPart || !domainPart) {
            return input;
        }

        let maskedLocalPart = '';
        for (let i = 0; i < localPart?.length; i++) {
            if (emailIndicesToMask.includes(i)) {
                maskedLocalPart += '*';
            } else {
                maskedLocalPart += localPart[i];
            }
        }

        return `${maskedLocalPart}@${domainPart}`;
    }

    let maskedMobileNumber = '';
    for (let i = 0; i < input?.length; i++) {
        if (mobileIndicesToMask.includes(i)) {
            maskedMobileNumber += '*';
        } else {
            maskedMobileNumber += input[i];
        }
    }

    return maskedMobileNumber;
}
/** Masks exactly two consecutive digits at the center of the numeric portion (e.g. 98765**3210). */
export function maskPhoneTwoDigitsInMiddle(str = '') {
    if (!str) return '';

    const chars = str.split('');
    const digitIndexes = chars.map((ch, i) => (/\d/.test(ch) ? i : null)).filter((i) => i !== null);

    if (digitIndexes.length < 2) return str;

    const midStart = Math.floor((digitIndexes.length - 2) / 2);
    chars[digitIndexes[midStart]] = '*';
    chars[digitIndexes[midStart + 1]] = '*';

    return chars.join('');
}

export function maskEmailTwoCharsBeforeAndAfterDomain(email = '') {
    if (typeof email !== 'string') return email;
    const trimmed = email.trim();
    if (!trimmed) return email;

    const maskSecondAndThirdChar = (segment = '') => {
        if (!segment) return segment;
        if (segment.length === 1) return segment;
        if (segment.length === 2) return `${segment[0]}*`;
        return `${segment[0]}**${segment.slice(3)}`;
    };

    const atIndex = trimmed.indexOf('@');
    if (atIndex === -1) return maskSecondAndThirdChar(trimmed);

    const localPart = trimmed.slice(0, atIndex);
    const domainPart = trimmed.slice(atIndex + 1);
    const maskedLocal = maskSecondAndThirdChar(localPart);

    if (!domainPart) return `${maskedLocal}@`;

    const dotIndex = domainPart.indexOf('.');
    if (dotIndex === -1) {
        return `${maskedLocal}@${maskSecondAndThirdChar(domainPart)}`;
    }

    const firstDomainLabel = domainPart.slice(0, dotIndex);
    const domainRemainder = domainPart.slice(dotIndex);
    return `${maskedLocal}@${maskSecondAndThirdChar(firstDomainLabel)}${domainRemainder}`;
}