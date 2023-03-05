```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design
```

let data = {
    users: [{
        email: 'foo@bar.com',
        password: 'strongPasWoRd',
        nameFirst: 'John',
        nameLast: 'Doe',
        id: 1,
        handle: 'johndoe',
        globalPersmissions: 1
    }],
    channels: [{
        channelId: 1,
        name: 'cool channel name',
        authUserId: 1,
        userIds: [1, 2, 4],
        isPublic: true,
        messages: [{
            messageId: 0,
            uId: 1,
            message: 'bruh moment',
            timeSent: 1234653173125
        }]
    }]
};