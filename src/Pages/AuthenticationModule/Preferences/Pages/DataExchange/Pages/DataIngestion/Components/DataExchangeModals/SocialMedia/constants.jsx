const loadFbImages = () =>
    Promise.all([
        import('./Images/fb/fb1.jpg'),
        import('./Images/fb/fb2.jpg'),
        import('./Images/fb/fb3.jpg'),
        import('./Images/fb/fb4.jpg'),
        import('./Images/fb/fb5.jpg'),
    ]).then((modules) => modules.map((module) => module.default));

const loadTwitterImages = () =>
    Promise.all([import('./Images/twitter1.jpg'), import('./Images/twitter2.jpg')]).then((modules) =>
        modules.map((module) => module.default),
    );

const loadLinkedInImages = () =>
    Promise.all([import('./Images/linkedin1.jpg'), import('./Images/linkedin2.jpg')]).then((modules) =>
        modules.map((module) => module.default),
    );

const loadGoogleImages = () =>
    Promise.all([import('./Images/google-login1.jpg'), import('./Images/google-login2.jpg')]).then((modules) =>
        modules.map((module) => module.default),
    );

const loadInstagramImages = () => import('./Images/login-instagram.jpg').then((module) => [module.default]);

const loadPinterestImages = () => import('./Images/login-pinterest.jpg').then((module) => [module.default]);

const loadYoutubeImages = () => import('./Images/logo-youtube.jpg').then((module) => [module.default]);

export const getImage = async (img) => {
    if (img === 'Facebook app' || img === 'facebook' || img === 'Facebook' || img === 'facebook exchange') {
        return loadFbImages();
    }
    if (
        img === 'ads data hub' ||
        img === 'display & video 360' ||
        img === 'google ads' ||
        img === 'search ads' ||
        img === 'google ads manager'
    ) {
        return loadGoogleImages();
    }
    if (img === 'twitter') return loadTwitterImages();
    if (img === 'pinterest') return loadPinterestImages();
    if (img === 'instagram') return loadInstagramImages();
    if (img === 'youtube') return loadYoutubeImages();
    if (img === 'linkedin') return loadLinkedInImages();
};
