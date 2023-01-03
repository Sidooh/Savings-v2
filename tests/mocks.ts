import axios from 'axios';

/**
 * _________________________________________________________________    MOCKS
 * */

jest.mock('axios'/*, () => ({
    create: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve())
    })),
    get: jest.fn(() => Promise.resolve())
})*/);
export const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('winston', () => ({
    config: {
        syslog: []
    },
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn(),
        align: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn()
    }),
    transports: {
        File: jest.fn(),
        Console: jest.fn()
    }
}));

/*
jest.spyOn(new Sms(new WebSms({
    accessKey: '',
    apiKey   : '',
    clientId : '',
    senderId : ''
})), 'send').mockImplementation(async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValueOnce([]);

    const { data } = await mockedAxios.post('/SendBulkSMS', {});

    return data;
});*/
