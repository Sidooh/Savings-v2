import SidoohService from "../SidoohService";
import { Cache } from "../../utils/helpers";
import { mockedAxios } from "../../../tests/mocks";

describe("Authentication tests", () => {
    it("Should authenticate with accounts service", async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { access_token: 'something nice' }
        });

        await SidoohService.authenticate()

        const token = Cache.get('auth_token')

        expect(token).toEqual('something nice')
    })
})
