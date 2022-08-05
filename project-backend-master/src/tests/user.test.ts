import { authRegisterV1 } from "../auth";
import { clearV1 } from '../other';
import { userProfileV1 } from '../users';
import request from 'sync-request';
import config from '../config.json';
import { requestAuthRegisterV3, requestChannelsCreateV3, requestClearV1, requestDmCreateV1, requestMessageSenddmV2, requestMessageSendV2 } from "./testFunctions";

const OK = 200;
const port = config.port;
const url = config.url;

request(
    'DELETE',
    `${url}:${port}/clear/v1`,
)

const yes = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
        body: JSON.stringify({
            email: 'tea@bar.com',
            password: 'password',
            nameFirst: 'Jane',
            nameLast: 'Smith'
        }),
        headers: {'Content-type': 'application/json'}
    }
);

const token2 = JSON.parse(String(yes.getBody())).token;

const res = request(
    'POST', 
    `${url}:${port}/auth/register/v3`,
    {
        body: JSON.stringify({
            email: 'foo@bar.com',
            password: 'Password',
            nameFirst: 'John',
            nameLast: 'Doe'
            }),
        headers: {'Content-type': 'application/json'}
    }
);

const token3 = JSON.parse(String(res.getBody())).token;

const pro = request(
    'POST', 
    `${url}:${port}/auth/register/v3`,
    {
        body: JSON.stringify({
            email: 'sea@bar.com',
            password: 'Password',
            nameFirst: 'Steven',
            nameLast: 'Alex'
            }),
        headers: {'Content-type': 'application/json'}
    }
    );
const token4 = JSON.parse(String(pro.getBody())).token;

describe('Tests for the user/profile/v2', () => {
    test('successful output', () => {
        const res = request(
            'GET',
            `${url}:${port}/user/profile/v3`,
            {
                qs: {
                    uId: '1'   
                },
                headers: {
                    token: token2
                }
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(OK);
        expect(bodyObj.user).toStrictEqual({
            uId: 1,
            email: 'tea@bar.com',
            nameFirst: 'Jane',
            nameLast: 'Smith',
            handleStr: 'janesmith',
            profileImgUrl: expect.any(String)
        });
    })
});

describe('Tests for the user/profile/v2', () => {
    test('successful output', () => {
        const res = request(
            'GET',
            `${url}:${port}/user/profile/v3`,
            {
                qs: {
                    uId: '1'   
                },
                headers: {
                    token: token2 
                }
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(OK);
        expect(bodyObj.user).toStrictEqual({
            uId: 1,
            email: 'tea@bar.com',
            nameFirst: 'Jane',
            nameLast: 'Smith',
            handleStr: 'janesmith',
            profileImgUrl: expect.any(String)
        });
    })
});

describe('Tests for the user/profile/v2 for invalid', () => {
    test('successful output', () => {
        const res = request(
            'GET',
            `${url}:${port}/user/profile/v3`,
            {
                qs: {
                    uId: -100   
                },
                headers: {
                    token: "-110",
                }

            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    })
});
describe('Tests for the /users/all/v2', () => {
    test('successful output', () => {
        const res = request(
            'GET',
            `${url}:${port}/users/all/v2`,
            {
                headers: {
                    token: token3
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({users: [
            {email: "tea@bar.com", handleStr: "janesmith", uId: 1, nameFirst: "Jane", nameLast: "Smith", profileImgUrl: expect.any(String)}, 
            {email: "foo@bar.com", handleStr: "johndoe", uId: 2, nameFirst: "John", nameLast: "Doe", profileImgUrl: expect.any(String)}, 
            {email: "sea@bar.com", handleStr: "stevenalex", uId: 3, nameFirst: "Steven", nameLast: "Alex", profileImgUrl: expect.any(String)}
        ]});
    });
});

describe('Tests for the user/profile/setname/v2', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setname/v2`,
            {
                json: {
                    nameFirst: 'Bob',
                    nameLast: 'Zhang'  
                },
                headers: {
                    token: token3  
                }
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        //expect(res.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({});
    });

});
describe('Tests for the user/profile/setname/v2 for invalid nameFirst', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setname/v2`,
            {
                json: {
                    nameFirst: 'Bobdasdasdasdsafsadasghdsaghdgajsdhashdghsagdgsahgdasgdhadsadaasdasdasdsadasfdafasdassafdsxzcxz',
                    nameLast: 'Zhang'  
                },
                headers: {
                    token: token3  
                }
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });

});

describe('Tests for the user/profile/setname/v2 for invalid nameLast', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setname/v2`,
            {
                json: {
                    nameFirst: 'Bob',
                    nameLast: ''  
                },
                headers: {
                    token: token3  
                }
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});

describe('Tests for the /user/profile/setemail/v2', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setemail/v2`,
            {
                json: {
                    email: 'asd@bar.com'
                },
                headers: {
                    token: token3  
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        //expect(res.statusCode).toBe(OK);
        expect(bodyObj).toStrictEqual({});
    });
});

describe('Tests for the /user/profile/setemail/v2 for invalid email address', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setemail/v2`,
            {
                json: {
                    email: 'asdvsasda'
                },
                headers: {
                    token: token3  
                }     
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});

describe('Tests for the /user/profile/setemail/v2 for email address has been used', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/setemail/v2`,
            {
                json: {
                    email: 'tea@bar.com'
                },
                headers: {
                    token: token3  
                }           
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});


describe('Tests for the /user/profile/sethandle/v2', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/sethandle/v2`,
            {
                json: {
                    handleStr: "tommyxie"
                },
                headers: {
                    token: token3  
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        //expect(res.statusCode).toBe();
        expect(bodyObj).toStrictEqual({});
    });
});

describe('Tests for the /user/profile/sethandle/v2 for the invalid length of handle', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/sethandle/v2`,
            {
                json: {
                    token: token3, 
                    handleStr: "t"
                },
                headers: {
                    token: token3  
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});

describe('Tests for the /user/profile/sethandle/v2', () => {
    test('successful output', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/sethandle/v2`,
            {
                json: {
                    handleStr: "@##$$%%^"
                },
                headers: {
                    token: token3  
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});

describe('Tests for the /user/profile/sethandle/v2', () => {
    test('error: handle already used', () => {
        const res = request(
            'PUT',
            `${url}:${port}/user/profile/sethandle/v2`,
            {
                json: {
                    handleStr: "janesmith"
                },
                headers: {
                    token: token3  
                }
          
            }
        )
        const bodyObj = JSON.parse(res.body as string);
        expect(res.statusCode).toBe(400);
    });
});


const userStats = (token: string) => {
    const res = request(
        'GET',
        `${url}:${port}/user/stats/v1`,
        {
            headers: {
                'token': token
            }
      
        }
    );
    return res;
}

const usersStats = (token: string) => {
    const res = request(
        'GET',
        `${url}:${port}/users/stats/v1`,
        {
            headers: {
                'token': token
            }
      
        }
    );
    return res;
}

const uploadProfilePhoto = (token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) => {
    const res = request(
        'POST',
        `${url}:${port}/user/profile/uploadphoto/v1`,
        {
            body: JSON.stringify({
                imgUrl: imgUrl,
                xStart: xStart,
                yStart: yStart,
                xEnd: xEnd,
                yEnd: yEnd
            }),
            headers: {
                'Content-type': 'application/json',
                'token': token
            }
        }
    );
    return res;
}


describe('stats tests', () => {
    test('/user/stats/v1 test', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        const channelId = requestChannelsCreateV3(token, 'newChannel', true).channelId;
        const dmId = requestDmCreateV1(token, []).dmId;
        requestMessageSendV2(token, channelId, 'newMessage');
        requestMessageSenddmV2(token, dmId, 'newMessage');
        let res = userStats(token);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({
            userStats: {
                channelsJoined: [{numChannelsJoined: 0, timeStamp: expect.any(Number)},{numChannelsJoined: 1, timeStamp: expect.any(Number)}],
                dmsJoined: [{numDmsJoined: 0, timeStamp: expect.any(Number)}, {numDmsJoined: 1, timeStamp: expect.any(Number)}],
                messagesSent: [{numMessagesSent: 0, timeStamp: expect.any(Number)}, {numMessagesSent: 1, timeStamp: expect.any(Number)}, {numMessagesSent: 2, timeStamp: expect.any(Number)}],
                involvementRate: 1
            }
        });
    });
    test('/users/stats/v1 tests', () => {
        requestClearV1();
        const token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token
        let res = usersStats(token);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({
            workspaceStats: {
                channelsExist: [{numChannelsExist: 0, timeStamp: expect.any(Number)}],
                dmsExist: [{numDmsExist: 0, timeStamp: expect.any(Number)}],
                messagesExist: [{numMessagesExist: 0, timeStamp: expect.any(Number)}],
                utilizationRate: 0
            }
        });
        const channelId = requestChannelsCreateV3(token, 'newChannel', true).channelId;
        requestDmCreateV1(token, []);
        requestMessageSendV2(token, channelId, 'NewMessage');
        requestAuthRegisterV3('tea@bar.com', 'password', 'Jane', 'Smith');
        res = usersStats(token);
        expect(res.statusCode).toBe(OK);
        expect(JSON.parse(res.body as string)).toStrictEqual({
            workspaceStats: {
                channelsExist: [{numChannelsExist: 0, timeStamp: expect.any(Number)}, {numChannelsExist: 1, timeStamp: expect.any(Number)}],
                dmsExist: [{numDmsExist: 0, timeStamp: expect.any(Number)}, {numDmsExist: 1, timeStamp: expect.any(Number)}],
                messagesExist: [{numMessagesExist: 0, timeStamp: expect.any(Number)}, {numMessagesExist: 1, timeStamp: expect.any(Number)}],
                utilizationRate: 0.5
            }
        });
    });
});

describe('/user/profile/uploadphoto/v1', () => {
    test.each([
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 0, yStart: 0, xEnd: 700, yEnd: 349, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 0, yStart: 0, xEnd: 600, yEnd: 600, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 0, yStart: -1, xEnd: 600, yEnd: 349, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: -1, yStart: 0, xEnd: 600, yEnd: 349, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 400, yStart: 0, xEnd: 300, yEnd: 349, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 0, yStart: 200, xEnd: 600, yEnd: 100, statusCode: 400, result: {error: {message: 'Invalid dimensions'}}},
        {imgUrl: 'http://pngimg.com/uploads/cat/cat_PNG50497.png', xStart: 0, yStart: 0, xEnd: 400, yEnd: 400, statusCode: 400, result: {error: {message: 'Image must be a .jpg'}}},
        {imgUrl: 'http://pngimg.com/uploads/cat/cat_PGN153151351.jpg', xStart: 0, yStart: 0, xEnd: 400, yEnd: 400, statusCode: 400, result: {error: {message: 'Url not valid'}}},
        {imgUrl: 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg', xStart: 251, yStart: 0, xEnd: 600, yEnd: 349, statusCode: OK, result: {}}
    ])('/user/profile/uploadphoto/v1 tests', ({imgUrl, xStart, yStart, xEnd, yEnd, statusCode, result}) => {
        requestClearV1();
        let token = requestAuthRegisterV3('foo@bar.com', 'password', 'John', 'Doe').token;
        let res = uploadProfilePhoto(token, imgUrl, xStart, yStart, xEnd, yEnd);
        expect(res.statusCode).toBe(statusCode);
        expect(JSON.parse(res.body as string)).toStrictEqual(result);
    });
});
