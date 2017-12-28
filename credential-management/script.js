(function() {
    if (!'credentials' in navigator) {
        return;
    }
    
    const AUTO_SUBMIT = false;

    const form = document.getElementById('auth-form');
    const facebookLogin = document.getElementById('facebook-login');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    // Check if necessary element are available on the page
    if (!form || !emailField || !passwordField) {
        return;
    }

    const credentials = navigator.credentials;

    /**
     * Get the available credentials
     * @return {void}
     */
    async function getCredentials() {
        credentials.get({
            password: true,
            federated: { // Obtain federation credentials or not
                providers: [  // Specify an array of IdP strings
                    'https://accounts.google.com',
                ]
            },
            mediation: 'optional',
        }).then((cred) => {
            console.log(cred);
            if (cred) {
                if (cred.type === 'password') {
                    emailField.value = cred.id;
                    passwordField.value = cred.password;

                    if (AUTO_SUBMIT) {
                        form.submit();
                    }

                    return;
                }

                console.log(cred);
            }
        });
    }

    /**
     * Create credentials after form submission
     * @param {string} id ID for the credentials object (email or username)
     * @param {string} password Password
     * @return {Promise}
     */
    async function createPasswordCredentials(id, password) {
        const cred = new PasswordCredential({
            id,
            password,
        });
    
        return credentials.store(cred);
    }

    function makeFederatedCredentials() {
        // Create `Credential` object for federation
        var cred = new FederatedCredential({
            id: profile.email,
            name: profile.name,
            iconURL: profile.imageUrl,
            provider: GOOGLE_SIGNIN,
        });
        // Store credential information after successful authentication
        navigator.credentials.store(cred);
    }

    // Listen for form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Create credentials
        createPasswordCredentials(emailField.value, passwordField.value);
    });

    facebookLogin.addEventListener('click', () => {
        makeFederatedCredentials();
    });

    // Try signing in if credentials are available
    getCredentials();
})();
