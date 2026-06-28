export function handleCSSLoad(cssPath) {
    const existingLink = document.getElementById('dynamic-css');
    if (existingLink) {
        // Remove the existing link if already loaded
        existingLink.parentNode?.removeChild(existingLink);
    }

    if (cssPath) {
        const link = document.createElement('link');
        link.id = 'dynamic-css';
        link.rel = 'stylesheet';
        link.href = cssPath; // Path to your CSS file in `node_modules`
        link.type = 'text/css';
        document.head.appendChild(link);
    }
}
export function handleCSSUnload() {
    const link = document.getElementById('dynamic-css');
    if (link) {
        link.parentNode?.removeChild(link);
    }
}

export function reenableGenieDisabledStyles() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-genie-disabled="true"]').forEach((el) => {
        try {
            el.disabled = false;
        } catch {
            /* ignore */
        }
        if (el.dataset) delete el.dataset.genieDisabled;
    });
}

export function whenHostStylesheetsApplied(callback, timeoutMs = 800) {
    if (typeof document === 'undefined') {
        callback();
        return () => {};
    }
    let done = false;
    let raf = 0;
    let timer = 0;
    const finish = () => {
        if (done) return;
        done = true;
        if (raf) cancelAnimationFrame(raf);
        if (timer) clearTimeout(timer);
        callback();
    };
    const allApplied = () => {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of links) {
            if (link.disabled) continue;
            let sameOrigin = false;
            try {
                sameOrigin = new URL(link.href, window.location.href).origin === window.location.origin;
            } catch {
                sameOrigin = false;
            }
            if (sameOrigin && !link.sheet) return false;
        }
        return true;
    };
    const tick = () => {
        if (allApplied()) finish();
        else raf = requestAnimationFrame(tick);
    };
    timer = window.setTimeout(finish, timeoutMs);
    raf = requestAnimationFrame(tick);
    return finish;
}
