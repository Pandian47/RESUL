
export const RANDOMCHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function GeneratePasswordpseudorandom(pwdLen) {
    // var pwdChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-!#$%^&*?_~()';
    // var pwdLen = 10;
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = lowercaseChars.toUpperCase();
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;\':"\\,.<>/?`~';
    const allChars = lowercaseChars + uppercaseChars + numbers + symbols;
    var randPassword = new Array(pwdLen)
        .fill(0)
        .map((x) =>
            (function (chars) {
                let umax = Math.pow(2, 32),
                    r = new Uint32Array(1),
                    max = umax - (umax % chars?.length);
                do {
                    crypto.getRandomValues(r);
                } while (r[0] > max);
                return chars[r[0] % chars?.length];
            })(allChars),
        )
        .join('');
    // console.log('randPassword: ', randPassword);
    return randPassword;
}
export function GenerateUserPassword(length) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;\':",.<>/?`~';

    const getRandomChar = (charset) => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return charset[randomValues[0] % charset.length];
    };

    const mandatoryChars = [
        getRandomChar(lowercaseChars),
        getRandomChar(uppercaseChars),
        getRandomChar(numbers),
        getRandomChar(symbols),
    ];

    const allChars = lowercaseChars + uppercaseChars + numbers + symbols;
    const remainingLength = length - mandatoryChars.length;
    const randomChars = Array.from({ length: remainingLength }, () => {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        return allChars[randomValues[0] % allChars.length];
    });

    const passwordChars = [...mandatoryChars, ...randomChars];
    const shuffled = passwordChars
        .map((value) => ({ value, sort: crypto.getRandomValues(new Uint32Array(1))[0] }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return shuffled.join('');
}
// export const GeneratePassword = () => {
//     var plength = 10;
//     var keylist = new Array(
//         'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
//         'abcdefghijklmnopqrstuvwxyz',
//         '1234567890',
//         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
//         '-!#$%^&*?_~()',
//     );
//     var temp = '';
//     var count = 0;

//     var i = 0,
//         //Math.floor(Math.random() * 5),
//         j = 0;
//     for (; i < 5; i++) {
//         if (i == 0) {
//             for (j = 0; j < plength - 4; j++) temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         } else temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         count++;
//         if (count == 5) break;
//         else if (i == 4 && count < 5) i = -1;
//     }
//     console.log('temp: ', temp);
//     return temp;
// };
// export const GeneratePassword16Char = () => {
//     var plength = 16;
//     var keylist = new Array(
//         'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
//         'abcdefghijklmnopqrstuvwxyz',
//         '1234567890',
//         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
//         '-!#$%^&*?_~()',
//     );
//     var temp = '';
//     var count = 0;
//     var i = 0,
//         // Math.floor(Math.random() * 5),
//         j = 0;
//     for (; i < 5; i++) {
//         if (i == 0) {
//             for (j = 0; j < plength - 4; j++) temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         } else temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         count++;
//         if (count == 5) break;
//         else if (i == 4 && count < 5) i = -1;
//     }
//     return temp;
// };
// export const GeneratePassword3Char = () => {
//     var plength = 3;
//     var keylist = new Array(
//         'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
//         'abcdefghijklmnopqrstuvwxyz',
//         '1234567890',
//         'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
//         '-!#$%^&*?_~()',
//     );
//     var temp = '';
//     var count = 0;
//     var i = 0,
//         //Math.floor(Math.random() * 3),
//         j = 0;
//     for (; i < 3; i++) {
//         if (i == 0) {
//             for (j = 0; j < plength - 2; j++) temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         } else temp += keylist[i].charAt(Math.floor(Math.random() * keylist[i]?.length));
//         count++;
//         if (count == 3) break;
//         else if (i == 2 && count < 3) i = -1;
//     }
//     return temp;
// };
