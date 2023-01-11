import supertest from 'supertest';
import App from '../../../../app';
import { env } from "../../../../utils/validate.env";
import { Cache, testToken } from "../../../../utils/helpers";

const { app } = new App(env.PORT);
const request = supertest(app);

const depositEarnings = (account_id: number) => {
    return request
        .post('/api/v1/accounts/earnings')
        .set({ Authorization: testToken })
        .send([{ account_id, current_amount: 20.2, locked_amount: 79.8 }])
        .expect(202);
};

describe('Testing Earnings Retrieval', () => {
    it('should fetch a list of earnings.', async function () {
        const accId = 1

        Cache.set('auth_token', testToken, 15 * 60)
        Cache.set(`account_${accId}`, { id: accId })

        await depositEarnings(accId)

        const response = await request
            .get(`/api/v1/accounts/${accId}/earnings`)
            .set({ Authorization: testToken })
            .send()
            .expect(200);

        expect(response.body?.data?.length).toEqual(2);
    });
})
