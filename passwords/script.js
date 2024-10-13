document.getElementById('passwordForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const site = document.getElementById('site').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];

    passwords.push({ site, username, password });
    localStorage.setItem('passwords', JSON.stringify(passwords));

    document.getElementById('passwordForm').reset();
    displayPasswords();
});

function displayPasswords() {
    const passwordList = document.getElementById('passwordList');
    passwordList.innerHTML = '';

    const passwords = JSON.parse(localStorage.getItem('passwords')) || [];

    passwords.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.site} - ${item.username}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            deletePassword(index);
        });
        li.appendChild(deleteBtn);
        passwordList.appendChild(li);
    });
}

function deletePassword(index) {
    const passwords = JSON.parse(localStorage.getItem('passwords'));
    passwords.splice(index, 1);
    localStorage.setItem('passwords', JSON.stringify(passwords));
    displayPasswords();
}

// Display passwords on initial load
displayPasswords();
