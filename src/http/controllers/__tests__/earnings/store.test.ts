import supertest from 'supertest';
import App from '../../../../app';
import { PersonalAccount } from "../../../../entities/models/PersonalAccount";
import { DefaultAccount } from "../../../../utils/enums";
import { Cache, testToken } from "../../../../utils/helpers";

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

describe('Testing Earnings Deposit', () => {

})
it('should return an error if request data is invalid.', async function () {
    await request
        .post('/api/v1/accounts/earnings')
        .set({ Authorization: testToken })
        .send([{ account_id: 1, locked_amount: 79.8 }])
        .expect(422);

    await request
        .post('/api/v1/accounts/earnings')
        .set({ Authorization: testToken })
        .send([{ account_id: 7, current_amount: 20.2 }])
        .expect(422);

    await request
        .post('/api/v1/accounts/earnings')
        .set({ Authorization: testToken })
        .send()
        .expect(422);
});

it('should deposit earnings if request data is valid.', async function () {
    const accId = 1

    Cache.set('auth_token', testToken, 15 * 60)
    Cache.set(`account_${accId}`, { id: accId })

    let data = [
        { account_id: accId, current_amount: 20.2, locked_amount: 79.8 },
        { account_id: accId, current_amount: 40.4, locked_amount: 159.6 }
    ];

    await request
        .post('/api/v1/accounts/earnings')
        .set({ Authorization: testToken })
        .send(data).expect(202);

    const earnings = await PersonalAccount.find({ select: ['type', 'balance'], where: { account_id: accId } });

    expect(earnings.length).toEqual(2)
    expect(earnings.find(e => e.type === DefaultAccount.CURRENT)?.balance).toBeCloseTo(60.6);
    // expect(earnings[0].event_type).toEqual(data.event_type);
});
