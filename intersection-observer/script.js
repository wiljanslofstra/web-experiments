/** @type {Function} Transform NodeList into an array */
const nodelistToArray = list => Array.prototype.slice.call(list);

const panelOne = document.getElementById('panel-one');
const panelTwo = document.getElementById('panel-two');
const panelThree = document.getElementById('panel-three');
const circles = nodelistToArray(document.querySelectorAll('.js-circle'));
const lazyImages = nodelistToArray(document.querySelectorAll('.js-lazy-img'));

/** @type {Number} Offset in pixels before the lazy load images to trigger */
const LAZY_LOAD_OFFSET = 300;

/**
 * Find the closest threshold. The intersection observer will return a value
 * like 0.7423901, but I need the threshold like 0.75
 * @param {Number} perc Percentage value
 * @param {Array} thresholds Array of thresholds
 * @return {Number} Closest threshold
 */
function findClosestThreshold(perc, thresholds) {
    let diff = Infinity;
    let chosenThreshold;

    // Loop through all given threshold
    thresholds.forEach((threshold) => {
        // Calculate the difference between the threshold and our percentage value
        const diffToThreshold = Math.abs(threshold - perc);

        if (diffToThreshold < diff) {
            // Save the closest difference
            diff = diffToThreshold;

            // Save the threshold that was closest
            chosenThreshold = threshold;
        }
    });

    // Return the closest threshold
    return chosenThreshold;
}

/**
 * Create a observers for our circles
 * @param {Array} circles
 * @param {Function} Callback that resolves when the observer has been hit
 * @return {Void}
 */
function createCircleObserver(circles, cb) {
    // Observer for the circles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio <= 0) return;

            // Resolve the Promise in order to make visual changes
            cb(entry.target);

            // Disable the observer for the hit element
            observer.unobserve(entry.target);
        });
    }, {
        threshold: [0.5],
    });

    circles.forEach((circle) => {
        // Add the circle to the observer
        observer.observe(circle);
    });
}

/**
 * Create a observers for our circles
 * @param {Array} circles
 * @param {Number} offset
 * @param {Function} Callback that resolves when the observer has been hit
 * @return {Void}
 */
function createLazyLoadObserver(images, offset, cb) {
    // Observer for the images
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio <= 0) return;

            // Resolve the Promise in order to make visual changes
            cb(entry.target);

            // Disable the observer for the hit element
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: `${offset}px 0px ${offset}px 0px`,
    });

    images.forEach((image) => {
        // Add the image to the observer
        observer.observe(image);
    });
}

/**
 * Create observer that will watch the panels
 * @return {Void}
 */
function createPanelObserver() {
    const thresholds = [0.25, 0.5, 0.75, 0.99];

    // Observe the panels
    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio <= 0) return;

            // The threshold that was hit (e.g. 0.75)
            const threshold = findClosestThreshold(entry.intersectionRatio, thresholds);

            // Show which element has been hit
            notify(`Hit element: ${entry.target.id} at location: ${threshold}`);
        });
    }, {
        threshold: thresholds,
    });

    panelObserver.observe(panelTwo);
}

/**
 * Create IntersectionObservers
 * @return {Void}
 */
function createObservers() {
    createCircleObserver(circles, (entry) => {
        entry.classList.add('is-hit');
    });

    createLazyLoadObserver(lazyImages, LAZY_LOAD_OFFSET, (img) => {
        img.setAttribute('src', img.getAttribute('data-src'));
    });
    
    createPanelObserver();
}

createObservers();
