function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

function loadAudio(url) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
        audio.src = url;
        audio.load();
    });
}

function loadResources(urls) {
    const tasks = urls.map(url => {
        if (url.match(/\.(opus|flac|mp3|wav|ogg)$/i)) {
            return loadAudio(url);
        } else {
            return loadImage(url);
        }
    });
    return Promise.allSettled(tasks).then(results => {
        const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
        if (errors.length) {
            console.warn('Some resources failed to load:', errors);
        }
        return results;
    });
}