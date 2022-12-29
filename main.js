import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
let my_id = null;
let chat_rooms = [];

const show_chat = function (me, peer) {
    const chatroom_element = document.getElementsByClassName('message-window')[0];


    const render_chats = function () {

        const chatroom = chat_rooms.find(chatroom => chatroom.peer === peer.username);
        chatroom_element.getElementsByClassName('message-body')[0].innerHTML = '';


        chatroom.chat.forEach(chat => {
            const message = document.createElement('div');
            if (chat.type === 'sent') {
                message.classList.add('message-sent');
                const message_sent_text = document.createElement('div');
                message_sent_text.classList.add('message-sent__text');
                const message_sent_text_p = document.createElement('p');
                message_sent_text_p.innerText = chat.message;
                message_sent_text.appendChild(message_sent_text_p);
                message.appendChild(message_sent_text);
                const message_sent_avatar = document.createElement('div');
                message_sent_avatar.classList.add('message-sent__avatar');
                const message_sent_avatar_img = document.createElement('img');
                message_sent_avatar_img.src = "https://i.pravatar.cc/150?img=1";
                message_sent_avatar_img.alt = '';
                message_sent_avatar.appendChild(message_sent_avatar_img);
                message.appendChild(message_sent_avatar);
            } else {
                message.classList.add('message-recieved');
                const message_recieved_avatar = document.createElement('div');
                message_recieved_avatar.classList.add('message-recieved__avatar');
                const message_recieved_avatar_img = document.createElement('img');
                message_recieved_avatar_img.src = peer.pfp;
                message_recieved_avatar_img.alt = '';
                message_recieved_avatar.appendChild(message_recieved_avatar_img);
                message.appendChild(message_recieved_avatar);
                const message_recieved_text = document.createElement('div');
                message_recieved_text.classList.add('message-recieved__text');
                const message_recieved_text_p = document.createElement('p');
                message_recieved_text_p.innerText = chat.message;
                message_recieved_text.appendChild(message_recieved_text_p);
                message.appendChild(message_recieved_text);
            }
            chatroom_element.getElementsByClassName('message-body')[0].appendChild(message);
        });
    }

    const chatrefresh = setInterval(render_chats, 50);

    //set topbar__avatar 
    chatroom_element.getElementsByClassName('topbar__avatar')[0].getElementsByTagName('img')[0].src = peer.pfp;
    chatroom_element.getElementsByClassName('topbar__avatar')[0].getElementsByTagName('img')[0].alt = peer.username;

    //set topbar__name
    chatroom_element.getElementsByClassName('topbar__name')[0].getElementsByTagName('h3')[0].innerText = peer.username;
    chatroom_element.getElementsByClassName('topbar__name')[0].getElementsByTagName('p')[0].innerHTML = `Status: <span>${peer.status}<span>`;


    const send_message = function (event) {
        event.preventDefault();
        const message = chatroom_element.getElementsByClassName('bottombar__input')[0].value;
        if (message === '') {
            return;
        }
        const chatroom = chat_rooms.find(chatroom => chatroom.peer === peer.username);
        chatroom.chat.push({
            type: 'sent',
            message
        });
        send_message_to_peer(me, peer.connection_id, message);
        chatroom_element.getElementsByClassName('bottombar__input')[0].value = '';
    }

    const send_button = chatroom_element.getElementsByClassName('bottombar__send')[0]
    send_button.addEventListener('click', send_message);
    chatroom_element.getElementsByClassName('topbar__close')[0].addEventListener('click', event => {
        document.getElementsByClassName('message-window-backdrop')[0].style.display = 'none';
        clearInterval(chatrefresh);
        send_button.removeEventListener('click', send_message);
    });
    console.log(chat_rooms);

    document.getElementsByClassName('message-window-backdrop')[0].style.display = 'block';




}

document.querySelectorAll('.login-signup-toggle').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        loginForm.classList.toggle('hide');
        signupForm.classList.toggle('hide');
    })
})



const render_active_peers = function (me, peers) {

    document.getElementsByClassName('user-list')[0].innerHTML = '';


    peers.forEach(peer => {


        const user_card = document.createElement('div');
        user_card.classList.add('user-card');

        const user_card_avatar = document.createElement('div');
        user_card_avatar.classList.add('user-card__avatar');

        const user_card_avatar_img = document.createElement('img');
        user_card_avatar_img.src = peer.pfp;
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
        user_card_name_button.addEventListener('click', event => {
            show_chat(me, peer);
        });

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
        return;
    }
    document.getElementsByClassName('login-signup')[0].style.display = 'none';
    document.getElementsByClassName("app")[0].classList.toggle('hide');

    const me = new Peer();

    me.on('open', id => {
        my_id = id;
        console.log('My peer ID is: ' + id);
        const socket = io.connect('http://singapore.tisfrank.games:3002', {
            query: {
                token,
                id
            }
        })
    });

    me.on('connection', conn => {
        conn.on('open', () => {
            // Receive messages
            conn.on('data', data => {
                const chatroom = chat_rooms.find(chatroom => chatroom.peer_id === data.from);
                chatroom.chat.push({
                    type: 'received',
                    message: data.message
                });
            }
            );

        });

    });

    const peer_sync = async function () {
        try {
            const active_peers = await get_active_peers();
            render_active_peers(me, active_peers);
        } catch (err) {
            console.log(err);
            return;
        }
        setTimeout(peer_sync, 1500);
    }
    peer_sync();

}



const login = function (event) {
    event.preventDefault();
    const username = document.querySelector('.login-form input[name="username"]').value;
    const password = document.querySelector('.login-form input[name="password"]').value;

    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    const data = {
        id: username,
        password
    }

    const login_endpoint = "http://singapore.tisfrank.games:3002/user/login";

    try {
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
    catch (err) {
        console.error(err);
        alert("Error while logging in", err);
    }



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

    try {
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
    } catch (err) {
        alert("Error while signing up", err);
    }

}



const get_active_peers = async function () {
    const token = localStorage.getItem('token');
    const all_users_endpoint = "http://singapore.tisfrank.games:3002/user/";
    let all_users = [];
    try {
        const response = await fetch(all_users_endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!data.error) {
            all_users = data;
        }
    }
    catch (err) {
        console.error(err);
        alert("Error while getting all users", err);
        return;
    }
    all_users.peers.forEach(peer => {

        if (chat_rooms.find(room => room.peer == peer.username) == undefined) {
            chat_rooms.push({
                peer: peer.username,
                peer_id: peer.connection_id,
                chat: []
            })
        } else {
            const chatroom = chat_rooms.find(room => room.peer == peer.username);
            chatroom.peer_id = peer.connection_id;

        }

    });
    return all_users.peers;
}




document.querySelectorAll('.signup-form button').forEach(item => {
    item.addEventListener('click', signup)
})

const close_message_window = function () {
    document.getElementsByClassName('message-window-backdrop')[0].classList.toggle('hide');
}



const send_message_to_peer = function (me, peer_id, message) {
    const data = { from: my_id, message }
    const conn = me.connect(peer_id);
    conn.on('open', () => {
        conn.send(data);
    });
}



window.onload = function () {
    initialize_app().then(() => {
        console.info('App initialized');
    })
        .catch(err => {
            console.error(err);
        });
}