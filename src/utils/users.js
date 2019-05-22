const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room) {
        console.log('fired');
        return {
            error: 'username and room are required'
        };
    };

    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    });

    if(existingUser) {
        return {
            error: 'Username is in use'
        };
    };

    const user = {id, username, room};
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex(e => e.id === id);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const index = users.findIndex(e => e.id === id)
    if(index === -1) {
        return 'User not found'
    };
    return users[index];
};

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter(e => e.room === room);
    if(usersInRoom.length < 1) {
        return 'No users currently in room'
    };
    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}