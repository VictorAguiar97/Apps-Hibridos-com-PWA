'use client'

import { useEffect } from "react";

const RegisterServiceWorker = () => {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log("Service Worker registrado SUCESSIVAMENTE: ")
                    console.log(registration);
                })
                .catch((error) => {
                    console.error("Falha em registrar o Service Worker: ");
                    console.log(error);
                })
        }
    }, []);

    return null;
}

export default RegisterServiceWorker;