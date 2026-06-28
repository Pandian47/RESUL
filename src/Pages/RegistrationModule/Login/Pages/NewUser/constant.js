// REGISTRATION

export const ERROR_MESSAGE_INITIALSTATE = {
    email: null,
    answer: null,
    agree: null,
};

export const getRandomNumber = () => {
    const number = Math.floor(Math.random() * 9 + 1);
    return number;
};
