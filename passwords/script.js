let userPassword = 'wordpass';

// Function to set the user's master password
async function setUserPassword(password) {
    userPassword = password;
}

// Function to derive a cryptographic key from the user's password
async function getKey(salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(userPassword),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000, // Higher iterations = more secure
            hash: "SHA-256"
        },
        key,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );
}

// Function to encrypt data
async function encryptData(data) {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
    const key = await getKey(salt);
    const encoded = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoded
    );

    return {
        iv: Array.from(iv),
        salt: Array.from(salt),
        data: Array.from(new Uint8Array(encrypted))
    };
}

// Function to decrypt data
async function decryptData(encrypted) {
    const salt = new Uint8Array(encrypted.salt);
    const key = await getKey(salt);
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

// Event listener for form submission
document.getElementById('passwordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const site = document.getElementById('site').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const encryptedPassword = await encryptData(password);
    
    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];
    passwords.push({ site, username, password: encryptedPassword });
    localStorage.setItem('passwords', JSON.stringify(passwords));

    document.getElementById('passwordForm').reset();
    await displayPasswords();
});

// Function to display stored passwords
async function displayPasswords() {
    const passwordList = document.getElementById('passwordList');
    passwordList.innerHTML = '';

    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];

    for (const item of passwords) {
        const decryptedPassword = await decryptData(item.password);
        const li = document.createElement('li');
        li.textContent = `${item.site} - ${item.username} - ${decryptedPassword}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deletePassword(passwords.indexOf(item));
        });
        li.appendChild(deleteBtn);
        passwordList.appendChild(li);
    }
}

// Function to delete a password entry
async function deletePassword(index) {
    const passwords = JSON.parse(localStorage.getItem('passwords'));
    passwords.splice(index, 1);
    localStorage.setItem('passwords', JSON.stringify(passwords));
    await displayPasswords();
}

// Prompt the user for their master password on load
async function init() {
    const passwordPrompt = prompt("Enter a master password:");
    if (passwordPrompt) {
        await setUserPassword(passwordPrompt);
        await displayPasswords();
    }
}

// Initialize the application
init();
