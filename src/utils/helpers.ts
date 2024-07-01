import NodeCache from 'node-cache';
import jwt from "jsonwebtoken";
import moment from "moment/moment";
import { env } from "./validate.env";
import SidoohPayments from "../services/SidoohPayments";

export const circularReplacer = () => {
    const visited = new WeakSet();

    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (visited.has(value)) return;

            visited.add(value);
        }

        return value;
    };
};

export const Cache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 120 });

export const testToken = 'Bearer ' + jwt.sign({ iat: moment().add(15, 'm').unix() }, env.JWT_KEY)

export const withdrawalCharge = async (amount: number) => {
    const chargeBands = await SidoohPayments.getWithdrawalCharges();

    const chargeBand = chargeBands.find(cb => cb.max>= amount && cb.min <= amount)
    if(!chargeBand) throw new Error('Withdrawal charge not found!')

    return chargeBand.charge
}
