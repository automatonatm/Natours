const login = (email, password) => {
    console.log(email, password)
}

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)

});