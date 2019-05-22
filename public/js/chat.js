const socket = io();

const $messageForm  = document.querySelector('form');
const $messageInput = document.getElementById('message');
const $button       = document.querySelector('button');
const $location     = document.getElementById('send-location');
const $messages     = document.getElementById('messages');

// templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    };
};

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    });
    document.getElementById('sidebar').innerHTML = html;
});

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //disable form when sending location
    $button.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        // enable form
        $button.removeAttribute('disabled');
        
        // clear message form
        $messageInput.value = '';
        $messageInput.focus();

        if(error) {
           return console.log(error)
        };

        console.log('The message was sent');
    });
});

$location.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $location.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position => {
        const{latitude, longitude} = position.coords;
        console.log(latitude, longitude);
        socket.emit('sendLocation', latitude, longitude, () => {
            $location.removeAttribute('disabled');
            console.log('Your location was shared');
        });
    });
});

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
})