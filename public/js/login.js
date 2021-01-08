const login =  (email, password) => {
     axios
        .post('http://127.0.0.1:8001/api/v1/auth/signin', {email, password})
         .then(({data}) => {
            alert('Login Success')
             setTimeout(() => {
                 location.assign('/')
             }, 1500)
         })
         .catch((err) =>  {
             alert(err.response.data.message)
         })

};



document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
});