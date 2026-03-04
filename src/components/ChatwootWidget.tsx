'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        chatwootSettings: any;
        chatwootSDK: any;
    }
}

const ChatwootWidget = () => {
    useEffect(() => {
        window.chatwootSettings = {
            hideMessageBubble: false,
            position: 'right',
            locale: 'es',
            type: 'standard',
        };

        (function (d, t) {
            var BASE_URL = "https://chatp.mrvargas.co";
            var g = d.createElement(t) as HTMLScriptElement, s = d.getElementsByTagName(t)[0];
            g.src = BASE_URL + "/packets/js/sdk.js";
            g.defer = true;
            g.async = true;
            s.parentNode?.insertBefore(g, s);
            g.onload = function () {
                window.chatwootSDK.run({
                    websiteToken: 'i3Qm7GeCZAfyLQE8vW2uPab4',
                    baseUrl: BASE_URL
                })
            }
        })(document, "script");
    }, []);

    return null;
};

export default ChatwootWidget;
