import supertest from 'supertest';
import App from '../../../../app';
import { Cache, testToken } from "../../../../utils/helpers";

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

const createPersonalAccount = (accountId: number, createDefaults: boolean = true) => {
    let url = `accounts/${accountId}/defaults`, data
    if (!createDefaults) {
        url = 'personal-accounts'
        data = {
            account_id: 46,
            type: "GOAL",
            target_amount: 1000,
            duration: "3",
            description: "Ford Mustang GT"
        }
    }

    return request
        .post(`/api/v1/${url}`)
        .set({ Authorization: testToken })
        .send(data);
};

it('should fetch a list of personal-accounts.', async function () {
    const accIdOne = 1, accIdTwo = 2
    Cache.set(`account_${accIdOne}`, { id: accIdOne })
    Cache.set(`account_${accIdTwo}`, { id: accIdTwo })

    await createPersonalAccount(accIdOne);
    await createPersonalAccount(accIdTwo);

    const response = await request
        .get('/api/v1/personal-accounts')
        .set({ Authorization: testToken })
        .send()
        .expect(200);

    expect(response.body?.data?.length).toEqual(4);
});
