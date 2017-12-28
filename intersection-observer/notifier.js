/** @type {DOMNode} Element to show the notification in */
const notifier = document.getElementById('notifier');

/** @type {number} How long to wait before hiding the notification (ms) */
const NOTIFY_TIMEOUT = 3000;

/** @type {function} Will hold the timeout */
let notifyTimeout;

/**
 * Simple notify function that displays a text into a toast like window
 * @param {string} msg Message to display
 * @return {void}
 */
function notify(msg) {
    notifier.textContent = msg;
    notifier.style.display = 'block';

    clearTimeout(notifyTimeout);

    notifyTimeout = setTimeout(() => {
        notifier.style.display = 'none';
    }, NOTIFY_TIMEOUT);
}