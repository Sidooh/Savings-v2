import moment from 'moment/moment';

export default class ChartAid {
    chartDataSet = async (models, freq = 24) => {
        const startDate = moment().startOf('day');

        let datasets = [], labels = [];

        for (let hour: number = 0; hour < freq; hour++) {
            let label = moment(hour, 'H').format('HHmm'), amount;

            if (models.find(t => t.hour === startDate.hour())) {
                amount = Number(models.find(({hour}) => hour === startDate.hour()).amount);
            } else {
                amount = 0;
            }

            labels.push(label);
            datasets.push(amount);

            startDate.add(1, 'h');
        }

        return {datasets, labels};
    };
}