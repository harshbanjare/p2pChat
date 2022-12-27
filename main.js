const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

document.querySelectorAll('.login-signup-toggle').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        loginForm.classList.toggle('hide');
        signupForm.classList.toggle('hide');
    })
})


const get_active_peers = async function () {
    const placeholder_peers = [
        { username: 'alex', status: 'online', connection_id: '123' },
        { username: 'lily', status: 'online', connection_id: '123' },
        { username: 'sherlock', status: 'online', connection_id: '123' },
    ];
    return placeholder_peers;
}

const render_active_peers = function (peers) {
    /* 
     <div class="user-card">
     <div class="user-card__avatar">
         <img src="https://i.pravatar.cc/150?img=1" alt="">
     </div>
     <div class="user-card__name">
         <h3>Jane Doe</h3>
         <p>status: <span>online</span></p>
         <button>Connect And Chat</button>
     </div>
 </div>
     */
    peers.forEach(peer => {
        const user_card = document.createElement('div');
        user_card.classList.add('user-card');

        const user_card_avatar = document.createElement('div');
        user_card_avatar.classList.add('user-card__avatar');

        const user_card_avatar_img = document.createElement('img');
        user_card_avatar_img.src = 'https://i.pravatar.cc/150?img=1';
        user_card_avatar_img.alt = '';

        user_card_avatar.appendChild(user_card_avatar_img);

        const user_card_name = document.createElement('div');
        user_card_name.classList.add('user-card__name');

        const user_card_name_h3 = document.createElement('h3');
        user_card_name_h3.innerText = peer.username;

        const user_card_name_p = document.createElement('p');
        user_card_name_p.innerHTML = `status: <span>${peer.status}<span>`;

        const user_card_name_button = document.createElement('button');
        user_card_name_button.innerText = 'Connect And Chat';

        user_card_name.appendChild(user_card_name_h3);
        user_card_name.appendChild(user_card_name_p);
        user_card_name.appendChild(user_card_name_button);

        user_card.appendChild(user_card_avatar);
        user_card.appendChild(user_card_name);

        document.getElementsByClassName('user-list')[0].appendChild(user_card);
    });

}

const initialize_app = async function () {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementsByClassName('login-signup')[0].style.display = 'block';
    }

    document.getElementsByClassName("app")[0].classList.toggle('hide');
    const active_peers = await get_active_peers();
    render_active_peers(active_peers);

}
const login = function (event) {
    event.preventDefault();
    const username = document.querySelector('.login-form input[name="username"]').value;
    const password = document.querySelector('.login-form input[name="password"]').value;
    const data = {
        id: username,
        password
    }

    const login_endpoint = "http://singapore.tisfrank.games:3002/user/login";

    fetch(login_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message == "login success") {
                localStorage.setItem('token', data.token);
                document.getElementsByClassName('login-signup')[0].style.display = 'none';

                initialize_app().then(() => {
                    console.log('App initialized');
                })
                    .catch(err => {
                        console.error(err);
                    });
            }
            else {
                alert("Error while logging in", data.error);
            }
        })



}

document.querySelectorAll('.login-form button').forEach(item => {
    item.addEventListener('click', login)
})

const signup = function (event) {
    event.preventDefault();
    const username = document.querySelector('.signup-form input[name="username"]').value;
    const password = document.querySelector('.signup-form input[name="password"]').value;

    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    const data = {
        username,
        password
    }

    const singup_endpoint = "http://singapore.tisfrank.games:3002/user/create";

    fetch(singup_endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message == "user created successfully") {
                signupForm.classList.toggle('hide');
                loginForm.classList.toggle('hide');
            }
            else {
                alert("Error while signing up: ", data);
            }
        })


}

document.querySelectorAll('.signup-form button').forEach(item => {
    item.addEventListener('click', signup)
})



const close_message_window = function () {
    document.getElementsByClassName('message-window-backdrop')[0].classList.toggle('hide');
}
