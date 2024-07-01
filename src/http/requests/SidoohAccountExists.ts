// import Joi from "joi";
// import SidoohAccounts from "../../services/SidoohAccounts";
//
// const custom = Joi.extend(joi => {
//     return {
//         type: 'sidoohAccount',
//         validate(value: any, helpers: Joi.CustomHelpers): any {
//             SidoohAccounts.find(value).catch(e => ({ value, errors: helpers.error('million.base') }))
//         }
//     }
// })
//
// export default custom
