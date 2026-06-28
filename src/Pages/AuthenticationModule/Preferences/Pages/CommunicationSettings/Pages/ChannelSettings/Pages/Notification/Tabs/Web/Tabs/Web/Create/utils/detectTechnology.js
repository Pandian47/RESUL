/**
 * Website Technology Detection Utility
 * Detects frameworks by analyzing HTML content for framework-specific markers
 */

/**
 * URL pattern-based detection for instant identification
 */
const URL_PATTERNS = [
    { pattern: /\.myshopify\.com/i, technology: 'Shopify' },
    { pattern: /\.wixsite\.com/i, technology: 'Wix' },
    { pattern: /\.squarespace\.com/i, technology: 'Squarespace' },
    { pattern: /\.webflow\.io/i, technology: 'Webflow' },
    { pattern: /\.wordpress\.com/i, technology: 'WordPress' },
    { pattern: /\.netlify\.app/i, technology: 'Gatsby' },
    { pattern: /\.vercel\.app/i, technology: 'Next.js' },
    { pattern: /\.github\.io/i, technology: 'Jekyll' },
];

/**
 * Framework detection rules based on HTML markers
 * Mirrors the browser-based detection function provided
 */
const FRAMEWORK_MARKERS = {
    'React': [
        /__REACT_DEVTOOLS_GLOBAL_HOOK__/,
        /data-reactroot/i,
        /data-reactid/i,
        /_react/i,
        /react\.production\.min\.js/i,
        /react-dom/i,
    ],
    'Angular': [
        /ng-version/i,
        /\[ng-version\]/i,
        /ng-app/i,
        /ng-controller/i,
        /<app-root/i,
        /window\.ng/,
        /angular\.js/i,
        /angular\.min\.js/i,
    ],
    'Vue': [
        /__VUE__/,
        /data-v-[a-f0-9]/i,
        /vue\.js/i,
        /vue\.min\.js/i,
        /window\.Vue/,
    ],
    'Svelte': [
        /data-sveltekit-hydrate/i,
        /data-svelte-h/i,
        /svelte/i,
    ],
    'Next.js': [
        /__NEXT_DATA__/,
        /<script[^>]*id="__NEXT_DATA__"/i,
        /_next\/static/i,
        /next\.js/i,
    ],
    'Nuxt.js': [
        /__NUXT__/,
        /window\.__NUXT__/,
        /_nuxt\//i,
    ],
    'jQuery': [
        /window\.jQuery/,
        /jquery\.js/i,
        /jquery\.min\.js/i,
        /jquery-[\d.]+\.js/i,
    ],
    'Gatsby': [
        /___gatsby/i,
        /gatsby-/i,
    ],
    'WordPress': [
        /wp-content/i,
        /wp-includes/i,
        /wordpress/i,
    ],
    'Shopify': [
        /shopify/i,
        /cdn\.shopify\.com/i,
    ],
};

/**
 * Detects technology from URL pattern
 */
const detectFromUrlPattern = (url, domainFlavourList) => {
    if (!url || !domainFlavourList) return null;

    const urlLower = url.toLowerCase();

    for (const rule of URL_PATTERNS) {
        if (rule.pattern.test(urlLower)) {
            const matched = domainFlavourList.find(
                (flavor) => flavor.name.toLowerCase() === rule.technology.toLowerCase()
            );
            if (matched) {
                                return matched;
            }
        }
    }

    return null;
};

/**
 * Fetches HTML content using CORS proxy
 */
const fetchHTML = async (url) => {
    const corsProxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const proxyUrl of corsProxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(proxyUrl, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const html = await response.text();
                                return html;
            }
        } catch (error) {
            continue;
        }
    }

    return null;
};

/**
 * Analyzes HTML content to detect frameworks
 * Based on the detectFramework function provided
 */
const analyzeHTML = (html) => {
    if (!html) return [];

    const detectedTechnologies = [];

    // Check each framework's markers
    Object.entries(FRAMEWORK_MARKERS).forEach(([framework, markers]) => {
        let matchCount = 0;

        for (const marker of markers) {
            if (marker.test(html)) {
                matchCount++;
            }
        }

        // If at least one marker found, consider it detected
        if (matchCount > 0) {
            detectedTechnologies.push({
                name: framework,
                confidence: matchCount,
            });
        }
    });

    // Sort by confidence (most matches first)
    detectedTechnologies.sort((a, b) => b.confidence - a.confidence);

    return detectedTechnologies;
};

/**
 * Maps framework names to domainFlavour names
 * React and Angular should map to JavaScript
 */
const mapFrameworkToDomainFlavour = (frameworkName) => {
    const frameworkLower = frameworkName.toLowerCase();
    
    // Map React and Angular to JavaScript
    if (frameworkLower === 'react' || frameworkLower === 'angular') {
        return 'JavaScript';
    }
    
    // Return original name for other frameworks
    return frameworkName;
};

/**
 * Detects technology from HTML analysis
 */
const detectFromHTML = async (url, domainFlavourList) => {
    try {
        
        const html = await fetchHTML(url);
        if (!html) {
                        return null;
        }

        const detected = analyzeHTML(html);

        if (detected.length > 0) {
            const topMatch = detected[0];
            
            if (detected.length > 1) {
                            }

            // Map framework name to domainFlavour name (React/Angular -> JavaScript)
            const mappedName = mapFrameworkToDomainFlavour(topMatch.name);
            
            // Find in domain flavour list using mapped name
            const matched = domainFlavourList.find(
                (flavor) => flavor.name.toLowerCase() === mappedName.toLowerCase()
            );

            if (matched) {
                            }

            return matched || null;
        }

                return null;

    } catch (error) {
        return null;
    }
};

/**
 * Main detection function - combines URL and HTML analysis
 */
const detectTechnology = async (url, domainFlavourList) => {
    if (!url || !domainFlavourList) {
        return null;
    }

    
    // Step 1: Quick URL pattern check
    const urlResult = detectFromUrlPattern(url, domainFlavourList);
    if (urlResult) {
        return urlResult;
    }

    // Step 2: HTML analysis
    // const htmlResult = await detectFromHTML(url, domainFlavourList);
    // if (htmlResult) {
    //     return htmlResult;
    // }

        return null;
};

export default detectTechnology;
export { detectFromUrlPattern, detectFromHTML, analyzeHTML };
