const email = document.getElementById('email');
const password = document.getElementById('password');
const btn = document.getElementById('loginBtn');
const eye = document.getElementById('eye');

function checkInput() {
    if (email.value.trim() !== '' && password.value.trim() !== '') {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}

email.addEventListener('input', checkInput);
password.addEventListener('input', checkInput);

eye.addEventListener('click', function () {
    if (password.type === 'password') {
        password.type = 'text';
        eye.textContent = '🙈';
    } else {
        password.type = 'password';
        eye.textContent = '👁';
    }
});